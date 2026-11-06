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
  Images,
  KeyRound,
  LayoutDashboard,
  LayoutGrid,
  LifeBuoy,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Percent,
  Play,
  PlusCircle,
  Settings,
  Shield,
  ShoppingCart,
  Smartphone,
  Store,
  Tag,
  Type,
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
  images: Images,
  film: Film,
  play: Play,
  messageSquare: MessageSquare,
  type: Type,
  lifeBuoy: LifeBuoy,
  shield: Shield,
  tag: Tag,
  percent: Percent,
};

type DashboardLayoutProps = {
  children: React.ReactNode;
  user: SessionUser;
  navItems: NavItemConfig[];
  title: string;
  navNamespace: "nav.admin" | "nav.merchant";
  /** Merchant reference UI: light sidebar + soft canvas */
  variant?: "default" | "light";
};

export function DashboardLayout({
  children,
  user,
  navItems,
  title,
  navNamespace,
  variant = "default",
}: DashboardLayoutProps) {
  const tNav = useTranslations(navNamespace);
  const t = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const light = variant === "light";

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
      <div
        className={cn(
          "flex h-16 items-center gap-2 px-5",
          light ? "border-b border-slate-100" : "border-b border-white/10"
        )}
      >
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white",
            light ? "bg-slate-900" : "bg-teal-500"
          )}
        >
          Z
        </div>
        <div>
          <p
            className={cn(
              "text-sm font-semibold",
              light ? "text-slate-900" : "text-sidebar-foreground"
            )}
          >
            {t("appName")}
          </p>
          <p
            className={cn(
              "text-[11px] capitalize",
              light ? "text-slate-500" : "text-sidebar-muted"
            )}
          >
            {user.businessName || user.role.toLowerCase()}
          </p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {navItems.map((item, index) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = iconMap[item.icon];
          const prevGroup = index > 0 ? navItems[index - 1]?.group : undefined;
          const showDivider =
            Boolean(item.group) && item.group !== prevGroup && index > 0;

          return (
            <div key={item.href}>
              {showDivider ? (
                <div
                  className={cn(
                    "my-3 h-px",
                    light ? "bg-slate-100" : "bg-white/10"
                  )}
                />
              ) : null}
              <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  light
                    ? active
                      ? "bg-slate-100 font-medium text-slate-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    : active
                      ? "bg-teal-600 text-white"
                      : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">
                  {tNav(item.labelKey as "dashboard")}
                </span>
                {item.unavailable && (
                  <span
                    className={cn(
                      "text-[10px] font-medium",
                      active && !light ? "text-white/80" : "text-red-400"
                    )}
                  >
                    - {t("unavailable")}
                  </span>
                )}
              </Link>
            </div>
          );
        })}
      </nav>
    </>
  );

  return (
    <div
      className={cn(
        "min-h-screen",
        light
          ? "bg-[linear-gradient(to_right,#eef2f7_1px,transparent_1px),linear-gradient(to_bottom,#eef2f7_1px,transparent_1px)] bg-[size:28px_28px] bg-slate-50"
          : "bg-background"
      )}
    >
      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-40 hidden w-64 flex-col lg:flex",
          light
            ? "border-e border-slate-200/80 bg-white text-slate-900 shadow-sm"
            : "bg-sidebar text-sidebar-foreground"
        )}
      >
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
          <aside
            className={cn(
              "absolute inset-y-0 start-0 flex w-72 flex-col shadow-xl",
              light ? "bg-white" : "bg-sidebar"
            )}
          >
            <button
              type="button"
              className={cn(
                "absolute top-4 end-4",
                light ? "text-slate-500" : "text-sidebar-muted"
              )}
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      <div className="lg:ps-64">
        <header
          className={cn(
            "sticky top-0 z-30 flex h-16 items-center justify-between gap-3 px-4 sm:px-6",
            light
              ? "border-b border-slate-200/80 bg-white/90 backdrop-blur"
              : "border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
          )}
        >
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-slate-900">
                {pageTitle}
              </h1>
            </div>
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
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-muted"
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
                    light
                      ? "bg-slate-900 text-white"
                      : "bg-primary/15 text-primary"
                  )}
                >
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
