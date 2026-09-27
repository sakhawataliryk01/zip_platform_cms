"use client";

import { use } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockCustomers, mockStoreOrders } from "@/lib/mock/data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";

export default function CustomerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("merchant.customers");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const customer = mockCustomers.find((c) => c.id === id) || mockCustomers[0];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("details")}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Item label={tCommon("name")} value={customer.name} />
            <Item label={tCommon("email")} value={customer.email} />
            <Item label={tCommon("phone")} value={customer.phone} />
            <Item label={t("orders")} value={String(customer.ordersCount)} />
            <Item
              label={t("totalSpent")}
              value={formatCurrency(customer.totalSpent, "SAR", locale)}
            />
          </dl>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t("orderHistory")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockStoreOrders.slice(0, 3).map((o) => (
            <div
              key={o.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3 text-sm"
            >
              <span className="font-medium">{o.orderNumber}</span>
              <StatusBadge status={o.orderStatus} />
              <span>{formatCurrency(o.total, "SAR", locale)}</span>
              <span className="text-muted-foreground">
                {formatDate(o.orderDate, locale)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Item({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}
