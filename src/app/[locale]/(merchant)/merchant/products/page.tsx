"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import zidService from "@/lib/zid/zidService";
import type { Product } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function MerchantProductsPage() {
  const t = useTranslations("merchant.products");
  const tTable = useTranslations("table");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    zidService.getProducts("m-1").then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    );
  }, [products, search]);

  if (loading) return <LoadingState label={tCommon("loading")} />;

  return (
    <Card>
      <CardHeader className="space-y-3">
        <CardTitle>{t("title")}</CardTitle>
        <p className="text-sm text-muted-foreground">{t("readOnlyNote")}</p>
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
              <th className="pb-3 font-medium">{t("image")}</th>
              <th className="pb-3 font-medium">{t("productName")}</th>
              <th className="pb-3 font-medium">{t("sku")}</th>
              <th className="pb-3 font-medium">{tTable("price")}</th>
              <th className="pb-3 font-medium">{t("stock")}</th>
              <th className="pb-3 font-medium">{tTable("status")}</th>
              <th className="pb-3 font-medium">{tTable("lastUpdated")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-border/70">
                <td className="py-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-md bg-muted">
                    {p.imageUrl ? (
                      <Image
                        src={p.imageUrl}
                        alt={p.name}
                        fill
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                </td>
                <td className="py-3 font-medium">{p.name}</td>
                <td className="py-3">{p.sku}</td>
                <td className="py-3">
                  {formatCurrency(p.price, "SAR", locale)}
                </td>
                <td className="py-3">{p.stock}</td>
                <td className="py-3">
                  <StatusBadge
                    status={p.status === "active" ? "ACTIVE" : "INACTIVE"}
                  />
                </td>
                <td className="py-3">
                  {formatDate(p.lastUpdatedAt, locale)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
