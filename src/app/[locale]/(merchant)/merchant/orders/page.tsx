"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import zidService from "@/lib/zid/zidService";
import type { StoreOrder } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function MerchantOrdersPage() {
  const t = useTranslations("merchant.orders");
  const tTable = useTranslations("table");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    zidService.getOrders("m-1").then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter(
      (o) =>
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q)
    );
  }, [orders, search]);

  if (loading) return <LoadingState label={tCommon("loading")} />;

  return (
    <Card>
      <CardHeader className="space-y-3">
        <CardTitle>{t("title")}</CardTitle>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={t("searchPlaceholder")}
          className="max-w-md"
        />
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b text-start text-muted-foreground">
              <th className="pb-3 font-medium">{t("orderId")}</th>
              <th className="pb-3 font-medium">{t("customer")}</th>
              <th className="pb-3 font-medium">{t("productsCount")}</th>
              <th className="pb-3 font-medium">{t("total")}</th>
              <th className="pb-3 font-medium">{t("paymentStatus")}</th>
              <th className="pb-3 font-medium">{t("orderStatus")}</th>
              <th className="pb-3 font-medium">{tTable("date")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-b border-border/70">
                <td className="py-3">
                  <Link
                    href={`/merchant/orders/${o.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="py-3">{o.customerName}</td>
                <td className="py-3">{o.productsCount}</td>
                <td className="py-3">
                  {formatCurrency(o.total, "SAR", locale)}
                </td>
                <td className="py-3">
                  <StatusBadge status={o.paymentStatus} />
                </td>
                <td className="py-3">
                  <StatusBadge status={o.orderStatus} />
                </td>
                <td className="py-3">{formatDate(o.orderDate, locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
