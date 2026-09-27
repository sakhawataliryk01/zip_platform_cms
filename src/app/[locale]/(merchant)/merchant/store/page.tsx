"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import zidService from "@/lib/zid/zidService";
import type { ZidStore } from "@/types";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function MerchantStorePage() {
  const t = useTranslations("merchant.store");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [store, setStore] = useState<ZidStore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    zidService.getStore("m-1").then((s) => {
      setStore(s);
      setLoading(false);
    });
  }, []);

  const sync = async () => {
    const s = await zidService.syncStore("m-1");
    setStore(s);
    toast.success(tCommon("success"));
  };

  const connect = async () => {
    const s = await zidService.connectStore("m-1", {
      storeUrl: "https://abc-store.zid.store",
    });
    setStore(s);
    toast.success(tCommon("success"));
  };

  if (loading || !store) return <LoadingState label={tCommon("loading")} />;

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Item label={t("storeName")} value={store.storeName} />
          <Item label={t("storeUrl")} value={store.storeUrl} />
          <Item label={t("storeId")} value={store.storeId} />
          <Item
            label={t("connectionStatus")}
            value={<StatusBadge status={store.connectionStatus} />}
          />
          <Item
            label={t("lastSync")}
            value={
              store.lastSyncedAt
                ? formatDate(store.lastSyncedAt, locale)
                : "—"
            }
          />
          <Item
            label={t("productsCount")}
            value={String(store.productsCount)}
          />
          <Item label={t("ordersCount")} value={String(store.ordersCount)} />
        </dl>
        <div className="flex flex-wrap gap-2">
          <Button onClick={connect}>{t("connectZid")}</Button>
          <Button variant="outline" onClick={connect}>
            {t("reconnect")}
          </Button>
          <Button variant="outline" onClick={sync}>
            {t("syncStore")}
          </Button>
        </div>
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
