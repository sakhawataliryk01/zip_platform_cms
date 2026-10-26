import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { ContentStatus, NoticeItem } from "@/lib/data/notice-shared";
import { MAX_NOTICES } from "@/lib/data/notice-shared";

export type { ContentStatus, NoticeItem } from "@/lib/data/notice-shared";
export { MAX_NOTICES } from "@/lib/data/notice-shared";

type LocalStore = Record<string, { notices: NoticeItem[] }>;

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "merchant-notices.json");

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

function mapRow(row: Record<string, unknown>): NoticeItem {
  return {
    id: String(row.id),
    title: String(row.title || ""),
    titleAr: row.title_ar ? String(row.title_ar) : undefined,
    message: String(row.message || ""),
    messageAr: row.message_ar ? String(row.message_ar) : undefined,
    status: (row.status as ContentStatus) || "INACTIVE",
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  };
}

async function ensureLocal(merchantId: string) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  let store: LocalStore = {};
  try {
    store = JSON.parse(await fs.readFile(STORE_FILE, "utf8")) as LocalStore;
  } catch {
    store = {};
  }
  if (!store[merchantId]) {
    store[merchantId] = { notices: [] };
    await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
  }
  return store[merchantId];
}

async function writeLocal(merchantId: string, notices: NoticeItem[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  let store: LocalStore = {};
  try {
    store = JSON.parse(await fs.readFile(STORE_FILE, "utf8")) as LocalStore;
  } catch {
    store = {};
  }
  store[merchantId] = { notices };
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
}

export async function listNotices(
  merchantId: string,
  options?: { activeOnly?: boolean }
): Promise<NoticeItem[]> {
  try {
    let q = sb()
      .from("app_notices")
      .select(
        "id, title, title_ar, message, message_ar, status, created_at, updated_at"
      )
      .eq("merchant_id", merchantId)
      .order("created_at", { ascending: false });

    if (options?.activeOnly) q = q.eq("status", "ACTIVE");

    const { data, error } = await q;
    if (!error && data) return data.map((row) => mapRow(row));
  } catch {
    // fall through
  }

  let notices = (await ensureLocal(merchantId)).notices;
  if (options?.activeOnly) {
    notices = notices.filter((n) => n.status === "ACTIVE");
  }
  return [...notices].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createNotice(
  merchantId: string,
  input: {
    title: string;
    titleAr?: string;
    message: string;
    messageAr?: string;
    status?: ContentStatus;
  }
): Promise<{ notice: NoticeItem; source: "supabase" | "local" }> {
  const existing = await listNotices(merchantId);
  if (existing.length >= MAX_NOTICES) {
    throw new Error(`Maximum ${MAX_NOTICES} notices allowed`);
  }

  const payload = {
    merchant_id: merchantId,
    title: input.title.trim(),
    title_ar: input.titleAr?.trim() || null,
    message: input.message.trim(),
    message_ar: input.messageAr?.trim() || null,
    status: input.status || "ACTIVE",
  };

  try {
    const { data, error } = await sb()
      .from("app_notices")
      .insert(payload)
      .select(
        "id, title, title_ar, message, message_ar, status, created_at, updated_at"
      )
      .single();

    if (!error && data) {
      return { notice: mapRow(data), source: "supabase" };
    }
  } catch {
    // fall through
  }

  const local = await ensureLocal(merchantId);
  const notice: NoticeItem = {
    id: randomUUID(),
    title: payload.title,
    titleAr: payload.title_ar || undefined,
    message: payload.message,
    messageAr: payload.message_ar || undefined,
    status: payload.status as ContentStatus,
    createdAt: new Date().toISOString(),
  };
  local.notices.unshift(notice);
  await writeLocal(merchantId, local.notices);
  return { notice, source: "local" };
}

export async function updateNotice(
  merchantId: string,
  id: string,
  input: Partial<{
    title: string;
    titleAr: string;
    message: string;
    messageAr: string;
    status: ContentStatus;
  }>
): Promise<{ notice: NoticeItem; source: "supabase" | "local" }> {
  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.titleAr !== undefined) patch.title_ar = input.titleAr.trim() || null;
  if (input.message !== undefined) patch.message = input.message.trim();
  if (input.messageAr !== undefined)
    patch.message_ar = input.messageAr.trim() || null;
  if (input.status !== undefined) patch.status = input.status;

  try {
    const { data, error } = await sb()
      .from("app_notices")
      .update(patch)
      .eq("id", id)
      .eq("merchant_id", merchantId)
      .select(
        "id, title, title_ar, message, message_ar, status, created_at, updated_at"
      )
      .single();

    if (!error && data) {
      return { notice: mapRow(data), source: "supabase" };
    }
  } catch {
    // fall through
  }

  const local = await ensureLocal(merchantId);
  const idx = local.notices.findIndex((n) => n.id === id);
  if (idx < 0) throw new Error("Notice not found");
  local.notices[idx] = {
    ...local.notices[idx],
    ...(input.title !== undefined ? { title: input.title.trim() } : {}),
    ...(input.titleAr !== undefined
      ? { titleAr: input.titleAr.trim() || undefined }
      : {}),
    ...(input.message !== undefined ? { message: input.message.trim() } : {}),
    ...(input.messageAr !== undefined
      ? { messageAr: input.messageAr.trim() || undefined }
      : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    updatedAt: new Date().toISOString(),
  };
  await writeLocal(merchantId, local.notices);
  return { notice: local.notices[idx], source: "local" };
}

export async function deleteNotice(
  merchantId: string,
  id: string
): Promise<{ source: "supabase" | "local" }> {
  try {
    const { error } = await sb()
      .from("app_notices")
      .delete()
      .eq("id", id)
      .eq("merchant_id", merchantId);

    if (!error) return { source: "supabase" };
  } catch {
    // fall through
  }

  const local = await ensureLocal(merchantId);
  await writeLocal(
    merchantId,
    local.notices.filter((n) => n.id !== id)
  );
  return { source: "local" };
}
