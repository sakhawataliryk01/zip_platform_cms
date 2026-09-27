"use client";

import { useLocale, useTranslations } from "next-intl";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockPlans } from "@/lib/mock/data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function MerchantSubscriptionPage() {
  const t = useTranslations("merchant.subscription");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const plan = mockPlans[1];

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Row
          label={t("currentPlan")}
          value={locale === "ar" ? plan.nameAr : plan.name}
        />
        <Row
          label={t("price")}
          value={formatCurrency(plan.price, plan.currency, locale)}
        />
        <Row label={t("billingCycle")} value={plan.billingPeriod} />
        <Row label={t("startDate")} value={formatDate("2025-11-12", locale)} />
        <Row label={t("renewalDate")} value={formatDate("2026-04-12", locale)} />
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{t("status")}</span>
          <StatusBadge status="ACTIVE" />
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button>{tCommon("upgrade")}</Button>
          <Button variant="outline">{tCommon("changePlan")}</Button>
          <Button variant="destructive">{tCommon("cancelSubscription")}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
