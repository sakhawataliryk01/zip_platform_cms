"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Users,
  UserCheck,
  UserPlus,
  Smartphone,
  Code2,
  Rocket,
  Wallet,
  Eye,
  Pencil,
  Ban,
} from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { ChartCard, type ChartFilter } from "@/components/shared/chart-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { AdminDashboardData } from "@/lib/data/dashboard";
import { formatCurrency, formatDate } from "@/lib/utils";

export function AdminDashboardView({ data }: { data: AdminDashboardData }) {
  const t = useTranslations("admin.dashboard");
  const tTable = useTranslations("table");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [filter, setFilter] = useState<ChartFilter>("7d");
  const { stats } = data;

  const filters = [
    { key: "7d" as const, label: t("filter7d") },
    { key: "30d" as const, label: t("filter30d") },
    { key: "3m" as const, label: t("filter3m") },
    { key: "6m" as const, label: t("filter6m") },
    { key: "1y" as const, label: t("filter1y") },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={t("totalMerchants")}
          value={stats.totalMerchants}
          change={stats.changes.totalMerchants}
          description={t("vsPrevious")}
          icon={Users}
        />
        <StatCard
          title={t("activeMerchants")}
          value={stats.activeMerchants}
          change={stats.changes.activeMerchants}
          description={t("vsPrevious")}
          icon={UserCheck}
        />
        <StatCard
          title={t("pendingMerchants")}
          value={stats.pendingMerchants}
          change={stats.changes.pendingMerchants}
          description={t("vsPrevious")}
          icon={UserPlus}
        />
        <StatCard
          title={t("totalAppOrders")}
          value={stats.totalAppOrders}
          change={stats.changes.totalAppOrders}
          description={t("vsPrevious")}
          icon={Smartphone}
        />
        <StatCard
          title={t("appsInDevelopment")}
          value={stats.appsInDevelopment}
          change={stats.changes.appsInDevelopment}
          description={t("vsPrevious")}
          icon={Code2}
        />
        <StatCard
          title={t("publishedApps")}
          value={stats.publishedApps}
          change={stats.changes.publishedApps}
          description={t("vsPrevious")}
          icon={Rocket}
        />
        <StatCard
          title={t("totalRevenue")}
          value={formatCurrency(stats.totalRevenue, "SAR", locale)}
          change={stats.changes.totalRevenue}
          description={t("vsPrevious")}
          icon={Wallet}
          className="sm:col-span-2 xl:col-span-2"
        />
      </div>

      <ChartCard
        title={t("revenueChart")}
        data={data.chart}
        filters={filters}
        activeFilter={filter}
        onFilterChange={setFilter}
        series={[
          { key: "revenue", label: t("revenue"), color: "#0f766e" },
          { key: "orders", label: t("appOrders"), color: "#0284c7" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("recentMerchants")}</CardTitle>
            <Link href="/admin/merchants">
              <Button variant="outline" size="sm">
                {tCommon("view")}
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b text-start text-muted-foreground">
                  <th className="pb-3 font-medium">{tTable("merchant")}</th>
                  <th className="pb-3 font-medium">{tTable("business")}</th>
                  <th className="pb-3 font-medium">{tTable("status")}</th>
                  <th className="pb-3 font-medium">{tTable("appStatus")}</th>
                  <th className="pb-3 font-medium">{tTable("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {data.recentMerchants.map((m) => (
                  <tr key={m.id} className="border-b border-border/70">
                    <td className="py-3">
                      <div className="font-medium">{m.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {m.email}
                      </div>
                    </td>
                    <td className="py-3">{m.businessName}</td>
                    <td className="py-3">
                      <StatusBadge status={m.status} />
                    </td>
                    <td className="py-3">
                      {m.appStatus && <StatusBadge status={m.appStatus} />}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <Link href={`/admin/merchants/${m.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/merchants/${m.id}`}>
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon">
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("recentAppOrders")}</CardTitle>
            <Link href="/admin/app-orders">
              <Button variant="outline" size="sm">
                {tCommon("view")}
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b text-start text-muted-foreground">
                  <th className="pb-3 font-medium">{tTable("orderId")}</th>
                  <th className="pb-3 font-medium">{tTable("merchant")}</th>
                  <th className="pb-3 font-medium">{tTable("platform")}</th>
                  <th className="pb-3 font-medium">
                    {tTable("developmentStatus")}
                  </th>
                  <th className="pb-3 font-medium">{tTable("orderDate")}</th>
                </tr>
              </thead>
              <tbody>
                {data.recentAppOrders.map((o) => (
                  <tr key={o.id} className="border-b border-border/70">
                    <td className="py-3">
                      <Link
                        href={`/admin/app-orders/${o.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3">{o.businessName}</td>
                    <td className="py-3">{o.platform.replace("_", " + ")}</td>
                    <td className="py-3">
                      <StatusBadge status={o.developmentStatus} />
                    </td>
                    <td className="py-3">
                      {formatDate(o.createdAt, locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
