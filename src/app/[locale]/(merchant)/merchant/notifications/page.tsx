"use client";

import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockMerchantNotifications } from "@/lib/mock/data";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function MerchantNotificationsPage() {
  const t = useTranslations("merchant.notifications");
  const locale = useLocale();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockMerchantNotifications.map((n) => (
          <div
            key={n.id}
            className={cn(
              "rounded-lg border p-4",
              n.read ? "border-border bg-card" : "border-primary/20 bg-accent/40"
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium">{n.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
              </div>
              <div className="text-end">
                <p className="text-xs text-muted-foreground">
                  {formatDate(n.createdAt, locale)}
                </p>
                <p className="mt-1 text-xs font-medium">
                  {n.read ? t("read") : t("unread")}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
