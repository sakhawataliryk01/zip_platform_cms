import type { AppStylePresetKey } from "@/lib/app-style-presets";

/** Home page structure blocks (App Studio home order) */
export type HomeSectionId =
  | "hero"
  | "categories"
  | "featured"
  | "bundles"
  | "previousOrders"
  | "videos";

/** Legacy preview blocks still used by LiveAppPhone home composition */
export type PreviewBlockId =
  | "announcement"
  | "hero"
  | "categories"
  | "search"
  | "product"
  | "reels";

export type ProductCardStyle = "photo" | "price" | "discount" | "rating";
export type AnnouncementStyle = "pill" | "marquee" | "frame" | "tag";
export type CategoryLayout = "row" | "round" | "square";

export type AppPreviewConfig = {
  storeNameEn: string;
  storeNameAr: string;
  promoTextEn: string;
  promoTextAr: string;
  heroTitleEn: string;
  heroTitleAr: string;
  heroHintEn: string;
  heroHintAr: string;
  primaryColor: string;
  secondaryColor: string;
  readyTheme: string;
  typeface: string;
  headerStyle: string;
  bottomBarStyle: string;
  announcementStyle: AnnouncementStyle;
  categoryLayout: CategoryLayout;
  productCardStyle: ProductCardStyle;
  bannerLayoutId: number;
  productCardLayoutId: number;
  categoryLayoutId: number;
  showCategoryCount: boolean;
  showCategoryPhoto: boolean;
  showStars: boolean;
  showComparePrice: boolean;
  showReels: boolean;
  homeSections: HomeSectionId[];
  hiddenHomeSections: HomeSectionId[];
  blockOrder: PreviewBlockId[];
  hiddenBlocks: PreviewBlockId[];
};

export const APP_PREVIEW_STORAGE_KEY = "merchant-desk-app-preview";

export const DEFAULT_PREVIEW_CONFIG: AppPreviewConfig = {
  storeNameEn: "Al Noor Store",
  storeNameAr: "متجر النور",
  promoTextEn: "Use 10% off now",
  promoTextAr: "استخدم خصم 10٪ الآن",
  heroTitleEn: "Today's offers",
  heroTitleAr: "عروض اليوم",
  heroHintEn: "Up to 50% off, and delivery is fast",
  heroHintAr: "خصم حتى 50٪ والتوصيل سريع",
  primaryColor: "#232F3E",
  secondaryColor: "#FF9900",
  readyTheme: "ink",
  typeface: "cairo",
  headerStyle: "classic",
  bottomBarStyle: "labeled",
  announcementStyle: "pill",
  categoryLayout: "row",
  productCardStyle: "discount",
  bannerLayoutId: 14,
  productCardLayoutId: 24,
  categoryLayoutId: 5,
  showCategoryCount: true,
  showCategoryPhoto: true,
  showStars: true,
  showComparePrice: true,
  showReels: true,
  homeSections: [
    "hero",
    "categories",
    "featured",
    "bundles",
    "previousOrders",
    "videos",
  ],
  hiddenHomeSections: ["bundles", "previousOrders", "videos"],
  blockOrder: [
    "announcement",
    "hero",
    "categories",
    "search",
    "product",
    "reels",
  ],
  hiddenBlocks: [],
};

function syncBlocksFromHome(config: AppPreviewConfig): AppPreviewConfig {
  const hiddenBlocks: PreviewBlockId[] = [];
  if (config.hiddenHomeSections.includes("hero")) hiddenBlocks.push("hero");
  if (config.hiddenHomeSections.includes("categories"))
    hiddenBlocks.push("categories");
  if (config.hiddenHomeSections.includes("featured"))
    hiddenBlocks.push("product");
  if (config.hiddenHomeSections.includes("videos")) hiddenBlocks.push("reels");

  const order: PreviewBlockId[] = ["announcement"];
  for (const section of config.homeSections) {
    if (section === "hero") order.push("hero");
    if (section === "categories") order.push("categories", "search");
    if (section === "featured") order.push("product");
    if (section === "videos") order.push("reels");
  }
  const unique = Array.from(new Set(order));
  return { ...config, blockOrder: unique, hiddenBlocks };
}

export function applyPresetToPreview(
  preset: AppStylePresetKey,
  current: AppPreviewConfig
): AppPreviewConfig {
  let next: AppPreviewConfig = {
    ...current,
    blockOrder: [...current.blockOrder],
    homeSections: [...current.homeSections],
    hiddenHomeSections: [...current.hiddenHomeSections],
  };
  switch (preset) {
    case "noon":
      next = {
        ...next,
        announcementStyle: "tag",
        categoryLayout: "square",
        productCardStyle: "discount",
        showStars: false,
        showComparePrice: true,
        readyTheme: "sand",
        primaryColor: "#92400E",
        secondaryColor: "#FEEE00",
        bannerLayoutId: 32,
        productCardLayoutId: 26,
        categoryLayoutId: 2,
      };
      break;
    case "amazon":
      next = {
        ...next,
        announcementStyle: "pill",
        categoryLayout: "row",
        productCardStyle: "rating",
        showStars: true,
        showComparePrice: true,
        readyTheme: "ink",
        primaryColor: "#232F3E",
        secondaryColor: "#FF9900",
        bannerLayoutId: 14,
        productCardLayoutId: 24,
        categoryLayoutId: 5,
      };
      break;
    case "shein":
      next = {
        ...next,
        announcementStyle: "frame",
        categoryLayout: "round",
        productCardStyle: "photo",
        showStars: false,
        showComparePrice: true,
        readyTheme: "clay",
        primaryColor: "#111827",
        secondaryColor: "#E83E8C",
        bannerLayoutId: 22,
        productCardLayoutId: 11,
        categoryLayoutId: 2,
      };
      break;
    case "jahez":
      next = {
        ...next,
        announcementStyle: "marquee",
        categoryLayout: "square",
        productCardStyle: "price",
        showStars: false,
        showComparePrice: false,
        readyTheme: "clay",
        primaryColor: "#E31837",
        secondaryColor: "#1B2B21",
        bannerLayoutId: 36,
        productCardLayoutId: 30,
        categoryLayoutId: 3,
      };
      break;
    case "keeta":
      next = {
        ...next,
        announcementStyle: "tag",
        categoryLayout: "round",
        productCardStyle: "photo",
        showStars: false,
        showComparePrice: false,
        readyTheme: "jade",
        primaryColor: "#1B2B21",
        secondaryColor: "#F5C518",
        bannerLayoutId: 4,
        productCardLayoutId: 1,
        categoryLayoutId: 2,
      };
      break;
    case "salla":
      next = {
        ...next,
        announcementStyle: "pill",
        categoryLayout: "square",
        productCardStyle: "rating",
        showStars: true,
        showComparePrice: true,
        readyTheme: "sea",
        primaryColor: "#0F274F",
        secondaryColor: "#0047AB",
        bannerLayoutId: 15,
        productCardLayoutId: 24,
        categoryLayoutId: 4,
      };
      break;
  }
  return syncBlocksFromHome(next);
}

export function withHomeSectionChange(
  current: AppPreviewConfig,
  patch: Partial<
    Pick<AppPreviewConfig, "homeSections" | "hiddenHomeSections">
  >
): AppPreviewConfig {
  return syncBlocksFromHome({ ...current, ...patch });
}

export function parsePreviewConfig(raw: string | null): AppPreviewConfig | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<AppPreviewConfig>;
    const merged: AppPreviewConfig = {
      ...DEFAULT_PREVIEW_CONFIG,
      ...parsed,
      blockOrder: Array.isArray(parsed.blockOrder)
        ? (parsed.blockOrder as PreviewBlockId[])
        : DEFAULT_PREVIEW_CONFIG.blockOrder,
      hiddenBlocks: Array.isArray(parsed.hiddenBlocks)
        ? (parsed.hiddenBlocks as PreviewBlockId[])
        : DEFAULT_PREVIEW_CONFIG.hiddenBlocks,
      homeSections: Array.isArray(parsed.homeSections)
        ? (parsed.homeSections as HomeSectionId[])
        : DEFAULT_PREVIEW_CONFIG.homeSections,
      hiddenHomeSections: Array.isArray(parsed.hiddenHomeSections)
        ? (parsed.hiddenHomeSections as HomeSectionId[])
        : DEFAULT_PREVIEW_CONFIG.hiddenHomeSections,
    };
    return syncBlocksFromHome(merged);
  } catch {
    return null;
  }
}
