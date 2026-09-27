import { promises as fs } from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import type { Merchant, MerchantStatus } from "@/types";
import { mockMerchants } from "@/lib/mock/data";

export type CreateMerchantInput = {
  name: string;
  email: string;
  phone: string;
  password: string;
  businessName: string;
  category: string;
  country?: string;
  city?: string;
  address?: string;
  zidStoreUrl?: string;
  zidStoreId?: string;
  plan?: string;
  status?: MerchantStatus;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const LOCAL_FILE = path.join(DATA_DIR, "merchants.json");

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

async function readLocal(): Promise<Merchant[]> {
  try {
    const raw = await fs.readFile(LOCAL_FILE, "utf8");
    return JSON.parse(raw) as Merchant[];
  } catch {
    return [];
  }
}

async function writeLocal(merchants: Merchant[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(merchants, null, 2), "utf8");
}

async function fetchFromSupabase(): Promise<Merchant[] | null> {
  try {
    const client = sb();
    const { data: merchants, error } = await client
      .from("merchants")
      .select(
        "id, user_id, business_name, category, phone, country, city, address, status, plan_id, created_at"
      )
      .order("created_at", { ascending: false });

    if (error || !merchants?.length) return null;

    const { data: users } = await client
      .from("users")
      .select("id, name, email, last_login_at");

    const { data: plans } = await client
      .from("subscription_plans")
      .select("id, name");

    const { data: stores } = await client
      .from("zid_stores")
      .select("merchant_id, store_id, store_url, store_name");

    const { data: apps } = await client
      .from("applications")
      .select("merchant_id, status");

    const userMap = new Map((users || []).map((u) => [u.id, u]));
    const planMap = new Map((plans || []).map((p) => [p.id, p.name]));
    const storeMap = new Map((stores || []).map((s) => [s.merchant_id, s]));
    const appMap = new Map((apps || []).map((a) => [a.merchant_id, a.status]));

    return merchants.map((m) => {
      const user = userMap.get(m.user_id);
      const store = storeMap.get(m.id);
      return {
        id: m.id,
        userId: m.user_id,
        name: user?.name || m.business_name,
        email: user?.email || "",
        phone: m.phone || "",
        businessName: m.business_name,
        category: m.category || "",
        country: m.country || "",
        city: m.city || "",
        address: m.address || "",
        status: m.status as MerchantStatus,
        subscription: (m.plan_id && planMap.get(m.plan_id)) || "",
        zidStore: store?.store_url || store?.store_name,
        zidStoreId: store?.store_id,
        appStatus: appMap.get(m.id),
        createdAt: m.created_at,
        lastLoginAt: user?.last_login_at || undefined,
      } as Merchant;
    });
  } catch {
    return null;
  }
}

export async function listMerchants(): Promise<{
  merchants: Merchant[];
  source: "supabase" | "local";
}> {
  const fromDb = await fetchFromSupabase();
  const localExtra = await readLocal();

  if (fromDb) {
    const dbIds = new Set(fromDb.map((m) => m.id));
    const dbEmails = new Set(fromDb.map((m) => m.email.toLowerCase()));
    const extras = localExtra.filter(
      (m) => !dbIds.has(m.id) && !dbEmails.has(m.email.toLowerCase())
    );
    return {
      merchants: [...extras, ...fromDb].sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
      ),
      source: "supabase",
    };
  }

  // Fallback: seed mock + locally created
  const merged = [...localExtra];
  for (const m of mockMerchants) {
    if (!merged.some((x) => x.id === m.id || x.email === m.email)) {
      merged.push(m);
    }
  }
  return {
    merchants: merged.sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
    ),
    source: "local",
  };
}

async function createInSupabase(
  input: CreateMerchantInput
): Promise<Merchant | null> {
  try {
    const client = sb();
    const passwordHash = await bcrypt.hash(input.password, 10);
    const userId = randomUUID();
    const merchantId = randomUUID();

    const { data: plan } = await client
      .from("subscription_plans")
      .select("id, name")
      .eq("name", input.plan || "Professional")
      .maybeSingle();

    const { error: userError } = await client.from("users").insert({
      id: userId,
      name: input.name,
      email: input.email.trim().toLowerCase(),
      password_hash: passwordHash,
      role: "MERCHANT",
      status: input.status === "PENDING" ? "PENDING" : "ACTIVE",
    });

    if (userError) {
      console.error("Supabase user insert failed:", userError.message);
      return null;
    }

    const { error: merchantError } = await client.from("merchants").insert({
      id: merchantId,
      user_id: userId,
      business_name: input.businessName,
      category: input.category,
      phone: input.phone,
      country: input.country || "Saudi Arabia",
      city: input.city || "",
      address: input.address || "",
      status: input.status || "ACTIVE",
      plan_id: plan?.id || null,
    });

    if (merchantError) {
      console.error("Supabase merchant insert failed:", merchantError.message);
      // cleanup user if merchant failed
      await client.from("users").delete().eq("id", userId);
      return null;
    }

    if (input.zidStoreUrl || input.zidStoreId) {
      await client.from("zid_stores").insert({
        merchant_id: merchantId,
        store_id: input.zidStoreId || null,
        store_name: input.businessName,
        store_url: input.zidStoreUrl || null,
        connection_status: input.zidStoreUrl ? "CONNECTED" : "DISCONNECTED",
      });
    }

    return {
      id: merchantId,
      userId,
      name: input.name,
      email: input.email.trim().toLowerCase(),
      phone: input.phone,
      businessName: input.businessName,
      category: input.category,
      country: input.country || "Saudi Arabia",
      city: input.city || "",
      address: input.address || "",
      status: input.status || "ACTIVE",
      subscription: plan?.name || input.plan || "Professional",
      zidStore: input.zidStoreUrl,
      zidStoreId: input.zidStoreId,
      createdAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error("createInSupabase error", err);
    return null;
  }
}

async function createLocal(input: CreateMerchantInput): Promise<Merchant> {
  const merchant: Merchant = {
    id: randomUUID(),
    userId: randomUUID(),
    name: input.name,
    email: input.email.trim().toLowerCase(),
    phone: input.phone,
    businessName: input.businessName,
    category: input.category,
    country: input.country || "Saudi Arabia",
    city: input.city || "",
    address: input.address || "",
    status: input.status || "ACTIVE",
    subscription: input.plan || "Professional",
    zidStore: input.zidStoreUrl,
    zidStoreId: input.zidStoreId,
    createdAt: new Date().toISOString(),
  };

  const existing = await readLocal();
  existing.unshift(merchant);
  await writeLocal(existing);
  return merchant;
}

export async function createMerchant(input: CreateMerchantInput): Promise<{
  merchant: Merchant;
  source: "supabase" | "local";
}> {
  const email = input.email.trim().toLowerCase();

  // Duplicate check against current list
  const { merchants } = await listMerchants();
  if (merchants.some((m) => m.email.toLowerCase() === email)) {
    throw new Error("A merchant with this email already exists");
  }

  const fromDb = await createInSupabase({ ...input, email });
  if (fromDb) {
    return { merchant: fromDb, source: "supabase" };
  }

  // Fallback when RLS blocks writes — still persists locally so UI works
  const local = await createLocal({ ...input, email });
  return { merchant: local, source: "local" };
}

export async function updateMerchantStatus(
  id: string,
  status: MerchantStatus
): Promise<boolean> {
  const client = sb();
  const { error } = await client
    .from("merchants")
    .update({ status })
    .eq("id", id);

  if (!error) return true;

  const local = await readLocal();
  const next = local.map((m) => (m.id === id ? { ...m, status } : m));
  await writeLocal(next);
  return true;
}

export async function deleteMerchant(id: string): Promise<boolean> {
  const client = sb();
  const { data: merchant } = await client
    .from("merchants")
    .select("user_id")
    .eq("id", id)
    .maybeSingle();

  if (merchant) {
    await client.from("merchants").delete().eq("id", id);
    if (merchant.user_id) {
      await client.from("users").delete().eq("id", merchant.user_id);
    }
  }

  const local = await readLocal();
  await writeLocal(local.filter((m) => m.id !== id));
  return true;
}
