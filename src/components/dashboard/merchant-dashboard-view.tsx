"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  Bell,
  Image as ImageIcon,
  LayoutGrid,
  Package,
  Smartphone,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatNumber } from "@/lib/utils";
import type { MerchantCmsDashboardData } from "@/lib/data/merchant-cms";

export function MerchantDashboardView({
  data,
}: {
  data: MerchantCmsDashboardData;
}) {
  const t = useTranslations("merchant.dashboard");
  const locale = useLocale();
  const isAr = locale === "ar";

  const cards = [
    {
      key: "sections",
      label: t("totalSections"),
      value: data.stats.sections,
      icon: LayoutGrid,
      dark: false,
    },
    {
      key: "categories",
      label: t("totalCategories"),
      value: data.stats.categories,
      icon: Package,
      dark: false,
    },
    {
      key: "notifications",
      label: t("totalNotifications"),
      value: data.stats.notifications,
      icon: Bell,
      dark: false,
    },
    {
      key: "visits",
      label: t("totalVisits"),
      value: data.stats.visits,
      icon: Smartphone,
      dark: true,
    },
  ];

  // Match reference screenshot: show Sat–Tue first (main visible rows)
  const weeklyRows = data.weeklyVisits;

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold tracking-tight text-slate-800">
        {t("welcome", {
          name: data.welcomeName.split(" ")[0] || "Admin",
        })}
      </h2>

      {/* Top stats — same info as reference dashboard */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className={cn(
                "flex items-center justify-between gap-3 rounded-2xl px-5 py-6 shadow-sm",
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
              </div>
              <div
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-2xl",
                  card.dark ? "bg-white/10" : "bg-white text-slate-600"
                )}
              >
                <Icon className="h-7 w-7" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Total banners */}
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#ececec] px-5 py-6 shadow-sm">
        <div>
          <p className="text-3xl font-semibold tabular-nums leading-none text-slate-900">
            {formatNumber(data.stats.banners, locale)}
          </p>
          <p className="mt-2 text-sm font-medium text-slate-600">
            {t("totalBanners")}
          </p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-600">
          <ImageIcon className="h-7 w-7" />
        </div>
      </div>

      {/* Weekly visitor statistics */}
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-800">
            {t("weeklyVisitors")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-start text-slate-500">
                  <th className="pb-3 font-medium">{t("visitors")}</th>
                  <th className="pb-3 font-medium">{t("day")}</th>
                </tr>
              </thead>
              <tbody>
                {weeklyRows.map((row) => (
                  <tr
                    key={row.dayKey}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="py-3.5 font-medium text-slate-900">
                      {formatNumber(row.visitors, locale)}{" "}
                      <span className="font-normal text-slate-500">
                        {t("visitors")}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-700">
                      {isAr ? row.dayLabelAr : row.dayLabelEn}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Merchant requests app from here */}
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
