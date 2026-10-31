import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import path from "path";
import {
  DEMO_MERCHANT_ID,
  type ZidProduct,
  type ZidStoreCredentials,
} from "@/lib/data/zid-store-shared";

export type { ZidProduct, ZidStoreCredentials } from "@/lib/data/zid-store-shared";
export { DEMO_MERCHANT_ID } from "@/lib/data/zid-store-shared";

type LocalStore = Record<string, ZidStoreCredentials>;

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "merchant-zid-stores.json");

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

async function readLocal(): Promise<LocalStore> {
  try {
    return JSON.parse(await fs.readFile(STORE_FILE, "utf8")) as LocalStore;
  } catch {
    return {};
  }
}

async function writeLocal(store: LocalStore) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
}

function mapRow(merchantId: string, data: Record<string, unknown>): ZidStoreCredentials {
  const authorization =
    (data.authorization_token ? String(data.authorization_token) : "") ||
    // legacy: older rows stuffed Authorization into refresh_token
    (data.refresh_token ? String(data.refresh_token) : "") ||
    undefined;

  return {
    merchantId,
    storeId: String(data.store_id || ""),
    storeName: data.store_name ? String(data.store_name) : undefined,
    storeUrl: data.store_url ? String(data.store_url) : undefined,
    accessToken: String(data.access_token || ""),
    authorizationToken: authorization || undefined,
    refreshToken: data.oauth_refresh_token
      ? String(data.oauth_refresh_token)
      : undefined,
    tokenExpiresAt: data.token_expires_at
      ? String(data.token_expires_at)
      : undefined,
    connectionStatus:
      (data.connection_status as ZidStoreCredentials["connectionStatus"]) ||
      "CONNECTED",
    lastSyncedAt: data.last_synced_at
      ? String(data.last_synced_at)
      : undefined,
    productsCount: Number(data.products_count || 0),
  };
}

function fromEnv(merchantId: string): ZidStoreCredentials | null {
  const storeId = process.env.ZID_STORE_ID?.trim();
  const accessToken = process.env.ZID_ACCESS_TOKEN?.trim();
  if (!storeId || !accessToken) return null;
  if (merchantId !== DEMO_MERCHANT_ID && !process.env.ZID_APPLY_ENV_TO_ALL) {
    return null;
  }
  return {
    merchantId,
    storeId,
    accessToken,
    authorizationToken: process.env.ZID_AUTHORIZATION_TOKEN?.trim() || undefined,
    connectionStatus: "CONNECTED",
    storeName: process.env.ZID_STORE_NAME?.trim() || "Zid Store",
  };
}

export async function getZidStoreCredentials(
  merchantId: string
): Promise<ZidStoreCredentials | null> {
  try {
    const { data, error } = await sb()
      .from("zid_stores")
      .select("*")
      .eq("merchant_id", merchantId)
      .maybeSingle();

    if (!error && data?.access_token && data?.store_id) {
      return mapRow(merchantId, data as Record<string, unknown>);
    }
  } catch {
    // fall through
  }

  const local = await readLocal();
  if (local[merchantId]?.accessToken && local[merchantId]?.storeId) {
    return local[merchantId];
  }

  return fromEnv(merchantId);
}

export async function findMerchantIdByStoreId(
  storeId: string
): Promise<string | null> {
  const trimmed = storeId.trim();
  if (!trimmed) return null;

  try {
    const { data, error } = await sb()
      .from("zid_stores")
      .select("merchant_id")
      .eq("store_id", trimmed)
      .maybeSingle();
    if (!error && data?.merchant_id) return String(data.merchant_id);
  } catch {
    // fall through
  }

  const local = await readLocal();
  const hit = Object.values(local).find((c) => c.storeId === trimmed);
  return hit?.merchantId || null;
}

export type SaveZidStoreInput = {
  storeId: string;
  accessToken: string;
  authorizationToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
  storeName?: string;
  storeUrl?: string;
};

export async function saveZidStoreCredentials(
  merchantId: string,
  input: SaveZidStoreInput
): Promise<{ source: "supabase" | "local"; credentials: ZidStoreCredentials }> {
  const authorization = input.authorizationToken?.trim() || null;
  const oauthRefresh = input.refreshToken?.trim() || null;

  const payload: Record<string, unknown> = {
    merchant_id: merchantId,
    store_id: input.storeId.trim(),
    access_token: input.accessToken.trim(),
    authorization_token: authorization,
    // Keep legacy column in sync with Authorization for older readers
    refresh_token: authorization,
    oauth_refresh_token: oauthRefresh,
    token_expires_at: input.tokenExpiresAt?.trim() || null,
    store_name: input.storeName?.trim() || "Zid Store",
    store_url: input.storeUrl?.trim() || null,
    connection_status: "CONNECTED",
    last_synced_at: new Date().toISOString(),
  };

  const credentials: ZidStoreCredentials = {
    merchantId,
    storeId: String(payload.store_id),
    accessToken: String(payload.access_token),
    authorizationToken: authorization || undefined,
    refreshToken: oauthRefresh || undefined,
    tokenExpiresAt: input.tokenExpiresAt?.trim() || undefined,
    storeName: String(payload.store_name),
    storeUrl: (payload.store_url as string | null) || undefined,
    connectionStatus: "CONNECTED",
    lastSyncedAt: String(payload.last_synced_at),
  };

  try {
    const existing = await sb()
      .from("zid_stores")
      .select("id")
      .eq("merchant_id", merchantId)
      .maybeSingle();

    const q = existing.data?.id
      ? sb().from("zid_stores").update(payload).eq("merchant_id", merchantId)
      : sb().from("zid_stores").insert(payload);

    const { error } = await q;
    if (!error) return { source: "supabase", credentials };

    // If new columns are missing, retry without them so local/dev still works
    if (String(error.message || "").includes("authorization_token") ||
        String(error.message || "").includes("oauth_refresh_token") ||
        String(error.code || "") === "PGRST204") {
      const legacy = {
        merchant_id: merchantId,
        store_id: input.storeId.trim(),
        access_token: input.accessToken.trim(),
        refresh_token: authorization,
        store_name: input.storeName?.trim() || "Zid Store",
        store_url: input.storeUrl?.trim() || null,
        connection_status: "CONNECTED",
        last_synced_at: new Date().toISOString(),
      };
      const legacyQ = existing.data?.id
        ? sb().from("zid_stores").update(legacy).eq("merchant_id", merchantId)
        : sb().from("zid_stores").insert(legacy);
      const { error: legacyError } = await legacyQ;
      if (!legacyError) return { source: "supabase", credentials };
      console.error("zid_stores save failed:", legacyError);
    } else {
      console.error("zid_stores save failed:", error);
    }
  } catch (err) {
    console.error("zid_stores save exception:", err);
  }

  const local = await readLocal();
  local[merchantId] = credentials;
  await writeLocal(local);
  return { source: "local", credentials };
}

export async function fetchZidManagerProfile(tokens: {
  authorization: string;
  accessToken: string;
}): Promise<{
  storeId: string;
  storeName?: string;
  storeUrl?: string;
  email?: string;
}> {
  const res = await fetch("https://api.zid.sa/v1/managers/account/profile", {
    headers: {
      Accept: "application/json",
      "Accept-Language": "en",
      Authorization: `Bearer ${tokens.authorization}`,
      "X-Manager-Token": tokens.accessToken,
      "Access-Token": tokens.accessToken,
      Role: "Manager",
    },
    cache: "no-store",
  });

  const data = (await res.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (!res.ok || !data) {
    const message =
      (data as { message?: string } | null)?.message ||
      `Failed to load Zid manager profile (${res.status})`;
    throw new Error(String(message));
  }

  const store = (data.store || {}) as Record<string, unknown>;
  const user = (data.user || {}) as Record<string, unknown>;
  const storeId = String(store.id ?? store.store_id ?? data.store_id ?? "");
  if (!storeId) {
    throw new Error("Zid profile response did not include store.id");
  }

  return {
    storeId,
    storeName: store.name
      ? String(store.name)
      : store.title
        ? String(store.title)
        : undefined,
    storeUrl: store.url
      ? String(store.url)
      : store.permalink
        ? String(store.permalink)
        : undefined,
    email: user.email ? String(user.email) : undefined,
  };
}

export async function fetchZidProducts(
  merchantId: string,
  options?: { page?: number; pageSize?: number; q?: string }
): Promise<{ products: ZidProduct[]; total: number }> {
  const creds = await getZidStoreCredentials(merchantId);
  if (!creds) {
    throw new Error(
      "Zid store is not connected. Save Store ID and Access Token first."
    );
  }

  const page = options?.page || 1;
  const pageSize = options?.pageSize || 50;
  const url = new URL("https://api.zid.sa/v1/products/");
  url.searchParams.set("page", String(page));
  url.searchParams.set("page_size", String(pageSize));
  if (options?.q) url.searchParams.set("q", options.q);

  const authorization =
    creds.authorizationToken ||
    process.env.ZID_AUTHORIZATION_TOKEN?.trim() ||
    creds.accessToken;

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${authorization}`,
      "Access-Token": creds.accessToken,
      "X-Manager-Token": creds.accessToken,
      "Store-Id": creds.storeId,
      Role: "Manager",
      "Accept-Language": "en",
    },
    next: { revalidate: 0 },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      data?.message ||
      data?.detail ||
      data?.error ||
      `Zid products request failed (${res.status})`;
    throw new Error(String(message));
  }

  const results = (data?.results || data?.data || data?.products || []) as Array<
    Record<string, unknown>
  >;

  const products: ZidProduct[] = results.map((p) => {
    const id = String(p.id ?? p.uuid ?? p.product_id ?? "");
    const nameObj =
      p.name && typeof p.name === "object"
        ? (p.name as { en?: string; ar?: string })
        : null;
    const name =
      (typeof p.name === "string" && p.name) ||
      nameObj?.en ||
      nameObj?.ar ||
      (typeof p.title === "string" ? p.title : "") ||
      "Product";
    const nameAr =
      nameObj?.ar ||
      (typeof p.name_ar === "string" ? p.name_ar : undefined);
    const images = (p.images || p.images_urls || []) as Array<
      | string
      | {
          url?: string;
          image?: {
            full_size?: string;
            thumbnail?: string;
            medium?: string;
          };
        }
    >;
    const firstImage = images[0];
    const imageUrl =
      typeof firstImage === "string"
        ? firstImage
        : firstImage?.image?.thumbnail ||
          firstImage?.image?.medium ||
          firstImage?.image?.full_size ||
          firstImage?.url ||
          (typeof p.image === "string" ? p.image : undefined) ||
          (typeof p.thumbnail === "string" ? p.thumbnail : undefined);

    return {
      id,
      name,
      nameAr: nameAr || undefined,
      sku: p.sku ? String(p.sku) : undefined,
      imageUrl: imageUrl || undefined,
      price: Number(p.price ?? p.sale_price ?? 0) || undefined,
      currency: p.currency ? String(p.currency) : "SAR",
    };
  });

  const total = Number(
    data?.count ?? data?.total ?? data?.meta?.total ?? products.length
  );

  return { products: products.filter((p) => p.id), total };
}
