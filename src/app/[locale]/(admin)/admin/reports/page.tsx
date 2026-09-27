"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { Users, Smartphone, Wallet, Rocket } from "lucide-react";
import { adminStats } from "@/lib/mock/data";

export default function AdminReportsPage() {
  const t = useTranslations("admin.reports");
  const td = useTranslations("admin.dashboard");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </CardHeader>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={td("totalMerchants")}
          value={adminStats.totalMerchants}
          icon={Users}
        />
        <StatCard
          title={td("totalAppOrders")}
          value={adminStats.totalAppOrders}
          icon={Smartphone}
        />
        <StatCard
          title={td("publishedApps")}
          value={adminStats.publishedApps}
          icon={Rocket}
        />
        <StatCard
          title={td("totalRevenue")}
          value={`SAR ${adminStats.totalRevenue.toLocaleString()}`}
          icon={Wallet}
        />
      </div>
    </div>
  );
}
