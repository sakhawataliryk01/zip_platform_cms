import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import {
  INTRO_POSTERS_BUCKET,
  MAX_INTRO_POSTERS,
  type ContentStatus,
  type IntroPosterItem,
} from "@/lib/data/intro-poster-shared";

export type { ContentStatus, IntroPosterItem } from "@/lib/data/intro-poster-shared";
export {
  INTRO_POSTERS_BUCKET,
  MAX_INTRO_POSTERS,
} from "@/lib/data/intro-poster-shared";

type LocalStore = Record<string, { posters: IntroPosterItem[] }>;

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "merchant-intro-posters.json");

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
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
    store[merchantId] = { posters: [] };
    await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
  }
  return store[merchantId];
}

async function writeLocal(merchantId: string, posters: IntroPosterItem[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  let store: LocalStore = {};
  try {
    store = JSON.parse(await fs.readFile(STORE_FILE, "utf8")) as LocalStore;
  } catch {
    store = {};
  }
  store[merchantId] = { posters };
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
}

function mapRow(row: Record<string, unknown>): IntroPosterItem {
  return {
    id: String(row.id),
    title: String(row.title || ""),
    titleAr: row.title_ar ? String(row.title_ar) : undefined,
    imageUrl: String(row.image_url || ""),
    sortOrder: Number(row.sort_order ?? 0),
    status: (row.status as ContentStatus) || "INACTIVE",
    createdAt: String(row.created_at || new Date().toISOString()),
  };
}

export async function listIntroPosters(
  merchantId: string,
  options?: { activeOnly?: boolean }
): Promise<IntroPosterItem[]> {
  try {
    let q = sb()
      .from("intro_posters")
      .select(
        "id, title, title_ar, image_url, sort_order, status, created_at"
      )
      .eq("merchant_id", merchantId)
      .order("sort_order", { ascending: true });

    if (options?.activeOnly) q = q.eq("status", "ACTIVE");

    const { data, error } = await q;
    if (!error && data) return data.map((row) => mapRow(row));
  } catch {
    // fall through
  }

  let posters = (await ensureLocal(merchantId)).posters;
  if (options?.activeOnly) {
    posters = posters.filter((p) => p.status === "ACTIVE");
  }
  return [...posters].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function uploadIntroPosterImage(
  merchantId: string,
  file: File | Blob,
  fileName: string
): Promise<string> {
  const ext = fileName.includes(".")
    ? fileName.split(".").pop()?.toLowerCase() || "jpg"
    : "jpg";
  const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext)
    ? ext
    : "jpg";
  const objectPath = `${merchantId}/${Date.now()}-${randomUUID()}.${safeExt}`;

  const bytes = Buffer.from(await file.arrayBuffer());
  const contentType =
    (file as File).type ||
    (safeExt === "png"
      ? "image/png"
      : safeExt === "webp"
        ? "image/webp"
        : safeExt === "gif"
          ? "image/gif"
          : "image/jpeg");

  const { error } = await sb()
    .storage.from(INTRO_POSTERS_BUCKET)
    .upload(objectPath, bytes, {
      contentType,
      upsert: false,
      cacheControl: "3600",
    });

  if (error) {
    throw new Error(
      error.message.includes("row-level security") ||
        error.message.includes("policy")
        ? "Storage blocked by RLS. Run database/storage-intro-posters-bucket.sql in Supabase SQL Editor."
        : `Upload failed: ${error.message}`
    );
  }

  const { data } = sb()
    .storage.from(INTRO_POSTERS_BUCKET)
    .getPublicUrl(objectPath);
  if (!data?.publicUrl) {
    throw new Error("Upload succeeded but public URL was not returned");
  }
  return data.publicUrl;
}

async function removeStorageImage(imageUrl?: string) {
  if (!imageUrl?.includes(`/object/public/${INTRO_POSTERS_BUCKET}/`)) return;
  const objectPath = imageUrl.split(
    `/object/public/${INTRO_POSTERS_BUCKET}/`
  )[1];
  if (objectPath) {
    await sb().storage.from(INTRO_POSTERS_BUCKET).remove([objectPath]);
  }
}

export async function createIntroPoster(
  merchantId: string,
  input: {
    title: string;
    titleAr?: string;
    imageUrl: string;
    sortOrder?: number;
    status?: ContentStatus;
  }
): Promise<{ poster: IntroPosterItem; source: "supabase" | "local" }> {
  const existing = await listIntroPosters(merchantId);
  if (existing.length >= MAX_INTRO_POSTERS) {
    throw new Error(`Maximum ${MAX_INTRO_POSTERS} intro posters allowed`);
  }

  const payload = {
    merchant_id: merchantId,
    title: input.title.trim() || `Poster ${existing.length + 1}`,
    title_ar: input.titleAr?.trim() || null,
    image_url: input.imageUrl.trim(),
    sort_order: input.sortOrder ?? existing.length,
    status: input.status || "ACTIVE",
  };

  if (!payload.image_url) {
    throw new Error("Image is required");
  }

  try {
    const { data, error } = await sb()
      .from("intro_posters")
      .insert(payload)
      .select(
        "id, title, title_ar, image_url, sort_order, status, created_at"
      )
      .single();

    if (!error && data) {
      return { poster: mapRow(data), source: "supabase" };
    }
  } catch {
    // fall through
  }

  const local = await ensureLocal(merchantId);
  const poster: IntroPosterItem = {
    id: randomUUID(),
    title: payload.title,
    titleAr: payload.title_ar || undefined,
    imageUrl: payload.image_url,
    sortOrder: payload.sort_order,
    status: payload.status as ContentStatus,
    createdAt: new Date().toISOString(),
  };
  local.posters.push(poster);
  await writeLocal(merchantId, local.posters);
  return { poster, source: "local" };
}

export async function updateIntroPoster(
  merchantId: string,
  id: string,
  input: Partial<{
    title: string;
    titleAr: string;
    imageUrl: string;
    sortOrder: number;
    status: ContentStatus;
  }>
): Promise<{ poster: IntroPosterItem; source: "supabase" | "local" }> {
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.titleAr !== undefined) patch.title_ar = input.titleAr.trim() || null;
  if (input.imageUrl !== undefined)
    patch.image_url = input.imageUrl.trim() || null;
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder;
  if (input.status !== undefined) patch.status = input.status;

  try {
    const { data, error } = await sb()
      .from("intro_posters")
      .update(patch)
      .eq("id", id)
      .eq("merchant_id", merchantId)
      .select(
        "id, title, title_ar, image_url, sort_order, status, created_at"
      )
      .single();

    if (!error && data) {
      return { poster: mapRow(data), source: "supabase" };
    }
  } catch {
    // fall through
  }

  const local = await ensureLocal(merchantId);
  const idx = local.posters.findIndex((p) => p.id === id);
  if (idx < 0) throw new Error("Intro poster not found");
  local.posters[idx] = {
    ...local.posters[idx],
    ...(input.title !== undefined ? { title: input.title.trim() } : {}),
    ...(input.titleAr !== undefined
      ? { titleAr: input.titleAr.trim() || undefined }
      : {}),
    ...(input.imageUrl !== undefined
      ? { imageUrl: input.imageUrl.trim() }
      : {}),
    ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
  };
  await writeLocal(merchantId, local.posters);
  return { poster: local.posters[idx], source: "local" };
}

/** Persist display order from drag-and-drop (orderedIds = top → bottom). */
export async function reorderIntroPosters(
  merchantId: string,
  orderedIds: string[]
): Promise<{ posters: IntroPosterItem[]; source: "supabase" | "local" }> {
  const uniqueIds = [...new Set(orderedIds.map((id) => String(id).trim()).filter(Boolean))];
  if (uniqueIds.length === 0) {
    throw new Error("orderedIds is required");
  }

  const existing = await listIntroPosters(merchantId);
  const existingIds = new Set(existing.map((p) => p.id));
  for (const id of uniqueIds) {
    if (!existingIds.has(id)) {
      throw new Error("One or more posters were not found");
    }
  }

  // Keep any posters not in the payload at the end (stable)
  const remaining = existing
    .filter((p) => !uniqueIds.includes(p.id))
    .map((p) => p.id);
  const finalOrder = [...uniqueIds, ...remaining];

  let supabaseOk = true;
  try {
    for (let i = 0; i < finalOrder.length; i++) {
      const { error } = await sb()
        .from("intro_posters")
        .update({ sort_order: i, updated_at: new Date().toISOString() })
        .eq("id", finalOrder[i])
        .eq("merchant_id", merchantId);
      if (error) {
        supabaseOk = false;
        break;
      }
    }
    if (supabaseOk) {
      return {
        source: "supabase",
        posters: await listIntroPosters(merchantId),
      };
    }
  } catch {
    supabaseOk = false;
  }

  const local = await ensureLocal(merchantId);
  const byId = new Map(local.posters.map((p) => [p.id, p]));
  const next = finalOrder
    .map((id, index) => {
      const poster = byId.get(id);
      if (!poster) return null;
      return { ...poster, sortOrder: index };
    })
    .filter(Boolean) as IntroPosterItem[];
  await writeLocal(merchantId, next);
  return { source: "local", posters: next };
}

export async function deleteIntroPoster(
  merchantId: string,
  id: string
): Promise<{ source: "supabase" | "local" }> {
  try {
    const { data: existing } = await sb()
      .from("intro_posters")
      .select("image_url")
      .eq("id", id)
      .eq("merchant_id", merchantId)
      .maybeSingle();

    const { error } = await sb()
      .from("intro_posters")
      .delete()
      .eq("id", id)
      .eq("merchant_id", merchantId);

    if (!error) {
      await removeStorageImage(existing?.image_url as string | undefined);
      return { source: "supabase" };
    }
  } catch {
    // fall through
  }

  const local = await ensureLocal(merchantId);
  const target = local.posters.find((p) => p.id === id);
  await writeLocal(
    merchantId,
    local.posters.filter((p) => p.id !== id)
  );
  if (target?.imageUrl) await removeStorageImage(target.imageUrl).catch(() => {});
  return { source: "local" };
}
