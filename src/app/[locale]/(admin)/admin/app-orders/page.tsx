"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Link } from "@/i18n/navigation";
import { mockAppOrders } from "@/lib/mock/data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminAppOrdersPage() {
  const t = useTranslations("admin.appOrders");
  const tTable = useTranslations("table");
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  const filtered = useMemo(() => {
    return mockAppOrders.filter((o) => {
      const q = search.toLowerCase();
      const matches =
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.businessName.toLowerCase().includes(q) ||
        o.merchantName.toLowerCase().includes(q);
      return matches && (status === "ALL" || o.developmentStatus === status);
    });
  }, [search, status]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t("searchPlaceholder")}
          />
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ALL">Status</option>
            <option value="IN_DEVELOPMENT">In Development</option>
            <option value="READY_TO_PUBLISH">Ready to Publish</option>
            <option value="PUBLISHED">Published</option>
            <option value="PAYMENT_PENDING">Payment Pending</option>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b text-start text-muted-foreground">
                <th className="pb-3 font-medium">{tTable("orderId")}</th>
                <th className="pb-3 font-medium">{tTable("merchant")}</th>
                <th className="pb-3 font-medium">{tTable("business")}</th>
                <th className="pb-3 font-medium">{tTable("platform")}</th>
                <th className="pb-3 font-medium">{tTable("features")}</th>
                <th className="pb-3 font-medium">{tTable("amount")}</th>
                <th className="pb-3 font-medium">{tTable("payment")}</th>
                <th className="pb-3 font-medium">{tTable("status")}</th>
                <th className="pb-3 font-medium">{tTable("date")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-border/70">
                  <td className="py-3">
                    <Link
                      href={`/admin/app-orders/${o.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="py-3">{o.merchantName}</td>
                  <td className="py-3">{o.businessName}</td>
                  <td className="py-3">{o.platform.replace("_", " + ")}</td>
                  <td className="py-3">{o.features.length}</td>
                  <td className="py-3">
                    {formatCurrency(o.price, o.currency, locale)}
                  </td>
                  <td className="py-3">
                    <StatusBadge status={o.paymentStatus} />
                  </td>
                  <td className="py-3">
                    <StatusBadge status={o.developmentStatus} />
                  </td>
                  <td className="py-3">{formatDate(o.createdAt, locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
