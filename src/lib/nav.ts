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
  | "film"
  | "play"
  | "messageSquare";

export type NavItemConfig = {
  href: string;
  labelKey: string;
  icon: NavIconName;
  unavailable?: boolean;
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

/** CMS-style merchant nav (matches Alrajhi-style app content dashboard) */
export const merchantNavItems: NavItemConfig[] = [
  { href: "/merchant/dashboard", labelKey: "dashboard", icon: "dashboard" },
  { href: "/merchant/sections", labelKey: "appSections", icon: "layoutGrid" },
  { href: "/merchant/supervisors", labelKey: "supervisors", icon: "users" },
  { href: "/merchant/banners", labelKey: "banners", icon: "image" },
  {
    href: "/merchant/video-categories",
    labelKey: "videoCategories",
    icon: "film",
  },
  {
    href: "/merchant/videos/explore",
    labelKey: "videosExplore",
    icon: "play",
  },
  {
    href: "/merchant/videos/experiences",
    labelKey: "videosExperiences",
    icon: "messageSquare",
  },
  { href: "/merchant/notices", labelKey: "generalNotices", icon: "bell" },
  { href: "/merchant/app-order", labelKey: "orderNewApp", icon: "plusCircle" },
  { href: "/merchant/store", labelKey: "myStore", icon: "store" },
  { href: "/merchant/settings", labelKey: "settings", icon: "settings" },
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
