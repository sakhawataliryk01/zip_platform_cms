"use client";

import { use, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockMerchants, mockZidStore } from "@/lib/mock/data";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import zidService from "@/lib/zid/zidService";
import { toast } from "sonner";

const tabs = [
  "overview",
  "business",
  "zidStore",
  "applications",
  "appOrders",
  "payments",
  "subscription",
  "activity",
] as const;

export default function MerchantDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("admin.merchants");
  const tStore = useTranslations("merchant.store");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [tab, setTab] = useState<(typeof tabs)[number]>("overview");
  const merchant = mockMerchants.find((m) => m.id === id) || mockMerchants[0];

  const sync = async () => {
    await zidService.syncStore(merchant.id);
    toast.success(tCommon("success"));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("detailsTitle")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {merchant.businessName} · {merchant.email}
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-3">
            {tabs.map((key) => (
              <Button
                key={key}
                size="sm"
                variant={tab === key ? "default" : "outline"}
                onClick={() => setTab(key)}
              >
                {t(`tabs.${key}`)}
              </Button>
            ))}
          </div>

          {tab === "overview" && (
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Item label={t("fullName")} value={merchant.name} />
              <Item label={tCommon("email")} value={merchant.email} />
              <Item label={tCommon("phone")} value={merchant.phone} />
              <Item label={t("businessName")} value={merchant.businessName} />
              <Item
                label={tCommon("status")}
                value={<StatusBadge status={merchant.status} />}
              />
              <Item
                label={t("registrationDate")}
                value={formatDate(merchant.createdAt, locale)}
              />
              <Item
                label={t("lastLogin")}
                value={
                  merchant.lastLoginAt
                    ? formatDate(merchant.lastLoginAt, locale)
                    : "—"
                }
              />
            </dl>
          )}

          {tab === "business" && (
            <dl className="grid gap-4 sm:grid-cols-2">
              <Item label={t("businessName")} value={merchant.businessName} />
              <Item label={t("businessCategory")} value={merchant.category} />
              <Item label={t("country")} value={merchant.country} />
              <Item label={t("city")} value={merchant.city} />
              <Item label={t("address")} value={merchant.address} />
            </dl>
          )}

          {tab === "zidStore" && (
            <div className="space-y-4">
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Item label={tStore("storeName")} value={mockZidStore.storeName} />
                <Item label={tStore("storeUrl")} value={mockZidStore.storeUrl} />
                <Item label={tStore("storeId")} value={mockZidStore.storeId} />
                <Item
                  label={tStore("connectionStatus")}
                  value={<StatusBadge status={mockZidStore.connectionStatus} />}
                />
                <Item
                  label={tStore("lastSync")}
                  value={
                    mockZidStore.lastSyncedAt
                      ? formatDate(mockZidStore.lastSyncedAt, locale)
                      : "—"
                  }
                />
                <Item
                  label={tStore("productsCount")}
                  value={String(mockZidStore.productsCount)}
                />
                <Item
                  label={tStore("ordersCount")}
                  value={String(mockZidStore.ordersCount)}
                />
              </dl>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline">{tCommon("connect")}</Button>
                <Button variant="outline">{tCommon("reconnect")}</Button>
                <Button onClick={sync}>{tCommon("sync")}</Button>
              </div>
            </div>
          )}

          {tab === "subscription" && (
            <Item label={t("subscription")} value={merchant.subscription} />
          )}

          {(tab === "applications" ||
            tab === "appOrders" ||
            tab === "payments" ||
            tab === "activity") && (
            <EmptyState title={tCommon("empty")} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Item({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}
