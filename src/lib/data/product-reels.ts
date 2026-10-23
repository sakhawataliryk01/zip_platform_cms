import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { ProductYoutubeReel } from "@/lib/data/product-reel-shared";
import { validateYoutubeReelUrl } from "@/lib/youtube";

export type { ProductYoutubeReel } from "@/lib/data/product-reel-shared";

type LocalStore = Record<string, ProductYoutubeReel[]>;

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "product-youtube-reels.json");

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

function mapRow(row: Record<string, unknown>): ProductYoutubeReel {
  return {
    id: String(row.id),
    merchantId: String(row.merchant_id),
    productId: String(row.product_id),
    productName: row.product_name ? String(row.product_name) : undefined,
    productSku: row.product_sku ? String(row.product_sku) : undefined,
    productImageUrl: row.product_image_url
      ? String(row.product_image_url)
      : undefined,
    youtubeVideoId: String(row.youtube_video_id),
    title: String(row.title),
    thumbnail: row.thumbnail ? String(row.thumbnail) : undefined,
    url: String(row.url),
    status: (row.status as "ACTIVE" | "INACTIVE") || "ACTIVE",
    createdAt: String(row.created_at),
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  };
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

export async function listProductReels(
  merchantId: string,
  options?: { productId?: string; activeOnly?: boolean }
): Promise<ProductYoutubeReel[]> {
  try {
    let q = sb()
      .from("product_youtube_reels")
      .select("*")
      .eq("merchant_id", merchantId)
      .order("created_at", { ascending: false });

    if (options?.productId) q = q.eq("product_id", options.productId);
    if (options?.activeOnly) q = q.eq("status", "ACTIVE");

    const { data, error } = await q;
    if (!error && data) {
      return data.map((row) => mapRow(row as Record<string, unknown>));
    }
  } catch {
    // fall through
  }

  const local = await readLocal();
  let rows = local[merchantId] || [];
  if (options?.productId) {
    rows = rows.filter((r) => r.productId === options.productId);
  }
  if (options?.activeOnly) {
    rows = rows.filter((r) => r.status === "ACTIVE");
  }
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export type CreateProductReelInput = {
  productId: string;
  productName?: string;
  productSku?: string;
  productImageUrl?: string;
  youtubeUrl: string;
  title?: string;
  thumbnail?: string;
  status?: "ACTIVE" | "INACTIVE";
};

export async function createProductReel(
  merchantId: string,
  input: CreateProductReelInput
): Promise<{ reel: ProductYoutubeReel; source: "supabase" | "local" }> {
  const parsed = validateYoutubeReelUrl(input.youtubeUrl);
  if (!parsed.ok || !parsed.videoId || !parsed.normalized) {
    throw new Error(parsed.error || "Invalid YouTube reel URL");
  }

  const title =
    input.title?.trim() ||
    `Product reel ${parsed.videoId}`;
  const thumbnail = input.thumbnail?.trim() || parsed.thumbnailUrl || "";
  const now = new Date().toISOString();

  const payload = {
    merchant_id: merchantId,
    product_id: input.productId.trim(),
    product_name: input.productName?.trim() || null,
    product_sku: input.productSku?.trim() || null,
    product_image_url: input.productImageUrl?.trim() || null,
    youtube_video_id: parsed.videoId,
    title,
    thumbnail: thumbnail || null,
    url: parsed.normalized,
    status: input.status || "ACTIVE",
    updated_at: now,
  };

  try {
    const { data, error } = await sb()
      .from("product_youtube_reels")
      .upsert(payload, {
        onConflict: "merchant_id,product_id,youtube_video_id",
      })
      .select("*")
      .single();

    if (!error && data) {
      return { source: "supabase", reel: mapRow(data as Record<string, unknown>) };
    }
  } catch {
    // fall through
  }

  const local = await readLocal();
  const list = local[merchantId] || [];
  const existingIdx = list.findIndex(
    (r) =>
      r.productId === payload.product_id &&
      r.youtubeVideoId === payload.youtube_video_id
  );

  const reel: ProductYoutubeReel = {
    id: existingIdx >= 0 ? list[existingIdx].id : randomUUID(),
    merchantId,
    productId: payload.product_id,
    productName: payload.product_name || undefined,
    productSku: payload.product_sku || undefined,
    productImageUrl: payload.product_image_url || undefined,
    youtubeVideoId: payload.youtube_video_id,
    title: payload.title,
    thumbnail: payload.thumbnail || undefined,
    url: payload.url,
    status: payload.status as "ACTIVE" | "INACTIVE",
    createdAt: existingIdx >= 0 ? list[existingIdx].createdAt : now,
    updatedAt: now,
  };

  if (existingIdx >= 0) list[existingIdx] = reel;
  else list.unshift(reel);

  local[merchantId] = list;
  await writeLocal(local);
  return { source: "local", reel };
}

export async function deleteProductReel(
  merchantId: string,
  id: string
): Promise<{ source: "supabase" | "local"; ok: boolean }> {
  try {
    const { error, count } = await sb()
      .from("product_youtube_reels")
      .delete({ count: "exact" })
      .eq("id", id)
      .eq("merchant_id", merchantId);

    if (!error && (count ?? 0) > 0) {
      return { source: "supabase", ok: true };
    }
  } catch {
    // fall through
  }

  const local = await readLocal();
  const list = local[merchantId] || [];
  const next = list.filter((r) => r.id !== id);
  if (next.length === list.length) return { source: "local", ok: false };
  local[merchantId] = next;
  await writeLocal(local);
  return { source: "local", ok: true };
}
