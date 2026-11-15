"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
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
import {
  APP_STYLE_PRESETS,
  APP_STUDIO_PATHS,
  merchantAccountNav,
  merchantAppStudioEditorNav,
  merchantAppStudioNav,
  merchantStoreOpsNav,
  type NavIconName,
  type NavItemConfig,
} from "@/lib/nav";
import { isAppStylePresetKey } from "@/lib/app-style-presets";
import { useAppStyle } from "@/components/merchant/app-style-provider";
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
  /** Merchant desk: forest sidebar + cream canvas (reference UI) */
  variant?: "default" | "light" | "desk";
};

export function DashboardLayout({
  children,
  user,
  navItems,
  title,
  navNamespace,
  variant = "default",
}: DashboardLayoutProps) {
  if (variant === "desk") {
    return (
      <Suspense
        fallback={<div className="min-h-screen bg-desk-canvas" aria-hidden />}
      >
        <MerchantDeskLayout user={user} title={title}>
          {children}
        </MerchantDeskLayout>
      </Suspense>
    );
  }

  return (
    <ClassicDashboardLayout
      user={user}
      navItems={navItems}
      title={title}
      navNamespace={navNamespace}
      light={variant === "light"}
    >
      {children}
    </ClassicDashboardLayout>
  );
}

function MerchantDeskLayout({
  children,
  user,
  title,
}: {
  children: React.ReactNode;
  user: SessionUser;
  title: string;
}) {
  const tNav = useTranslations("nav.merchant");
  const t = useTranslations("common");
  const tDesk = useTranslations("merchant.desk");
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { presetKey, setPresetKey } = useAppStyle();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const storeName = user.businessName || tDesk("defaultStore");
  const inAppStudio = APP_STUDIO_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  const presetParam = searchParams.get("preset");
  const activeItem =
    [...merchantStoreOpsNav, ...merchantAppStudioNav, ...merchantAccountNav].find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
    ) || null;

  // URL ?preset= syncs into shared style (updates every phone on the desk)
  useEffect(() => {
    if (isAppStylePresetKey(presetParam) && presetParam !== presetKey) {
      setPresetKey(presetParam);
    }
  }, [presetParam, presetKey, setPresetKey]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const switchLocale = () => {
    router.replace(pathname, { locale: locale === "ar" ? "en" : "ar" });
  };

  const NavLink = ({ item }: { item: NavItemConfig }) => {
    const active =
      pathname === item.href || pathname.startsWith(`${item.href}/`);
    const Icon = iconMap[item.icon];
    return (
      <Link
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "flex items-center gap-3 rounded-full px-3.5 py-2.5 text-sm transition-colors",
          active
            ? "bg-[#f3f1ea] font-medium text-[#1b2b21]"
            : "text-[#c5d0c8] hover:bg-white/5 hover:text-white"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1">{tNav(item.labelKey as "dashboard")}</span>
      </Link>
    );
  };

  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 pb-2 pt-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#3d7a4a] text-white shadow-sm">
          <Store className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            {tDesk("brand")}
          </p>
          <p className="truncate text-[11px] text-[#a8b5ad]">{storeName}</p>
        </div>
      </div>

      <div className="mt-4 flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        <div>
          <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[#8a978e]">
            {tDesk("storeOperations")}
          </p>
          <nav className="space-y-0.5">
            {merchantStoreOpsNav.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>
        </div>

        <div className="rounded-3xl bg-[#24352a] p-3.5">
          <p className="px-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[#8a978e]">
            {tDesk("appStudio")}
          </p>
          <p className="mt-1.5 px-1 text-[11px] leading-relaxed text-[#a8b5ad]">
            {tDesk("appStudioHint")}
          </p>

          <p className="mb-2 mt-4 px-1 text-xs font-medium text-[#d5ddd7]">
            {tDesk("customizeLike")}
          </p>
          <div className="space-y-0.5">
            {APP_STYLE_PRESETS.map((preset) => {
              const selected = presetKey === preset.key;
              return (
                <Link
                  key={preset.key}
                  href={`/merchant/app?preset=${preset.key}`}
                  onClick={() => {
                    if (isAppStylePresetKey(preset.key)) {
                      setPresetKey(preset.key);
                    }
                    setMobileOpen(false);
                  }}
                  className={cn(
                    "flex items-start gap-2.5 rounded-xl px-2 py-2 text-sm transition",
                    selected
                      ? "bg-[#1b2b21] text-white"
                      : "text-[#c5d0c8] hover:bg-white/5 hover:text-white"
                  )}
                >
                  <span
                    className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: preset.color }}
                  />
                  <span className="min-w-0">
                    <span className="block font-medium">
                      {tNav(preset.labelKey as "dashboard")}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-[#8a978e]">
                      {tNav(preset.hintKey as "dashboard")}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="mt-3 space-y-0.5 border-t border-white/10 pt-3">
            {merchantAppStudioEditorNav.map((item) => {
              const active =
                item.href === "/merchant/app"
                  ? pathname === "/merchant/app"
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center rounded-full px-3 py-2 text-sm transition",
                    active
                      ? "bg-desk-green font-medium text-white"
                      : "text-[#c5d0c8] hover:bg-white/5 hover:text-white"
                  )}
                >
                  {item.labelKey === "overview"
                    ? tDesk("overview")
                    : tDesk(`studioNav.${item.labelKey}`)}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-0.5 px-0.5">
          {merchantAppStudioNav
            .filter((i) => i.href !== "/merchant/sections")
            .slice(0, 3)
            .map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          {merchantAccountNav.slice(0, 2).map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-desk-canvas text-desk-ink">
      <aside className="fixed inset-y-0 start-0 z-40 hidden w-[272px] flex-col bg-desk-sidebar text-white lg:flex">
        {Sidebar}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            onClick={() => setMobileOpen(false)}
            aria-label={t("close")}
          />
          <aside className="absolute inset-y-0 start-0 flex w-[288px] flex-col bg-desk-sidebar text-white shadow-2xl">
            <button
              type="button"
              className="absolute end-4 top-4 text-[#a8b5ad]"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            {Sidebar}
          </aside>
        </div>
      ) : null}

      <div className="lg:ps-[272px]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-[#e4e0d6] bg-[#f3f1ea]/90 px-4 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <p className="truncate text-sm text-desk-muted">
                {inAppStudio
                  ? tDesk("appStudio")
                  : tDesk("storeOperations")}
                <span className="mx-1.5 text-[#c5bfb2]">/</span>
                <span className="text-desk-ink">{storeName}</span>
              </p>
              <p className="truncate text-xs text-[#9a9488] lg:hidden">
                {activeItem
                  ? tNav(activeItem.labelKey as "dashboard")
                  : title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <p className="hidden text-xs text-[#9a9488] md:block">
              {tDesk("savedLocally")}
            </p>
            <button
              type="button"
              onClick={switchLocale}
              className="rounded-full px-3 py-1.5 text-sm text-desk-ink transition hover:bg-black/5"
            >
              {locale === "ar" ? "English" : "العربية"}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1b2b21] text-sm font-semibold text-white"
                aria-label={user.name}
              >
                {user.name.charAt(0).toUpperCase()}
              </button>
              {userMenuOpen ? (
                <div className="absolute end-0 top-11 z-50 w-52 rounded-2xl border border-[#e4e0d6] bg-white py-1 shadow-lg">
                  <MenuLink
                    href="/merchant/settings"
                    icon={User}
                    label={t("profile")}
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <MenuLink
                    href="/merchant/settings"
                    icon={Settings}
                    label={t("settings")}
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <MenuLink
                    href="/merchant/settings"
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
              ) : null}
            </div>

            <Link
              href="/merchant/app"
              className="hidden items-center rounded-full bg-desk-green px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#346940] sm:inline-flex"
            >
              {tDesk("customizeApp")}
            </Link>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-7">{children}</main>
      </div>
    </div>
  );
}

function ClassicDashboardLayout({
  children,
  user,
  navItems,
  title,
  navNamespace,
  light,
}: {
  children: React.ReactNode;
  user: SessionUser;
  navItems: NavItemConfig[];
  title: string;
  navNamespace: "nav.admin" | "nav.merchant";
  light: boolean;
}) {
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
