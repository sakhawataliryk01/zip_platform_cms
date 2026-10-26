"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  Bell,
  Film,
  Image as ImageIcon,
  Images,
  LayoutGrid,
  LifeBuoy,
  Package,
  Play,
  PlusCircle,
  Smartphone,
  Store,
  Type,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatNumber } from "@/lib/utils";
import type { MerchantCmsDashboardData } from "@/lib/data/merchant-cms";

const QUICK_ACTIONS = [
  {
    href: "/merchant/notices",
    labelKey: "quickNotices" as const,
    descKey: "quickNoticesDesc" as const,
    icon: Bell,
  },
  {
    href: "/merchant/banners",
    labelKey: "quickBanners" as const,
    descKey: "quickBannersDesc" as const,
    icon: ImageIcon,
  },
  {
    href: "/merchant/intro-posters",
    labelKey: "quickIntro" as const,
    descKey: "quickIntroDesc" as const,
    icon: Images,
  },
  {
    href: "/merchant/app-content",
    labelKey: "quickAppContent" as const,
    descKey: "quickAppContentDesc" as const,
    icon: Type,
  },
  {
    href: "/merchant/products",
    labelKey: "quickProducts" as const,
    descKey: "quickProductsDesc" as const,
    icon: Package,
  },
  {
    href: "/merchant/store",
    labelKey: "quickStore" as const,
    descKey: "quickStoreDesc" as const,
    icon: Store,
  },
  {
    href: "/merchant/video-categories",
    labelKey: "quickVideos" as const,
    descKey: "quickVideosDesc" as const,
    icon: Film,
  },
  {
    href: "/merchant/support",
    labelKey: "quickSupport" as const,
    descKey: "quickSupportDesc" as const,
    icon: LifeBuoy,
  },
];

export function MerchantDashboardView({
  data,
}: {
  data: MerchantCmsDashboardData;
}) {
  const t = useTranslations("merchant.dashboard");
  const locale = useLocale();
  const isAr = locale === "ar";
  const firstName = data.welcomeName.split(" ")[0] || "Admin";

  const cards = [
    {
      key: "sections",
      label: t("totalSections"),
      value: data.stats.sections,
      icon: LayoutGrid,
      href: "/merchant/sections",
      dark: false,
    },
    {
      key: "categories",
      label: t("totalCategories"),
      value: data.stats.categories,
      icon: Package,
      href: "/merchant/products",
      dark: false,
    },
    {
      key: "notifications",
      label: t("totalNotifications"),
      value: data.stats.notifications,
      icon: Bell,
      href: "/merchant/notices",
      dark: false,
    },
    {
      key: "visits",
      label: t("totalVisits"),
      value: data.stats.visits,
      icon: Smartphone,
      href: "/merchant/dashboard",
      dark: true,
    },
  ];

  const weeklyRows = data.weeklyVisits;
  const maxVisitors = Math.max(1, ...weeklyRows.map((r) => r.visitors));

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              {t("welcome", { name: firstName })}
            </h2>
            <p className="max-w-2xl text-sm text-slate-600">{t("subtitle")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/merchant/notices">
              <Button variant="outline" className="gap-2">
                <Bell className="h-4 w-4" />
                {t("ctaNotices")}
              </Button>
            </Link>
            <Link href="/merchant/app-order">
              <Button className="gap-2 bg-[#4a4038] hover:bg-[#3a322c]">
                <PlusCircle className="h-4 w-4" />
                {t("requestAppCta")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.key}
              href={card.href}
              className={cn(
                "flex items-center justify-between gap-3 rounded-2xl px-5 py-6 shadow-sm transition hover:scale-[1.01] hover:shadow-md",
                card.dark
                  ? "bg-[#4a4038] text-white"
                  : "bg-[#ececec] text-slate-800"
              )}
            >
              <div>
                <p
                  className={cn(
                    "text-3xl font-semibold tabular-nums leading-none",
                    card.dark ? "text-white" : "text-slate-900"
                  )}
                >
                  {formatNumber(card.value, locale)}
                </p>
                <p
                  className={cn(
                    "mt-2 text-sm font-medium",
                    card.dark ? "text-white/85" : "text-slate-600"
                  )}
                >
                  {card.label}
                </p>
                <p
                  className={cn(
                    "mt-1 text-xs",
                    card.dark ? "text-white/60" : "text-slate-500"
                  )}
                >
                  {t("tapToOpen")}
                </p>
              </div>
              <div
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-2xl",
                  card.dark ? "bg-white/10" : "bg-white text-slate-600"
                )}
              >
                <Icon className="h-7 w-7" />
              </div>
            </Link>
          );
        })}
      </div>

      <Link
        href="/merchant/banners"
        className="flex items-center justify-between gap-3 rounded-2xl bg-[#ececec] px-5 py-6 shadow-sm transition hover:scale-[1.01] hover:shadow-md"
      >
        <div>
          <p className="text-3xl font-semibold tabular-nums leading-none text-slate-900">
            {formatNumber(data.stats.banners, locale)}
          </p>
          <p className="mt-2 text-sm font-medium text-slate-600">
            {t("totalBanners")}
          </p>
          <p className="mt-1 text-xs text-slate-500">{t("tapToOpen")}</p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-600">
          <ImageIcon className="h-7 w-7" />
        </div>
      </Link>

      <section className="space-y-3">
        <div>
          <h3 className="text-base font-semibold text-slate-800">
            {t("quickActions")}
          </h3>
          <p className="text-sm text-muted-foreground">{t("quickActionsHint")}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group rounded-xl border border-border bg-card p-4 shadow-sm transition hover:border-primary/40 hover:bg-muted/40"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-primary transition group-hover:bg-primary/10">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  {t(action.labelKey)}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {t(action.descKey)}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800">
              {t("weeklyVisitors")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {weeklyRows.map((row) => {
              const pct = Math.round((row.visitors / maxVisitors) * 100);
              return (
                <div key={row.dayKey} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">
                      {isAr ? row.dayLabelAr : row.dayLabelEn}
                    </span>
                    <span className="font-medium tabular-nums text-slate-900">
                      {formatNumber(row.visitors, locale)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#4a4038]/80 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800">
              {t("gettingStarted")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                step: "1",
                title: t("stepStore"),
                href: "/merchant/store",
                icon: Store,
              },
              {
                step: "2",
                title: t("stepContent"),
                href: "/merchant/banners",
                icon: ImageIcon,
              },
              {
                step: "3",
                title: t("stepNotices"),
                href: "/merchant/notices",
                icon: Bell,
              },
              {
                step: "4",
                title: t("stepVideos"),
                href: "/merchant/videos/explore",
                icon: Play,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.step}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl border border-border px-3 py-3 transition hover:bg-muted/50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4a4038] text-xs font-semibold text-white">
                    {item.step}
                  </span>
                  <span className="flex-1 text-sm font-medium text-slate-800">
                    {item.title}
                  </span>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-slate-900">{t("requestAppTitle")}</p>
          <p className="mt-1 text-sm text-slate-600">{t("requestAppSubtitle")}</p>
        </div>
        <Link href="/merchant/app-order">
          <Button className="bg-[#4a4038] hover:bg-[#3a322c]">
            {t("requestAppCta")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
