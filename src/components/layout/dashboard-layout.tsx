"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  AppWindow,
  BarChart3,
  Bell,
  ChevronDown,
  CreditCard,
  Film,
  Image as ImageIcon,
  KeyRound,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Play,
  PlusCircle,
  Settings,
  ShoppingCart,
  Smartphone,
  Store,
  User,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NavIconName, NavItemConfig } from "@/lib/nav";
import type { SessionUser } from "@/types";

const iconMap: Record<NavIconName, LucideIcon> = {
  dashboard: LayoutDashboard,
  users: Users,
  smartphone: Smartphone,
  appWindow: AppWindow,
  creditCard: CreditCard,
  wallet: Wallet,
  bell: Bell,
  barChart: BarChart3,
  settings: Settings,
  store: Store,
  package: Package,
  shoppingCart: ShoppingCart,
  plusCircle: PlusCircle,
  layoutGrid: LayoutGrid,
  image: ImageIcon,
  film: Film,
  play: Play,
  messageSquare: MessageSquare,
};

type DashboardLayoutProps = {
  children: React.ReactNode;
  user: SessionUser;
  navItems: NavItemConfig[];
  title: string;
  navNamespace: "nav.admin" | "nav.merchant";
};

export function DashboardLayout({
  children,
  user,
  navItems,
  title,
  navNamespace,
}: DashboardLayoutProps) {
  const tNav = useTranslations(navNamespace);
  const t = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const activeItem = navItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );
  const pageTitle = activeItem
    ? tNav(activeItem.labelKey as "dashboard")
    : title;

  const SidebarContent = (
    <>
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500 text-sm font-bold text-white">
          Z
        </div>
        <div>
          <p className="text-sm font-semibold text-sidebar-foreground">
            {t("appName")}
          </p>
          <p className="text-[11px] text-sidebar-muted capitalize">
            {user.role.toLowerCase()}
          </p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = iconMap[item.icon];
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-teal-600 text-white"
                  : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{tNav(item.labelKey as "dashboard")}</span>
              {item.unavailable && (
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    active ? "text-white/80" : "text-red-400"
                  )}
                >
                  - {t("unavailable")}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );

  // Use logical properties (start/ps) so LTR and RTL both work with dir="rtl".
  // Do NOT flip with pe/right manually — that double-flips and overlaps the sidebar.
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 start-0 z-40 hidden w-64 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        {SidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setMobileOpen(false)}
            aria-label={t("close")}
          />
          <aside className="absolute inset-y-0 start-0 flex w-72 flex-col bg-sidebar shadow-xl">
            <button
              type="button"
              className="absolute top-4 end-4 text-sidebar-muted"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      <div className="lg:ps-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold tracking-tight">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher className="hidden sm:inline-flex" />

            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setNotifOpen((v) => !v);
                  setUserMenuOpen(false);
                }}
              >
                <Bell className="h-5 w-5" />
              </Button>
              {notifOpen && (
                <div className="absolute end-0 top-11 z-50 w-72 rounded-xl border border-border bg-card p-3 shadow-lg sm:w-80">
                  <p className="mb-2 text-sm font-medium">{t("notifications")}</p>
                  <p className="text-xs text-muted-foreground">{t("seeAll")}</p>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen((v) => !v);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                  {user.name.charAt(0)}
                </span>
                <span className="hidden text-start text-sm sm:block">
                  <span className="block font-medium leading-tight">
                    {user.name}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </span>
                <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
              </button>
              {userMenuOpen && (
                <div className="absolute end-0 top-12 z-50 w-52 rounded-xl border border-border bg-card py-1 shadow-lg">
                  <MenuLink
                    href={
                      user.role === "ADMIN"
                        ? "/admin/settings"
                        : "/merchant/settings"
                    }
                    icon={User}
                    label={t("profile")}
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <MenuLink
                    href={
                      user.role === "ADMIN"
                        ? "/admin/settings"
                        : "/merchant/settings"
                    }
                    icon={Settings}
                    label={t("settings")}
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <MenuLink
                    href={
                      user.role === "ADMIN"
                        ? "/admin/settings"
                        : "/merchant/settings"
                    }
                    icon={KeyRound}
                    label={t("changePassword")}
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("logout")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="px-4 py-2 sm:hidden">
          <LanguageSwitcher />
        </div>

        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      {label}
    </Link>
  );
}
