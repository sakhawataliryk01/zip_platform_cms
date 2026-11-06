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

export type AppSectionType =
  | "ads_bar"
  | "image_slider"
  | "promo_banner"
  | "products"
  | "category_grid"
  | "videos"
  | "reviews"
  | "home"
  | "offers"
  | "categories"
  | "custom";

export type AppSection = {
  id: string;
  title: string;
  titleAr?: string;
  sortOrder: number;
  status: string;
  type?: AppSectionType;
};

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

export const DEFAULT_SECTIONS: AppSection[] = [
  {
    id: "sec-ads-bar",
    title: "Ads Bar",
    titleAr: "شريط الإعلانات",
    sortOrder: 1,
    status: "ACTIVE",
    type: "ads_bar",
  },
  {
    id: "sec-slider",
    title: "Image Slider",
    titleAr: "سلايدر الصور",
    sortOrder: 2,
    status: "ACTIVE",
    type: "image_slider",
  },
  {
    id: "sec-banner",
    title: "Promo Banner",
    titleAr: "بانر إعلاني",
    sortOrder: 3,
    status: "ACTIVE",
    type: "promo_banner",
  },
  {
    id: "sec-products",
    title: "Products Section",
    titleAr: "قسم المنتجات",
    sortOrder: 4,
    status: "ACTIVE",
    type: "products",
  },
  {
    id: "sec-grid",
    title: "Category Grid",
    titleAr: "شبكة المربعات",
    sortOrder: 5,
    status: "ACTIVE",
    type: "category_grid",
  },
  {
    id: "sec-videos",
    title: "Videos Section",
    titleAr: "قسم الفيديوهات",
    sortOrder: 6,
    status: "ACTIVE",
    type: "videos",
  },
  {
    id: "sec-reviews",
    title: "Reviews Section",
    titleAr: "قسم التقييمات",
    sortOrder: 7,
    status: "ACTIVE",
    type: "reviews",
  },
];

export const ADDABLE_SECTION_TYPES: Array<{
  type: AppSectionType;
  title: string;
  titleAr: string;
}> = [
  { type: "ads_bar", title: "Ads Bar", titleAr: "شريط الإعلانات" },
  { type: "image_slider", title: "Image Slider", titleAr: "سلايدر الصور" },
  { type: "promo_banner", title: "Promo Banner", titleAr: "بانر إعلاني" },
  { type: "products", title: "Products Section", titleAr: "قسم المنتجات" },
  { type: "category_grid", title: "Category Grid", titleAr: "شبكة المربعات" },
  { type: "videos", title: "Videos Section", titleAr: "قسم الفيديوهات" },
  { type: "reviews", title: "Reviews Section", titleAr: "قسم التقييمات" },
];

export function inferSectionType(section: AppSection): AppSectionType {
  if (section.type) return section.type;
  const key = `${section.title} ${section.titleAr || ""}`.toLowerCase();
  if (key.includes("ads") || key.includes("إعلان")) return "ads_bar";
  if (key.includes("slider") || key.includes("سلايدر")) return "image_slider";
  if (key.includes("banner") || key.includes("بانر")) return "promo_banner";
  if (key.includes("product") || key.includes("منتج")) return "products";
  if (key.includes("grid") || key.includes("مربع") || key.includes("categor"))
    return "category_grid";
  if (key.includes("video") || key.includes("فيديو")) return "videos";
  if (key.includes("review") || key.includes("تقييم")) return "reviews";
  if (key.includes("offer") || key.includes("عرض")) return "offers";
  if (key.includes("home") || key.includes("رئيس")) return "home";
  return "custom";
}
