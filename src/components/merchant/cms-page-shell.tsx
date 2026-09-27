"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

export function MerchantCmsPageShell({
  namespace,
  unavailable = false,
}: {
  namespace:
    | "sections"
    | "supervisors"
    | "banners"
    | "videoCategories"
    | "notices";
  unavailable?: boolean;
}) {
  const t = useTranslations(`merchant.${namespace}`);
  const tCommon = useTranslations("common");

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </CardHeader>
      <CardContent>
        <EmptyState
          title={unavailable ? tCommon("unavailable") : tCommon("empty")}
          description={t("subtitle")}
        />
      </CardContent>
    </Card>
  );
}
