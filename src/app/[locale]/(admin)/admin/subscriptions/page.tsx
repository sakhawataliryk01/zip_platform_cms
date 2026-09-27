"use client";

import { useLocale, useTranslations } from "next-intl";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockPlans } from "@/lib/mock/data";
import { formatCurrency } from "@/lib/utils";

export default function AdminSubscriptionsPage() {
  const t = useTranslations("admin.subscriptions");
  const locale = useLocale();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {mockPlans.map((plan) => (
        <Card key={plan.id}>
          <CardHeader>
            <CardTitle>
              {locale === "ar" ? plan.nameAr : plan.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row
              label={t("plan")}
              value={formatCurrency(plan.price, plan.currency, locale)}
            />
            <Row label={t("billingPeriod")} value={plan.billingPeriod} />
            <Row
              label={t("numberOfMerchants")}
              value={String(plan.merchantCount)}
            />
            <Row
              label={t("activeSubscriptions")}
              value={String(plan.activeCount)}
            />
            <StatusBadge status={plan.status} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
