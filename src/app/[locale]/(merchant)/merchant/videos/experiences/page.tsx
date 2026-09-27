"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

export default function VideosExperiencesPage() {
  const t = useTranslations("merchant.videos");
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle>{t("experiencesTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState title={t("unavailable")} />
      </CardContent>
    </Card>
  );
}
