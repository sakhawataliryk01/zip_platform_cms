"use client";

import { use } from "react";
import { useLocale, useTranslations } from "next-intl";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockStoreOrders } from "@/lib/mock/data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function MerchantOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("merchant.orders");
  const locale = useLocale();
  const order = mockStoreOrders.find((o) => o.id === id) || mockStoreOrders[0];

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{t("details")}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          <Item label={t("orderId")} value={order.orderNumber} />
          <Item label={t("customer")} value={order.customerName} />
          <Item label={t("productsCount")} value={String(order.productsCount)} />
          <Item
            label={t("total")}
            value={formatCurrency(order.total, "SAR", locale)}
          />
          <Item
            label={t("paymentStatus")}
            value={<StatusBadge status={order.paymentStatus} />}
          />
          <Item
            label={t("orderStatus")}
            value={<StatusBadge status={order.orderStatus} />}
          />
          <Item
            label="Date"
            value={formatDate(order.orderDate, locale)}
          />
        </dl>
      </CardContent>
    </Card>
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
