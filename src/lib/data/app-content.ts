import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import path from "path";
import {
  emptyAppContent,
  type AppContent,
} from "@/lib/data/app-content-shared";

export type { AppContent } from "@/lib/data/app-content-shared";
export {
  emptyAppContent,
  toAppContentPayload,
} from "@/lib/data/app-content-shared";

type LocalStore = Record<string, AppContent>;

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "merchant-app-content.json");

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

function mapRow(row: Record<string, unknown>): AppContent {
  return {
    merchantId: String(row.merchant_id),
    topBar1Text: String(row.top_bar_1_text || ""),
    topBar1TextAr: String(row.top_bar_1_text_ar || ""),
    topBar1Enabled: row.top_bar_1_enabled !== false,
    topBar2Text: String(row.top_bar_2_text || ""),
    topBar2TextAr: String(row.top_bar_2_text_ar || ""),
    topBar2Enabled: row.top_bar_2_enabled !== false,
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

export async function getAppContent(merchantId: string): Promise<AppContent> {
  try {
    const { data, error } = await sb()
      .from("app_content")
      .select("*")
      .eq("merchant_id", merchantId)
      .maybeSingle();

    if (!error && data) return mapRow(data as Record<string, unknown>);
  } catch {
    // fall through
  }

  const local = await readLocal();
  return local[merchantId] || emptyAppContent(merchantId);
}

export type SaveAppContentInput = {
  topBar1Text: string;
  topBar1TextAr: string;
  topBar1Enabled: boolean;
  topBar2Text: string;
  topBar2TextAr: string;
  topBar2Enabled: boolean;
};

export async function saveAppContent(
  merchantId: string,
  input: SaveAppContentInput
): Promise<{ content: AppContent; source: "supabase" | "local" }> {
  const now = new Date().toISOString();
  const payload = {
    merchant_id: merchantId,
    top_bar_1_text: input.topBar1Text.trim(),
    top_bar_1_text_ar: input.topBar1TextAr.trim(),
    top_bar_1_enabled: input.topBar1Enabled,
    top_bar_2_text: input.topBar2Text.trim(),
    top_bar_2_text_ar: input.topBar2TextAr.trim(),
    top_bar_2_enabled: input.topBar2Enabled,
    updated_at: now,
  };

  try {
    const { data, error } = await sb()
      .from("app_content")
      .upsert(payload, { onConflict: "merchant_id" })
      .select("*")
      .single();

    if (!error && data) {
      return {
        source: "supabase",
        content: mapRow(data as Record<string, unknown>),
      };
    }
  } catch {
    // fall through
  }

  const content: AppContent = {
    merchantId,
    topBar1Text: payload.top_bar_1_text,
    topBar1TextAr: payload.top_bar_1_text_ar,
    topBar1Enabled: payload.top_bar_1_enabled,
    topBar2Text: payload.top_bar_2_text,
    topBar2TextAr: payload.top_bar_2_text_ar,
    topBar2Enabled: payload.top_bar_2_enabled,
    updatedAt: now,
  };

  const local = await readLocal();
  local[merchantId] = content;
  await writeLocal(local);
  return { source: "local", content };
}
