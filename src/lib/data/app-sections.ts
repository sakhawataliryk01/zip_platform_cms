import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import path from "path";
import {
  BUILTIN_LAYOUTS,
  BUILTIN_THEMES,
  DEFAULT_SECTIONS,
  inferSectionType,
  type AppLayout,
  type AppSection,
  type AppTheme,
} from "@/lib/data/app-sections-shared";

export type {
  AppLayout,
  AppSection,
  AppSectionType,
  AppTheme,
} from "@/lib/data/app-sections-shared";

export {
  ADDABLE_SECTION_TYPES,
  BUILTIN_LAYOUTS,
  BUILTIN_THEMES,
  DEFAULT_SECTIONS,
  inferSectionType,
} from "@/lib/data/app-sections-shared";

type LocalPrefs = Record<
  string,
  { themeKey?: string; layoutKey?: string; sectionOrder?: string[] }
>;

const DATA_DIR = path.join(process.cwd(), ".data");
const PREFS_FILE = path.join(DATA_DIR, "merchant-app-prefs.json");

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

async function readLocalPrefs(): Promise<LocalPrefs> {
  try {
    return JSON.parse(await fs.readFile(PREFS_FILE, "utf8"));
  } catch {
    return {};
  }
}

async function writeLocalPrefs(map: LocalPrefs) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(PREFS_FILE, JSON.stringify(map, null, 2), "utf8");
}

export async function listThemes(): Promise<AppTheme[]> {
  try {
    const { data, error } = await sb()
      .from("app_themes")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !data?.length) return BUILTIN_THEMES;

    return data.map((t) => ({
      key: t.theme_key,
      name: t.name,
      nameAr: t.name_ar,
      description: t.description || "",
      descriptionAr: t.description_ar || "",
      primaryColor: t.primary_color,
      secondaryColor: t.secondary_color,
      accentColor: t.accent_color,
      backgroundColor: t.background_color,
    }));
  } catch {
    return BUILTIN_THEMES;
  }
}

export async function listLayouts(): Promise<AppLayout[]> {
  try {
    const { data, error } = await sb()
      .from("app_layouts")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !data?.length) return BUILTIN_LAYOUTS;

    return data.map((l) => ({
      key: l.layout_key,
      name: l.name,
      nameAr: l.name_ar,
      description: l.description || "",
      descriptionAr: l.description_ar || "",
      previewStyle: (l.preview_style || "classic") as AppLayout["previewStyle"],
    }));
  } catch {
    return BUILTIN_LAYOUTS;
  }
}

export async function getMerchantThemeKey(merchantId: string): Promise<string> {
  try {
    const { data, error } = await sb()
      .from("merchants")
      .select("app_theme_key")
      .eq("id", merchantId)
      .maybeSingle();

    if (!error && data?.app_theme_key) return data.app_theme_key;
  } catch {
    // fall through
  }

  const local = await readLocalPrefs();
  return local[merchantId]?.themeKey || "teal";
}

export async function getMerchantLayoutKey(merchantId: string): Promise<string> {
  try {
    const { data, error } = await sb()
      .from("merchants")
      .select("app_layout_key")
      .eq("id", merchantId)
      .maybeSingle();

    if (!error && data?.app_layout_key) return data.app_layout_key;
  } catch {
    // fall through
  }

  const local = await readLocalPrefs();
  return local[merchantId]?.layoutKey || "classic";
}

export async function setMerchantThemeKey(
  merchantId: string,
  themeKey: string
): Promise<{ source: "supabase" | "local" }> {
  if (!BUILTIN_THEMES.some((t) => t.key === themeKey)) {
    throw new Error("Invalid theme");
  }

  try {
    const { error } = await sb()
      .from("merchants")
      .update({ app_theme_key: themeKey })
      .eq("id", merchantId);

    if (!error) {
      await sb()
        .from("applications")
        .update({ theme_key: themeKey })
        .eq("merchant_id", merchantId);
      return { source: "supabase" };
    }
  } catch {
    // fall through
  }

  const local = await readLocalPrefs();
  local[merchantId] = { ...local[merchantId], themeKey };
  await writeLocalPrefs(local);
  return { source: "local" };
}

export async function setMerchantLayoutKey(
  merchantId: string,
  layoutKey: string
): Promise<{ source: "supabase" | "local" }> {
  if (!BUILTIN_LAYOUTS.some((l) => l.key === layoutKey)) {
    throw new Error("Invalid layout");
  }

  try {
    const { error } = await sb()
      .from("merchants")
      .update({ app_layout_key: layoutKey })
      .eq("id", merchantId);

    if (!error) {
      await sb()
        .from("applications")
        .update({ layout_key: layoutKey })
        .eq("merchant_id", merchantId);
      return { source: "supabase" };
    }
  } catch {
    // fall through
  }

  const local = await readLocalPrefs();
  local[merchantId] = { ...local[merchantId], layoutKey };
  await writeLocalPrefs(local);
  return { source: "local" };
}

function applyLocalSectionOrder(
  sections: AppSection[],
  localOrder?: string[]
): AppSection[] {
  if (!localOrder?.length) return sections;
  const byId = new Map(sections.map((s) => [s.id, s]));
  const ordered: AppSection[] = [];
  for (const id of localOrder) {
    const hit = byId.get(id);
    if (hit) {
      ordered.push(hit);
      byId.delete(id);
    }
  }
  for (const rest of byId.values()) ordered.push(rest);
  return ordered.map((s, i) => ({ ...s, sortOrder: i + 1 }));
}

export async function listMerchantSections(
  merchantId: string
): Promise<AppSection[]> {
  const local = await readLocalPrefs();
  const localOrder = local[merchantId]?.sectionOrder;

  try {
    const { data, error } = await sb()
      .from("app_sections")
      .select("id, title, title_ar, sort_order, status")
      .eq("merchant_id", merchantId)
      .order("sort_order", { ascending: true });

    if (!error && data?.length) {
      const mapped = data.map((s) => {
        const base: AppSection = {
          id: s.id,
          title: s.title,
          titleAr: s.title_ar || undefined,
          sortOrder: s.sort_order,
          status: s.status,
        };
        return { ...base, type: inferSectionType(base) };
      });
      return applyLocalSectionOrder(mapped, localOrder);
    }
  } catch {
    // fall through
  }
  return applyLocalSectionOrder(DEFAULT_SECTIONS, localOrder);
}

export async function reorderMerchantSections(
  merchantId: string,
  orderedIds: string[]
): Promise<{ source: "supabase" | "local"; sections: AppSection[] }> {
  const uniqueIds = orderedIds.map(String).filter(Boolean);
  if (!uniqueIds.length) {
    throw new Error("orderedIds required");
  }

  let wroteSupabase = false;
  try {
    const uuidIds = uniqueIds.filter(
      (id) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          id
        )
    );
    for (let i = 0; i < uuidIds.length; i++) {
      const { error } = await sb()
        .from("app_sections")
        .update({ sort_order: i + 1 })
        .eq("merchant_id", merchantId)
        .eq("id", uuidIds[i]);
      if (error) throw error;
      wroteSupabase = true;
    }
  } catch (err) {
    console.error("reorderMerchantSections supabase:", err);
    wroteSupabase = false;
  }

  const local = await readLocalPrefs();
  local[merchantId] = { ...local[merchantId], sectionOrder: uniqueIds };
  await writeLocalPrefs(local);

  const sections = await listMerchantSections(merchantId);
  return {
    source: wroteSupabase ? "supabase" : "local",
    sections,
  };
}
