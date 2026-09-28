import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export type ContentStatus = "ACTIVE" | "INACTIVE";
export type VideoType = "EXPLORE" | "EXPERIENCE";

export type VideoCategory = {
  id: string;
  name: string;
  nameAr?: string;
  status: ContentStatus;
  createdAt: string;
};

export type VideoItem = {
  id: string;
  categoryId?: string;
  title: string;
  titleAr?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  videoType: VideoType;
  status: ContentStatus;
  createdAt: string;
};

type LocalStore = Record<
  string,
  {
    categories: VideoCategory[];
    videos: VideoItem[];
  }
>;

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "merchant-videos.json");

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

function defaultCategories(): VideoCategory[] {
  const now = new Date().toISOString();
  return [
    {
      id: randomUUID(),
      name: "Explore",
      nameAr: "اكتشف",
      status: "ACTIVE",
      createdAt: now,
    },
    {
      id: randomUUID(),
      name: "Experiences",
      nameAr: "تجارب العملاء",
      status: "ACTIVE",
      createdAt: now,
    },
  ];
}

function defaultVideos(categories: VideoCategory[]): VideoItem[] {
  const now = new Date().toISOString();
  const explore = categories.find((c) => c.name === "Explore");
  const experiences = categories.find((c) => c.name === "Experiences");
  return [
    {
      id: randomUUID(),
      categoryId: explore?.id,
      title: "Store Tour",
      titleAr: "جولة في المتجر",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnailUrl: "",
      videoType: "EXPLORE",
      status: "ACTIVE",
      createdAt: now,
    },
    {
      id: randomUUID(),
      categoryId: experiences?.id,
      title: "Happy Customer",
      titleAr: "عميل سعيد",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnailUrl: "",
      videoType: "EXPERIENCE",
      status: "ACTIVE",
      createdAt: now,
    },
  ];
}

async function ensureLocal(merchantId: string): Promise<LocalStore[string]> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  let store: LocalStore = {};
  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    store = JSON.parse(raw) as LocalStore;
  } catch {
    store = {};
  }

  if (!store[merchantId]) {
    const categories = defaultCategories();
    store[merchantId] = {
      categories,
      videos: defaultVideos(categories),
    };
    await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
  }

  return store[merchantId];
}

async function writeLocal(merchantId: string, data: LocalStore[string]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  let store: LocalStore = {};
  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    store = JSON.parse(raw) as LocalStore;
  } catch {
    store = {};
  }
  store[merchantId] = data;
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
}

export async function listVideoCategories(
  merchantId: string
): Promise<VideoCategory[]> {
  try {
    const { data, error } = await sb()
      .from("video_categories")
      .select("id, name, name_ar, status, created_at")
      .eq("merchant_id", merchantId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      return data.map((row) => ({
        id: row.id,
        name: row.name,
        nameAr: row.name_ar || undefined,
        status: (row.status as ContentStatus) || "INACTIVE",
        createdAt: row.created_at,
      }));
    }
  } catch {
    // fall through
  }

  return (await ensureLocal(merchantId)).categories;
}

export async function createVideoCategory(
  merchantId: string,
  input: { name: string; nameAr?: string; status?: ContentStatus }
): Promise<{ category: VideoCategory; source: "supabase" | "local" }> {
  const payload = {
    merchant_id: merchantId,
    name: input.name.trim(),
    name_ar: input.nameAr?.trim() || null,
    status: input.status || "ACTIVE",
  };

  try {
    const { data, error } = await sb()
      .from("video_categories")
      .insert(payload)
      .select("id, name, name_ar, status, created_at")
      .single();

    if (!error && data) {
      return {
        source: "supabase",
        category: {
          id: data.id,
          name: data.name,
          nameAr: data.name_ar || undefined,
          status: data.status as ContentStatus,
          createdAt: data.created_at,
        },
      };
    }
  } catch {
    // fall through
  }

  const local = await ensureLocal(merchantId);
  const category: VideoCategory = {
    id: randomUUID(),
    name: payload.name,
    nameAr: payload.name_ar || undefined,
    status: payload.status as ContentStatus,
    createdAt: new Date().toISOString(),
  };
  local.categories.push(category);
  await writeLocal(merchantId, local);
  return { category, source: "local" };
}

export async function updateVideoCategory(
  merchantId: string,
  id: string,
  input: Partial<{ name: string; nameAr: string; status: ContentStatus }>
): Promise<{ category: VideoCategory; source: "supabase" | "local" }> {
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name.trim();
  if (input.nameAr !== undefined) patch.name_ar = input.nameAr.trim() || null;
  if (input.status !== undefined) patch.status = input.status;

  try {
    const { data, error } = await sb()
      .from("video_categories")
      .update(patch)
      .eq("id", id)
      .eq("merchant_id", merchantId)
      .select("id, name, name_ar, status, created_at")
      .single();

    if (!error && data) {
      return {
        source: "supabase",
        category: {
          id: data.id,
          name: data.name,
          nameAr: data.name_ar || undefined,
          status: data.status as ContentStatus,
          createdAt: data.created_at,
        },
      };
    }
  } catch {
    // fall through
  }

  const local = await ensureLocal(merchantId);
  const idx = local.categories.findIndex((c) => c.id === id);
  if (idx < 0) throw new Error("Category not found");
  local.categories[idx] = {
    ...local.categories[idx],
    ...(input.name !== undefined ? { name: input.name.trim() } : {}),
    ...(input.nameAr !== undefined
      ? { nameAr: input.nameAr.trim() || undefined }
      : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
  };
  await writeLocal(merchantId, local);
  return { category: local.categories[idx], source: "local" };
}

export async function deleteVideoCategory(
  merchantId: string,
  id: string
): Promise<{ source: "supabase" | "local" }> {
  try {
    const { error } = await sb()
      .from("video_categories")
      .delete()
      .eq("id", id)
      .eq("merchant_id", merchantId);

    if (!error) return { source: "supabase" };
  } catch {
    // fall through
  }

  const local = await ensureLocal(merchantId);
  local.categories = local.categories.filter((c) => c.id !== id);
  local.videos = local.videos.map((v) =>
    v.categoryId === id ? { ...v, categoryId: undefined } : v
  );
  await writeLocal(merchantId, local);
  return { source: "local" };
}

export async function listVideos(
  merchantId: string,
  videoType?: VideoType
): Promise<VideoItem[]> {
  try {
    let query = sb()
      .from("videos")
      .select(
        "id, category_id, title, title_ar, video_url, thumbnail_url, video_type, status, created_at"
      )
      .eq("merchant_id", merchantId)
      .order("created_at", { ascending: false });

    if (videoType) query = query.eq("video_type", videoType);

    const { data, error } = await query;

    if (!error && data) {
      return data.map((row) => ({
        id: row.id,
        categoryId: row.category_id || undefined,
        title: row.title,
        titleAr: row.title_ar || undefined,
        videoUrl: row.video_url || undefined,
        thumbnailUrl: row.thumbnail_url || undefined,
        videoType: row.video_type as VideoType,
        status: (row.status as ContentStatus) || "INACTIVE",
        createdAt: row.created_at,
      }));
    }
  } catch {
    // fall through
  }

  const local = await ensureLocal(merchantId);
  return videoType
    ? local.videos.filter((v) => v.videoType === videoType)
    : local.videos;
}

export async function createVideo(
  merchantId: string,
  input: {
    title: string;
    titleAr?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    categoryId?: string;
    videoType: VideoType;
    status?: ContentStatus;
  }
): Promise<{ video: VideoItem; source: "supabase" | "local" }> {
  const payload = {
    merchant_id: merchantId,
    title: input.title.trim(),
    title_ar: input.titleAr?.trim() || null,
    video_url: input.videoUrl?.trim() || null,
    thumbnail_url: input.thumbnailUrl?.trim() || null,
    category_id: input.categoryId || null,
    video_type: input.videoType,
    status: input.status || "ACTIVE",
  };

  try {
    const { data, error } = await sb()
      .from("videos")
      .insert(payload)
      .select(
        "id, category_id, title, title_ar, video_url, thumbnail_url, video_type, status, created_at"
      )
      .single();

    if (!error && data) {
      return {
        source: "supabase",
        video: {
          id: data.id,
          categoryId: data.category_id || undefined,
          title: data.title,
          titleAr: data.title_ar || undefined,
          videoUrl: data.video_url || undefined,
          thumbnailUrl: data.thumbnail_url || undefined,
          videoType: data.video_type as VideoType,
          status: data.status as ContentStatus,
          createdAt: data.created_at,
        },
      };
    }
  } catch {
    // fall through
  }

  const local = await ensureLocal(merchantId);
  const video: VideoItem = {
    id: randomUUID(),
    categoryId: payload.category_id || undefined,
    title: payload.title,
    titleAr: payload.title_ar || undefined,
    videoUrl: payload.video_url || undefined,
    thumbnailUrl: payload.thumbnail_url || undefined,
    videoType: payload.video_type,
    status: payload.status as ContentStatus,
    createdAt: new Date().toISOString(),
  };
  local.videos.unshift(video);
  await writeLocal(merchantId, local);
  return { video, source: "local" };
}

export async function updateVideo(
  merchantId: string,
  id: string,
  input: Partial<{
    title: string;
    titleAr: string;
    videoUrl: string;
    thumbnailUrl: string;
    categoryId: string | null;
    status: ContentStatus;
  }>
): Promise<{ video: VideoItem; source: "supabase" | "local" }> {
  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.titleAr !== undefined) patch.title_ar = input.titleAr.trim() || null;
  if (input.videoUrl !== undefined)
    patch.video_url = input.videoUrl.trim() || null;
  if (input.thumbnailUrl !== undefined)
    patch.thumbnail_url = input.thumbnailUrl.trim() || null;
  if (input.categoryId !== undefined) patch.category_id = input.categoryId;
  if (input.status !== undefined) patch.status = input.status;

  try {
    const { data, error } = await sb()
      .from("videos")
      .update(patch)
      .eq("id", id)
      .eq("merchant_id", merchantId)
      .select(
        "id, category_id, title, title_ar, video_url, thumbnail_url, video_type, status, created_at"
      )
      .single();

    if (!error && data) {
      return {
        source: "supabase",
        video: {
          id: data.id,
          categoryId: data.category_id || undefined,
          title: data.title,
          titleAr: data.title_ar || undefined,
          videoUrl: data.video_url || undefined,
          thumbnailUrl: data.thumbnail_url || undefined,
          videoType: data.video_type as VideoType,
          status: data.status as ContentStatus,
          createdAt: data.created_at,
        },
      };
    }
  } catch {
    // fall through
  }

  const local = await ensureLocal(merchantId);
  const idx = local.videos.findIndex((v) => v.id === id);
  if (idx < 0) throw new Error("Video not found");
  local.videos[idx] = {
    ...local.videos[idx],
    ...(input.title !== undefined ? { title: input.title.trim() } : {}),
    ...(input.titleAr !== undefined
      ? { titleAr: input.titleAr.trim() || undefined }
      : {}),
    ...(input.videoUrl !== undefined
      ? { videoUrl: input.videoUrl.trim() || undefined }
      : {}),
    ...(input.thumbnailUrl !== undefined
      ? { thumbnailUrl: input.thumbnailUrl.trim() || undefined }
      : {}),
    ...(input.categoryId !== undefined
      ? { categoryId: input.categoryId || undefined }
      : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
  };
  await writeLocal(merchantId, local);
  return { video: local.videos[idx], source: "local" };
}

export async function deleteVideo(
  merchantId: string,
  id: string
): Promise<{ source: "supabase" | "local" }> {
  try {
    const { error } = await sb()
      .from("videos")
      .delete()
      .eq("id", id)
      .eq("merchant_id", merchantId);

    if (!error) return { source: "supabase" };
  } catch {
    // fall through
  }

  const local = await ensureLocal(merchantId);
  local.videos = local.videos.filter((v) => v.id !== id);
  await writeLocal(merchantId, local);
  return { source: "local" };
}
