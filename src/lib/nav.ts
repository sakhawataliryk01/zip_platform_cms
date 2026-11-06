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

/**
 * Merchant nav aligned to Benaa/Beta-style dashboard points:
 * Home → Orders → Products → Customers → App UI → Marketing → Supervisors → …
 */
export const merchantNavItems: NavItemConfig[] = [
  { href: "/merchant/dashboard", labelKey: "dashboard", icon: "dashboard", group: "commerce" },
  { href: "/merchant/orders", labelKey: "orders", icon: "shoppingCart", group: "commerce" },
  { href: "/merchant/products", labelKey: "products", icon: "package", group: "commerce" },
  { href: "/merchant/customers", labelKey: "customers", icon: "users", group: "commerce" },
  {
    href: "/merchant/sections",
    labelKey: "appInterface",
    icon: "smartphone",
    group: "app",
  },
  { href: "/merchant/banners", labelKey: "marketing", icon: "percent", group: "app" },
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
