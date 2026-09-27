"use client";

import { useTranslations } from "next-intl";
import { StatusBadge } from "@/components/shared/status-badge";
import { Timeline } from "@/components/shared/timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { mockApplications, mockAppOrders } from "@/lib/mock/data";

export default function MerchantAppPage() {
  const t = useTranslations("merchant.app");
  const app = mockApplications.find((a) => a.merchantId === "m-1");
  const order = mockAppOrders.find((o) => o.merchantId === "m-1");

  if (!app) {
    return (
      <Card className="max-w-lg">
        <CardContent className="space-y-4 py-10 text-center">
          <p>{t("noApp")}</p>
          <Link href="/merchant/app-order">
            <Button>{t("orderOne")}</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Item label={t("applicationName")} value={app.name} />
            <Item
              label={t("platform")}
              value={app.platform.replace("_", " + ")}
            />
            <Item label={t("version")} value={app.version} />
            <Item
              label={t("status")}
              value={<StatusBadge status={app.status} />}
            />
          </dl>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">{t("viewApplication")}</Button>
            <Button variant="outline">{t("downloadApk")}</Button>
            <Button variant="outline">{t("googlePlay")}</Button>
            <Button variant="outline">{t("appStore")}</Button>
            <Button>{t("requestUpdate")}</Button>
          </div>
        </CardContent>
      </Card>
      {order && app.status !== "PUBLISHED" && (
        <Card>
          <CardHeader>
            <CardTitle>{t("developmentProgress")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Timeline currentStep={order.developmentStep} />
          </CardContent>
        </Card>
      )}
      {app.status === "PUBLISHED" && order && (
        <Card>
          <CardHeader>
            <CardTitle>{t("developmentProgress")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Timeline currentStep={9} />
          </CardContent>
        </Card>
      )}
    </div>
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
