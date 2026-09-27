"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { SearchInput } from "@/components/shared/search-input";
import { LoadingState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import zidService from "@/lib/zid/zidService";
import type { Customer } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function MerchantCustomersPage() {
  const t = useTranslations("merchant.customers");
  const tTable = useTranslations("table");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    zidService.getCustomers("m-1").then((data) => {
      setCustomers(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
    );
  }, [customers, search]);

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
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b text-start text-muted-foreground">
              <th className="pb-3 font-medium">{tTable("customer")}</th>
              <th className="pb-3 font-medium">{tTable("email")}</th>
              <th className="pb-3 font-medium">{tTable("phone")}</th>
              <th className="pb-3 font-medium">{t("orders")}</th>
              <th className="pb-3 font-medium">{t("totalSpent")}</th>
              <th className="pb-3 font-medium">{t("lastOrder")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-border/70">
                <td className="py-3">
                  <Link
                    href={`/merchant/customers/${c.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {c.name}
                  </Link>
                </td>
                <td className="py-3">{c.email}</td>
                <td className="py-3">{c.phone}</td>
                <td className="py-3">{c.ordersCount}</td>
                <td className="py-3">
                  {formatCurrency(c.totalSpent, "SAR", locale)}
                </td>
                <td className="py-3">
                  {c.lastOrderAt ? formatDate(c.lastOrderAt, locale) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
