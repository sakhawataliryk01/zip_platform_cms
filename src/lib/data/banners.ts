import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import {
  BANNER_BUCKET,
  MAX_BANNERS,
  type BannerItem,
  type ContentStatus,
} from "@/lib/data/banner-shared";

export type { BannerItem, ContentStatus } from "@/lib/data/banner-shared";
export { BANNER_BUCKET, MAX_BANNERS } from "@/lib/data/banner-shared";

type LocalStore = Record<string, { banners: BannerItem[] }>;

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "merchant-banners.json");

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

function defaultBanners(): BannerItem[] {
  return [];
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
    store[merchantId] = { banners: defaultBanners() };
    await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
  }
  return store[merchantId];
}

async function writeLocal(merchantId: string, banners: BannerItem[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  let store: LocalStore = {};
  try {
    store = JSON.parse(await fs.readFile(STORE_FILE, "utf8")) as LocalStore;
  } catch {
    store = {};
  }
  store[merchantId] = { banners };
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
}

function mapRow(row: Record<string, unknown>): BannerItem {
  return {
    id: String(row.id),
    title: String(row.title),
    titleAr: row.title_ar ? String(row.title_ar) : undefined,
    imageUrl: row.image_url ? String(row.image_url) : undefined,
    linkUrl: row.link_url ? String(row.link_url) : undefined,
    sortOrder: Number(row.sort_order ?? 0),
    status: (row.status as ContentStatus) || "INACTIVE",
    createdAt: String(row.created_at || new Date().toISOString()),
  };
}

export async function listBanners(merchantId: string): Promise<BannerItem[]> {
  try {
    const { data, error } = await sb()
      .from("banners")
      .select(
        "id, title, title_ar, image_url, link_url, sort_order, status, created_at"
      )
      .eq("merchant_id", merchantId)
      .order("sort_order", { ascending: true });

    if (!error && data) return data.map((row) => mapRow(row));
  } catch {
    // fall through
  }
  return (await ensureLocal(merchantId)).banners;
}

/** Upload image to Supabase Storage bucket `banner`. Returns public URL. */
export async function uploadBannerImage(
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
    .storage.from(BANNER_BUCKET)
    .upload(objectPath, bytes, {
      contentType,
      upsert: false,
      cacheControl: "3600",
    });

  if (error) {
    throw new Error(
      error.message.includes("row-level security") ||
        error.message.includes("policy")
        ? "Storage blocked by RLS. Run database/storage-banner-bucket.sql in Supabase SQL Editor."
        : `Upload failed: ${error.message}`
    );
  }

  const { data } = sb().storage.from(BANNER_BUCKET).getPublicUrl(objectPath);
  if (!data?.publicUrl) {
    throw new Error("Upload succeeded but public URL was not returned");
  }
  return data.publicUrl;
}

export async function createBanner(
  merchantId: string,
  input: {
    title: string;
    titleAr?: string;
    imageUrl?: string;
    linkUrl?: string;
    sortOrder?: number;
    status?: ContentStatus;
  }
): Promise<{ banner: BannerItem; source: "supabase" | "local" }> {
  const existing = await listBanners(merchantId);
  if (existing.length >= MAX_BANNERS) {
    throw new Error(`Maximum ${MAX_BANNERS} banners allowed`);
  }

  const payload = {
    merchant_id: merchantId,
    title: input.title.trim(),
    title_ar: input.titleAr?.trim() || null,
    image_url: input.imageUrl?.trim() || null,
    link_url: input.linkUrl?.trim() || null,
    sort_order: input.sortOrder ?? 0,
    status: input.status || "ACTIVE",
  };

  try {
    const { data, error } = await sb()
      .from("banners")
      .insert(payload)
      .select(
        "id, title, title_ar, image_url, link_url, sort_order, status, created_at"
      )
      .single();

    if (!error && data) {
      return { banner: mapRow(data), source: "supabase" };
    }
  } catch {
    // fall through
  }

  const local = await ensureLocal(merchantId);
  const banner: BannerItem = {
    id: randomUUID(),
    title: payload.title,
    titleAr: payload.title_ar || undefined,
    imageUrl: payload.image_url || undefined,
    linkUrl: payload.link_url || undefined,
    sortOrder: payload.sort_order,
    status: payload.status as ContentStatus,
    createdAt: new Date().toISOString(),
  };
  local.banners.push(banner);
  await writeLocal(merchantId, local.banners);
  return { banner, source: "local" };
}

export async function updateBanner(
  merchantId: string,
  id: string,
  input: Partial<{
    title: string;
    titleAr: string;
    imageUrl: string;
    linkUrl: string;
    sortOrder: number;
    status: ContentStatus;
  }>
): Promise<{ banner: BannerItem; source: "supabase" | "local" }> {
  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.titleAr !== undefined) patch.title_ar = input.titleAr.trim() || null;
  if (input.imageUrl !== undefined)
    patch.image_url = input.imageUrl.trim() || null;
  if (input.linkUrl !== undefined) patch.link_url = input.linkUrl.trim() || null;
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder;
  if (input.status !== undefined) patch.status = input.status;

  try {
    const { data, error } = await sb()
      .from("banners")
      .update(patch)
      .eq("id", id)
      .eq("merchant_id", merchantId)
      .select(
        "id, title, title_ar, image_url, link_url, sort_order, status, created_at"
      )
      .single();

    if (!error && data) {
      return { banner: mapRow(data), source: "supabase" };
    }
  } catch {
    // fall through
  }

  const local = await ensureLocal(merchantId);
  const idx = local.banners.findIndex((b) => b.id === id);
  if (idx < 0) throw new Error("Banner not found");
  local.banners[idx] = {
    ...local.banners[idx],
    ...(input.title !== undefined ? { title: input.title.trim() } : {}),
    ...(input.titleAr !== undefined
      ? { titleAr: input.titleAr.trim() || undefined }
      : {}),
    ...(input.imageUrl !== undefined
      ? { imageUrl: input.imageUrl.trim() || undefined }
      : {}),
    ...(input.linkUrl !== undefined
      ? { linkUrl: input.linkUrl.trim() || undefined }
      : {}),
    ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
  };
  await writeLocal(merchantId, local.banners);
  return { banner: local.banners[idx], source: "local" };
}

export async function deleteBanner(
  merchantId: string,
  id: string
): Promise<{ source: "supabase" | "local" }> {
  try {
    const { data: existing } = await sb()
      .from("banners")
      .select("image_url")
      .eq("id", id)
      .eq("merchant_id", merchantId)
      .maybeSingle();

    const { error } = await sb()
      .from("banners")
      .delete()
      .eq("id", id)
      .eq("merchant_id", merchantId);

    if (!error) {
      const imageUrl = existing?.image_url as string | undefined;
      if (imageUrl?.includes(`/object/public/${BANNER_BUCKET}/`)) {
        const objectPath = imageUrl.split(
          `/object/public/${BANNER_BUCKET}/`
        )[1];
        if (objectPath) {
          await sb().storage.from(BANNER_BUCKET).remove([objectPath]);
        }
      }
      return { source: "supabase" };
    }
  } catch {
    // fall through
  }

  const local = await ensureLocal(merchantId);
  await writeLocal(
    merchantId,
    local.banners.filter((b) => b.id !== id)
  );
  return { source: "local" };
}
