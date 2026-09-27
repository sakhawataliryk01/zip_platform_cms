import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import path from "path";

export type AppTheme = {
  key: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
};

export type AppLayout = {
  key: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  previewStyle: "classic" | "grid" | "banner" | "tabs" | "cards" | "split";
};

export type AppSection = {
  id: string;
  title: string;
  titleAr?: string;
  sortOrder: number;
  status: string;
};

type LocalPrefs = Record<
  string,
  { themeKey?: string; layoutKey?: string }
>;

const DATA_DIR = path.join(process.cwd(), ".data");
const PREFS_FILE = path.join(DATA_DIR, "merchant-app-prefs.json");

export const BUILTIN_THEMES: AppTheme[] = [
  {
    key: "teal",
    name: "Teal Modern",
    nameAr: "تركواز عصري",
    description: "Clean teal brand look",
    descriptionAr: "مظهر تركوازي نظيف",
    primaryColor: "#0F766E",
    secondaryColor: "#134E4A",
    accentColor: "#CCFBF1",
    backgroundColor: "#F8FAFC",
  },
  {
    key: "royal",
    name: "Royal Blue",
    nameAr: "أزرق ملكي",
    description: "Trust and finance style",
    descriptionAr: "أسلوب الثقة والمالية",
    primaryColor: "#1D4ED8",
    secondaryColor: "#1E3A8A",
    accentColor: "#DBEAFE",
    backgroundColor: "#F8FAFC",
  },
  {
    key: "sand",
    name: "Desert Sand",
    nameAr: "رمل الصحراء",
    description: "Warm Saudi-inspired tones",
    descriptionAr: "ألوان دافئة مستوحاة من السعودية",
    primaryColor: "#B45309",
    secondaryColor: "#92400E",
    accentColor: "#FFEDD5",
    backgroundColor: "#FFFBEB",
  },
  {
    key: "rose",
    name: "Rose Soft",
    nameAr: "وردي ناعم",
    description: "Soft lifestyle / beauty stores",
    descriptionAr: "مناسب لمتاجر الجمال ونمط الحياة",
    primaryColor: "#BE185D",
    secondaryColor: "#9D174D",
    accentColor: "#FCE7F3",
    backgroundColor: "#FFF1F2",
  },
  {
    key: "forest",
    name: "Forest Green",
    nameAr: "أخضر الغابة",
    description: "Natural and calm",
    descriptionAr: "طبيعي وهادئ",
    primaryColor: "#166534",
    secondaryColor: "#14532D",
    accentColor: "#DCFCE7",
    backgroundColor: "#F0FDF4",
  },
  {
    key: "night",
    name: "Night Dark",
    nameAr: "ليلي داكن",
    description: "Dark premium mobile look",
    descriptionAr: "مظهر داكن فاخر للتطبيق",
    primaryColor: "#0F172A",
    secondaryColor: "#1E293B",
    accentColor: "#38BDF8",
    backgroundColor: "#020617",
  },
];

export const BUILTIN_LAYOUTS: AppLayout[] = [
  {
    key: "classic",
    name: "Classic Stack",
    nameAr: "تخطيط كلاسيكي",
    description: "Header on top, sections stacked vertically — simple and clear.",
    descriptionAr: "رأس الصفحة ثم الأقسام بشكل عمودي — بسيط وواضح.",
    previewStyle: "classic",
  },
  {
    key: "grid",
    name: "Category Grid",
    nameAr: "شبكة التصنيفات",
    description: "Home shows categories in a 2-column grid for fast browsing.",
    descriptionAr: "تعرض الرئيسية التصنيفات في شبكة عمودين للتصفح السريع.",
    previewStyle: "grid",
  },
  {
    key: "banner",
    name: "Banner First",
    nameAr: "البانر أولاً",
    description: "Large promo banner first, then offers and categories below.",
    descriptionAr: "بانر ترويجي كبير أولاً ثم العروض والتصنيفات.",
    previewStyle: "banner",
  },
  {
    key: "tabs",
    name: "Bottom Tabs",
    nameAr: "تبويبات سفلية",
    description: "Modern bottom tab bar: Home, Offers, Cart, Account.",
    descriptionAr: "شريط تبويب سفلي حديث: الرئيسية، العروض، السلة، الحساب.",
    previewStyle: "tabs",
  },
  {
    key: "cards",
    name: "Spotlight Cards",
    nameAr: "بطاقات مميزة",
    description: "Large content cards for offers and featured products.",
    descriptionAr: "بطاقات كبيرة للعروض والمنتجات المميزة.",
    previewStyle: "cards",
  },
  {
    key: "split",
    name: "Split Browse",
    nameAr: "تصفح مقسّم",
    description: "Categories on one side, products list on the other.",
    descriptionAr: "التصنيفات في جانب وقائمة المنتجات في الجانب الآخر.",
    previewStyle: "split",
  },
];

const DEFAULT_SECTIONS: AppSection[] = [
  { id: "sec-1", title: "Home", titleAr: "الرئيسية", sortOrder: 1, status: "ACTIVE" },
  { id: "sec-2", title: "Offers", titleAr: "العروض", sortOrder: 2, status: "ACTIVE" },
  { id: "sec-3", title: "Categories", titleAr: "التصنيفات", sortOrder: 3, status: "ACTIVE" },
];

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

export async function listMerchantSections(
  merchantId: string
): Promise<AppSection[]> {
  try {
    const { data, error } = await sb()
      .from("app_sections")
      .select("id, title, title_ar, sort_order, status")
      .eq("merchant_id", merchantId)
      .order("sort_order", { ascending: true });

    if (!error && data?.length) {
      return data.map((s) => ({
        id: s.id,
        title: s.title,
        titleAr: s.title_ar || undefined,
        sortOrder: s.sort_order,
        status: s.status,
      }));
    }
  } catch {
    // fall through
  }
  return DEFAULT_SECTIONS;
}
