"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatNumber } from "@/lib/utils";
import type { MerchantCmsDashboardData } from "@/lib/data/merchant-cms";
import { LiveAppPhone } from "@/components/merchant/live-app-phone";

function greetingKey(hour: number) {
  if (hour < 12) return "goodMorning" as const;
  if (hour < 18) return "goodAfternoon" as const;
  return "goodEvening" as const;
}

function statusStyles(status: string) {
  switch (status) {
    case "COMPLETED":
      return "bg-[#e7f0e8] text-[#2f6b3c]";
    case "NEW":
      return "bg-[#e8eef8] text-[#2f5aa0]";
    case "PROCESSING":
      return "bg-[#f8efe4] text-[#a05a20]";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function VisitsChart({
  points,
}: {
  points: { label: string; value: number }[];
}) {
  const width = 420;
  const height = 160;
  const padX = 12;
  const padY = 16;
  const max = Math.max(1, ...points.map((p) => p.value));
  const min = Math.min(...points.map((p) => p.value)) * 0.85;
  const span = Math.max(1, max - min);

  const coords = points.map((p, i) => {
    const x =
      padX + (i / Math.max(1, points.length - 1)) * (width - padX * 2);
    const y =
      height - padY - ((p.value - min) / span) * (height - padY * 2);
    return { x, y, label: p.label };
  });

  const line = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L ${coords[coords.length - 1]?.x ?? 0} ${height - padY} L ${coords[0]?.x ?? 0} ${height - padY} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full">
      <defs>
        <linearGradient id="deskVisitsFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3d7a4a" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#3d7a4a" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#deskVisitsFill)" />
      <path
        d={line}
        fill="none"
        stroke="#3d7a4a"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {coords.map((c) => (
        <circle
          key={c.label}
          cx={c.x}
          cy={c.y}
          r="3.5"
          fill="#fff"
          stroke="#3d7a4a"
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}

export function MerchantDashboardView({
  data,
}: {
  data: MerchantCmsDashboardData;
}) {
  const t = useTranslations("merchant.dashboard");
  const tDesk = useTranslations("merchant.desk");
  const locale = useLocale();
  const isAr = locale === "ar";
  const firstName = data.welcomeName.split(" ")[0] || "Ahmad";
  const hour = useMemo(() => new Date().getHours(), []);

  const kpis = [
    {
      key: "orders",
      label: t("kpiOrders"),
      value: formatNumber(data.stats.orders, locale),
      change: data.changes.orders,
      href: "/merchant/orders",
    },
    {
      key: "sales",
      label: t("kpiSales"),
      value: `SAR ${formatNumber(data.stats.sales, locale)}`,
      change: data.changes.sales,
      href: "/merchant/orders",
    },
    {
      key: "customers",
      label: t("kpiNewCustomers"),
      value: formatNumber(data.stats.newCustomers, locale),
      change: data.changes.newCustomers,
      href: "/merchant/customers",
    },
    {
      key: "visits",
      label: t("kpiAppVisits"),
      value: formatNumber(data.stats.visits, locale),
      change: data.changes.visits,
      href: "/merchant/sections",
    },
  ];

  const chartPoints = data.weeklyVisits.map((row) => ({
    label: isAr ? row.dayLabelAr : row.dayLabelEn,
    value: row.visitors,
  }));

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-desk-green">
            {t(greetingKey(hour), { name: firstName })}
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-desk-ink">
            {t("todayAtStore")}
          </h2>
          <p className="max-w-xl text-sm text-desk-muted">{t("deskSubtitle")}</p>
        </div>
        <Link
          href="/merchant/app"
          className="inline-flex items-center justify-center rounded-full bg-desk-green px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#346940] lg:hidden"
        >
          {tDesk("customizeApp")}
        </Link>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Link
            key={kpi.key}
            href={kpi.href}
            className="rounded-[1.35rem] border border-[#e7e2d6] bg-white p-4 shadow-[0_1px_0_rgba(27,43,33,0.03)] transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm text-desk-muted">{kpi.label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-desk-ink">
              {kpi.value}
            </p>
            <p className="mt-2 text-xs font-medium text-desk-green">
              +{kpi.change}% {t("vsYesterday")}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="rounded-[1.6rem] border border-[#e7e2d6] bg-white p-5 shadow-[0_1px_0_rgba(27,43,33,0.03)]">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <p className="font-semibold text-desk-ink">{t("appStatus")}</p>
              <p className="text-xs text-desk-muted">{t("appStatusHint")}</p>
            </div>
            <Link
              href="/merchant/app"
              className="rounded-full bg-desk-green-soft px-3 py-1.5 text-xs font-medium text-desk-green"
            >
              {tDesk("customizeApp")}
            </Link>
          </div>
          <div className="flex justify-center rounded-[1.4rem] bg-[radial-gradient(ellipse_at_center,#fffdf8_0%,#f3f1ea_70%)] px-4 py-8">
            <LiveAppPhone
              storeName={data.storeName}
              isAr={isAr}
              size="sm"
            />
          </div>
        </section>

        <div className="space-y-4">
          <section className="rounded-[1.6rem] border border-[#e7e2d6] bg-white p-5 shadow-[0_1px_0_rgba(27,43,33,0.03)]">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-semibold text-desk-ink">{t("visitsChart")}</p>
              <p className="text-xs text-desk-muted">{t("last7Days")}</p>
            </div>
            <VisitsChart points={chartPoints} />
            <div className="mt-1 flex justify-between px-1 text-[11px] text-desk-muted">
              {chartPoints.map((p) => (
                <span key={p.label}>{p.label}</span>
              ))}
            </div>
          </section>

          <section className="rounded-[1.6rem] border border-[#e7e2d6] bg-white p-5 shadow-[0_1px_0_rgba(27,43,33,0.03)]">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-semibold text-desk-ink">{t("latestOrders")}</p>
              <Link
                href="/merchant/orders"
                className="text-xs font-medium text-desk-green hover:underline"
              >
                {t("viewAll")}
              </Link>
            </div>
            <ul className="space-y-2.5">
              {data.latestOrders.map((order) => (
                <li
                  key={order.id}
                  className="flex items-center gap-3 rounded-2xl bg-[#f7f5ef] px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-desk-ink">
                        {order.orderNumber}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusStyles(order.status)}`}
                      >
                        {t(`orderStatus.${order.status}`)}
                      </span>
                    </div>
                    <p className="truncate text-xs text-desk-muted">
                      {order.customerName}
                      <span className="mx-1.5 text-[#c5bfb2]">·</span>
                      {isAr ? order.timeLabelAr : order.timeLabelEn}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold tabular-nums text-desk-ink">
                    SAR {formatNumber(order.total, locale)}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
