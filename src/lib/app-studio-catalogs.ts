export type StudioLayoutOption = {
  id: number;
  key: string;
  nameEn: string;
  nameAr: string;
  hintEn: string;
  hintAr: string;
};

export const READY_THEMES = [
  { key: "jade", nameEn: "Jade", nameAr: "يشم", primary: "#1B2B21", secondary: "#3D7A4A" },
  { key: "ink", nameEn: "Ink", nameAr: "حبر", primary: "#232F3E", secondary: "#FF9900" },
  { key: "sea", nameEn: "Sea", nameAr: "بحر", primary: "#0F274F", secondary: "#0EA5E9" },
  { key: "clay", nameEn: "Clay", nameAr: "طين", primary: "#7C2D12", secondary: "#EA580C" },
  { key: "sand", nameEn: "Sand", nameAr: "رمل", primary: "#92400E", secondary: "#F59E0B" },
] as const;

export const TYPEFACES = [
  { key: "cairo", nameEn: "Cairo", nameAr: "Cairo" },
  { key: "tajawal", nameEn: "Tajawal", nameAr: "Tajawal" },
  { key: "ibmPlex", nameEn: "IBM Plex Arabic", nameAr: "IBM Plex Arabic" },
] as const;

export const HEADER_STYLES = [
  { key: "classic", nameEn: "Classic", nameAr: "كلاسيكي" },
  { key: "gradient", nameEn: "Gradient", nameAr: "متدرج" },
  { key: "minimal", nameEn: "Minimal", nameAr: "بسيط" },
  { key: "location", nameEn: "Location and search", nameAr: "الموقع والبحث" },
] as const;

export const BOTTOM_BAR_STYLES = [
  { key: "labeled", nameEn: "Labeled icons", nameAr: "أيقونات مع نص" },
  { key: "icons", nameEn: "Icons only", nameAr: "أيقونات فقط" },
  { key: "pill", nameEn: "Floating pill", nameAr: "شريط عائم" },
] as const;

const bannerDefs: [string, string, string, string][] = [
  ["Block", "كتلة", "Filled color and text", "لون ممتلئ ونص"],
  ["Split", "مقسوم", "Side stripe", "شريط جانبي"],
  ["Ribbon", "شريط", "Thin top ribbon", "شريط علوي رفيع"],
  ["Card", "بطاقة", "Rounded offer card", "بطاقة عرض مستديرة"],
  ["Stack", "مكدس", "Stacked title and CTA", "عنوان وزر متراكبان"],
  ["Pair", "زوج", "Two banners side by side", "بانران جنباً إلى جنب"],
  ["Glass", "زجاجي", "Soft glass panel", "لوحة زجاجية ناعمة"],
  ["Stripe", "خطوط", "Diagonal stripe accent", "شريط مائل"],
  ["Chip", "حبة", "Promo chip on photo", "حبة عرض على صورة"],
  ["Frame", "إطار", "Outlined frame banner", "بانر بإطار"],
  ["Pill", "حبة كبيرة", "Full-width pill", "حبة بعرض كامل"],
  ["Ticket", "تذكرة", "Ticket-style cut edges", "شكل تذكرة"],
  ["Poster", "ملصق", "Tall poster crop", "ملصق طويل"],
  ["Shelf", "رف", "Colored title, details below", "عنوان ملون وتفاصيل أسفل"],
  ["Banner", "بانر", "Classic wide banner", "بانر عريض كلاسيكي"],
  ["Story", "قصة", "Story-style rounded card", "بطاقة قصة مستديرة"],
  ["Wave", "موجة", "Curved bottom edge", "حافة سفلية منحنية"],
  ["Grid", "شبكة", "Photo grid teaser", "معاينة شبكة صور"],
  ["Overlay", "طبقة", "Dark text overlay", "نص فوق طبقة داكنة"],
  ["Minimal", "بسيط", "Quiet text on soft fill", "نص هادئ على خلفية ناعمة"],
  ["Bold", "جريء", "Large type first", "خط كبير أولاً"],
  ["Photo poster", "ملصق صورة", "Full photo, text along the bottom", "صورة كاملة ونص أسفل"],
  ["Duo", "ثنائي", "Two tone split", "لونان مقسومان"],
  ["Tag", "وسم", "Corner sale tag", "وسم خصم في الزاوية"],
  ["Rail", "سكة", "Horizontal rail card", "بطاقة أفقية"],
  ["Spotlight", "تسليط", "Centered spotlight offer", "عرض في المنتصف"],
  ["Capsule", "كبسولة", "Capsule CTA strip", "شريط زر كبسولي"],
  ["Ledger", "دفتر", "Price-first ledger look", "مظهر دفتر يبرز السعر"],
  ["Market", "سوق", "Market stall style", "أسلوب سوق"],
  ["Neon", "نيون", "High-contrast neon edge", "حافة نيون عالية التباين"],
  ["Soft", "ناعم", "Pastel soft banner", "بانر باستيل ناعم"],
  ["Countdown", "عدّ تنازلي", "An offer that ends today", "عرض ينتهي اليوم"],
  ["Flash", "فلاش", "Flash deal badge", "شارة صفقة سريعة"],
  ["Bundle", "حزمة", "Bundle savings callout", "تنويه توفير الحزمة"],
  ["Season", "موسم", "Seasonal photo banner", "بانر صورة موسمية"],
  ["Delivery", "توصيل", "Delivery promise strip", "شريط وعد التوصيل"],
  ["VIP", "VIP", "VIP member strip", "شريط أعضاء VIP"],
  ["New", "جديد", "New arrivals banner", "بانر وصل حديثاً"],
  ["Clearance", "تصفية", "Clearance color block", "كتلة لون للتصفية"],
  ["Hero", "بطل", "Large hero with CTA", "بطل كبير مع زر"],
];

export const BANNER_LAYOUTS: StudioLayoutOption[] = bannerDefs.map(
  ([nameEn, nameAr, hintEn, hintAr], i) => ({
    id: i + 1,
    key: `banner-${i + 1}`,
    nameEn,
    nameAr,
    hintEn,
    hintAr,
  })
);

const cardDefs: [string, string, string, string][] = [
  ["Grid", "شبكة", "Photo then the name", "صورة ثم الاسم"],
  ["Rows", "صفوف", "Horizontal with a photo", "أفقي مع صورة"],
  ["Compact", "مختصر", "Tight price under name", "سعر مضغوط تحت الاسم"],
  ["Wide", "عريض", "Wide photo card", "بطاقة صورة عريضة"],
  ["Badge", "شارة", "Discount corner", "زاوية خصم"],
  ["Soft", "ناعم", "Soft shadow card", "بطاقة بظل ناعم"],
  ["Border", "إطار", "Thin border card", "بطاقة بإطار رفيع"],
  ["Lift", "مرتفعة", "Raised shop card", "بطاقة مرتفعة"],
  ["Tile", "بلاطة", "Square tile card", "بطاقة مربعة"],
  ["Stack", "مكدس", "Stacked meta under photo", "بيانات تحت الصورة"],
  ["Circle", "دائرة", "Round photo in the center", "صورة دائرية في الوسط"],
  ["List", "قائمة", "List row with thumb", "صف قائمة مع صورة"],
  ["Rail", "سكة", "Horizontal rail card", "بطاقة سكة أفقية"],
  ["Poster", "ملصق", "Poster-style product", "منتج بأسلوب ملصق"],
  ["Minimal", "بسيط", "Name and price only", "الاسم والسعر فقط"],
  ["Bold", "جريء", "Bold price first", "السعر بخط عريض أولاً"],
  ["Chip", "حبة", "The category above the product", "التصنيف فوق المنتج"],
  ["Tag", "وسم", "Sale tag over photo", "وسم تخفيض فوق الصورة"],
  ["Frame", "إطار", "Framed product photo", "صورة منتج مؤطرة"],
  ["Market", "سوق", "Market stall card", "بطاقة سوق"],
  ["Shelf", "رف", "Shelf label above", "تسمية رف أعلى"],
  ["Duo", "ثنائي", "Two-column meta", "بيانات بعمودين"],
  ["Save", "توفير", "The amount saved, under the price", "مبلغ التوفير تحت السعر"],
  ["Stars", "نجوم", "A full rating row", "صف تقييم كامل"],
  ["Chip rating", "تقييم حبة", "Rating chip near price", "حبة تقييم بجانب السعر"],
  ["Compare", "مقارنة", "Before and after price", "سعر قبل وبعد"],
  ["Stock", "مخزون", "Low stock note", "ملاحظة مخزون منخفض"],
  ["Quick", "سريع", "Quick-add button", "زر إضافة سريعة"],
  ["Wishlist", "مفضلة", "Heart on photo", "قلب على الصورة"],
  ["Delivery", "توصيل", "Delivery ETA line", "سطر وقت التوصيل"],
  ["Brand", "علامة", "Brand above name", "العلامة فوق الاسم"],
  ["SKU", "رمز", "SKU under name", "الرمز تحت الاسم"],
  ["Color", "لون", "Color swatches", "عينات ألوان"],
  ["Size", "مقاس", "Size chips", "حبات مقاس"],
  ["Bundle", "حزمة", "Bundle badge", "شارة حزمة"],
  ["New", "جديد", "New arrival badge", "شارة وصل حديثاً"],
  ["Hot", "رائج", "Trending badge", "شارة رائج"],
  ["Gallery", "معرض", "Multi-photo dots", "نقاط صور متعددة"],
  ["Overlay", "طبقة", "Name overlay on photo", "الاسم فوق الصورة"],
  ["Ledger", "دفتر", "Ledger price style", "أسلوب سعر دفتري"],
];

export const PRODUCT_CARD_LAYOUTS: StudioLayoutOption[] = cardDefs.map(
  ([nameEn, nameAr, hintEn, hintAr], i) => ({
    id: i + 1,
    key: `card-${i + 1}`,
    nameEn,
    nameAr,
    hintEn,
    hintAr,
  })
);

const categoryDefs: [string, string, string, string][] = [
  ["Pills", "حبات", "Rounded pill labels", "تسميات حبات مستديرة"],
  ["Circles", "دوائر", "Round photo circles", "صور دائرية"],
  ["Tiles", "بلاط", "Square tiles", "بلاط مربع"],
  ["Cards", "بطاقات", "Photo cards with title", "بطاقات صورة مع عنوان"],
  ["Rows", "صفوف", "A line and an arrow", "سطر وسهم"],
  ["Mosaic", "فسيفساء", "Mixed mosaic grid", "شبكة فسيفساء"],
  ["Strips", "أشرطة", "Horizontal strips", "أشرطة أفقية"],
  ["Tabs", "تبويبات", "Top category tabs", "تبويبات علوية"],
  ["Badges", "شارات", "Count badges", "شارات العدد"],
  ["Rail", "سكة", "Horizontal scroll rail", "سكة تمرير أفقية"],
  ["Blocks", "كتل", "Large color blocks", "كتل لون كبيرة"],
  ["Outline", "حدود", "Outlined category chips", "حبات بحدود"],
  ["Icons", "أيقونات", "Icon-first categories", "تصنيفات بأيقونات"],
  ["Index", "فهرس", "A–Z index list", "قائمة فهرس"],
  ["Side", "جانبي", "Side thumbnail rows", "صفوف بصورة جانبية"],
  ["Checker", "شطرنج", "Checkerboard tiles", "بلاط شطرنجي"],
  ["Caption", "تعليق", "Caption under photo", "تعليق تحت الصورة"],
  ["Chips", "رقائق", "Dense chip wrap", "رقائق كثيفة"],
  ["Timeline", "خط زمني", "Vertical timeline", "خط زمني عمودي"],
  ["Spotlight", "تسليط", "One large, rest small", "واحد كبير والباقي صغير"],
  ["Photos", "صور", "Photo-only grid", "شبكة صور فقط"],
];

export const CATEGORY_LAYOUTS: StudioLayoutOption[] = categoryDefs.map(
  ([nameEn, nameAr, hintEn, hintAr], i) => ({
    id: i + 1,
    key: `category-${i + 1}`,
    nameEn,
    nameAr,
    hintEn,
    hintAr,
  })
);

export const HOME_SECTION_META: {
  id: string;
  nameEn: string;
  nameAr: string;
}[] = [
  { id: "hero", nameEn: "Hero banner", nameAr: "بانر رئيسي" },
  { id: "categories", nameEn: "Categories", nameAr: "التصنيفات" },
  { id: "featured", nameEn: "Featured products", nameAr: "منتجات مميزة" },
  { id: "bundles", nameEn: "Bundle offers", nameAr: "عروض الحزم" },
  { id: "previousOrders", nameEn: "Previous orders", nameAr: "طلبات سابقة" },
  { id: "videos", nameEn: "Video clips", nameAr: "مقاطع فيديو" },
];
