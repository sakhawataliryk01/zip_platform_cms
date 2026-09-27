"use client";

import { useLocale, useTranslations } from "next-intl";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockPayments } from "@/lib/mock/data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminPaymentsPage() {
  const t = useTranslations("admin.payments");
  const tTable = useTranslations("table");
  const locale = useLocale();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b text-start text-muted-foreground">
              <th className="pb-3 font-medium">{t("paymentId")}</th>
              <th className="pb-3 font-medium">{tTable("merchant")}</th>
              <th className="pb-3 font-medium">{t("invoice")}</th>
              <th className="pb-3 font-medium">{tTable("amount")}</th>
              <th className="pb-3 font-medium">{tTable("currency")}</th>
              <th className="pb-3 font-medium">{t("paymentMethod")}</th>
              <th className="pb-3 font-medium">{tTable("status")}</th>
              <th className="pb-3 font-medium">{tTable("date")}</th>
            </tr>
          </thead>
          <tbody>
            {mockPayments.map((p) => (
              <tr key={p.id} className="border-b border-border/70">
                <td className="py-3 font-medium">{p.paymentNumber}</td>
                <td className="py-3">{p.merchantName}</td>
                <td className="py-3">{p.invoice}</td>
                <td className="py-3">
                  {formatCurrency(p.amount, p.currency, locale)}
                </td>
                <td className="py-3">{p.currency}</td>
                <td className="py-3">{p.paymentMethod}</td>
                <td className="py-3">
                  <StatusBadge status={p.status} />
                </td>
                <td className="py-3">{formatDate(p.createdAt, locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
