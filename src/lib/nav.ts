import type { SessionUser } from "@/types";

export type NavIconName =
  | "dashboard"
  | "users"
  | "smartphone"
  | "appWindow"
  | "creditCard"
  | "wallet"
  | "bell"
  | "barChart"
  | "settings"
  | "store"
  | "package"
  | "shoppingCart"
  | "plusCircle"
  | "layoutGrid"
  | "image"
  | "images"
  | "film"
  | "play"
  | "messageSquare"
  | "type"
  | "lifeBuoy"
  | "shield"
  | "tag"
  | "percent";

export type NavItemConfig = {
  href: string;
  labelKey: string;
  icon: NavIconName;
  unavailable?: boolean;
  /** Optional visual group separator before this item */
  group?: "commerce" | "app" | "team" | "account";
};

export type AppStylePreset = {
  key: string;
  labelKey: string;
  hintKey: string;
  color: string;
  themeKey: string;
};

/** App studio “Customize like” presets shown in the merchant desk sidebar */
export const APP_STYLE_PRESETS: AppStylePreset[] = [
  {
    key: "keeta",
    labelKey: "likeKeeta",
    hintKey: "likeKeetaHint",
    color: "#F5C518",
    themeKey: "sand",
  },
  {
    key: "noon",
    labelKey: "likeNoon",
    hintKey: "likeNoonHint",
    color: "#F3E11B",
    themeKey: "sand",
  },
  {
    key: "amazon",
    labelKey: "likeAmazon",
    hintKey: "likeAmazonHint",
    color: "#FF9900",
    themeKey: "sand",
  },
  {
    key: "shein",
    labelKey: "likeShein",
    hintKey: "likeSheinHint",
    color: "#6B7280",
    themeKey: "rose",
  },
  {
    key: "jahez",
    labelKey: "likeJahez",
    hintKey: "likeJahezHint",
    color: "#E31837",
    themeKey: "rose",
  },
  {
    key: "salla",
    labelKey: "likeSalla",
    hintKey: "likeSallaHint",
    color: "#3B82F6",
    themeKey: "royal",
  },
];

export const APP_STUDIO_PATHS = [
  "/merchant/app",
  "/merchant/app/design",
  "/merchant/app/home-order",
  "/merchant/app/banners",
  "/merchant/app/cards",
  "/merchant/app/categories",
  "/merchant/app/announcement",
  "/merchant/sections",
  "/merchant/banners",
  "/merchant/app-content",
  "/merchant/intro-posters",
  "/merchant/video-categories",
  "/merchant/videos",
  "/merchant/notices",
];

/** App Studio editor links shown under Customize like */
export const merchantAppStudioEditorNav: {
  href: string;
  labelKey: string;
}[] = [
  { href: "/merchant/app", labelKey: "overview" },
  { href: "/merchant/app/design", labelKey: "appearance" },
  { href: "/merchant/app/home-order", labelKey: "homeOrder" },
  { href: "/merchant/app/banners", labelKey: "banners" },
  { href: "/merchant/app/cards", labelKey: "productCards" },
  { href: "/merchant/app/categories", labelKey: "categories" },
  { href: "/merchant/app/announcement", labelKey: "announcementBar" },
];

export const adminNavItems: NavItemConfig[] = [
  { href: "/admin/dashboard", labelKey: "dashboard", icon: "dashboard" },
  { href: "/admin/merchants", labelKey: "merchants", icon: "users" },
  { href: "/admin/app-orders", labelKey: "appOrders", icon: "smartphone" },
  { href: "/admin/applications", labelKey: "applications", icon: "appWindow" },
  { href: "/admin/subscriptions", labelKey: "subscriptions", icon: "creditCard" },
  { href: "/admin/payments", labelKey: "payments", icon: "wallet" },
  { href: "/admin/notifications", labelKey: "notifications", icon: "bell" },
  { href: "/admin/reports", labelKey: "reports", icon: "barChart" },
  { href: "/admin/settings", labelKey: "settings", icon: "settings" },
];

/** Primary store-operations links for the merchant desk shell */
export const merchantStoreOpsNav: NavItemConfig[] = [
  { href: "/merchant/dashboard", labelKey: "dashboard", icon: "dashboard", group: "commerce" },
  { href: "/merchant/orders", labelKey: "orders", icon: "shoppingCart", group: "commerce" },
  { href: "/merchant/products", labelKey: "products", icon: "package", group: "commerce" },
  { href: "/merchant/customers", labelKey: "customers", icon: "users", group: "commerce" },
  { href: "/merchant/banners", labelKey: "marketing", icon: "percent", group: "commerce" },
];

/** Secondary app / account links (shown under App studio + footer) */
export const merchantAppStudioNav: NavItemConfig[] = [
  {
    href: "/merchant/sections",
    labelKey: "appInterface",
    icon: "smartphone",
    group: "app",
  },
  { href: "/merchant/app-content", labelKey: "appContent", icon: "type", group: "app" },
  { href: "/merchant/intro-posters", labelKey: "introPosters", icon: "images", group: "app" },
  {
    href: "/merchant/video-categories",
    labelKey: "videoCategories",
    icon: "film",
    group: "app",
  },
  { href: "/merchant/notices", labelKey: "generalNotices", icon: "bell", group: "app" },
  {
    href: "/merchant/supervisors",
    labelKey: "supervisors",
    icon: "users",
    group: "team",
  },
];

export const merchantAccountNav: NavItemConfig[] = [
  { href: "/merchant/store", labelKey: "myStore", icon: "store", group: "account" },
  { href: "/merchant/support", labelKey: "support", icon: "lifeBuoy", group: "account" },
  {
    href: "/merchant/privacy-policy",
    labelKey: "privacyPolicy",
    icon: "shield",
    group: "account",
  },
  { href: "/merchant/settings", labelKey: "settings", icon: "settings", group: "account" },
];

/**
 * Flat merchant nav (used by pages that need the full list).
 * Desk shell uses the split arrays above for visual grouping.
 */
export const merchantNavItems: NavItemConfig[] = [
  ...merchantStoreOpsNav,
  ...merchantAppStudioNav,
  ...merchantAccountNav,
];

export function serializeUser(user: SessionUser): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    merchantId: user.merchantId,
    businessName: user.businessName,
  };
}
