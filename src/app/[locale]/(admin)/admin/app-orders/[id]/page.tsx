"use client";

import { use, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Timeline } from "@/components/shared/timeline";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { mockAppOrders } from "@/lib/mock/data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function AppOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("admin.appOrders");
  const tFeatures = useTranslations("merchant.appOrder");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const order = mockAppOrders.find((o) => o.id === id) || mockAppOrders[0];
  const [status, setStatus] = useState(order.developmentStatus);
  const [step, setStep] = useState(order.developmentStep);

  const featureLabels: Record<string, string> = {
    products: tFeatures("featureProducts"),
    categories: tFeatures("featureCategories"),
    search: tFeatures("featureSearch"),
    cart: tFeatures("featureCart"),
    checkout: tFeatures("featureCheckout"),
    orders: tFeatures("featureOrders"),
    customer_account: tFeatures("featureCustomerAccount"),
    push: tFeatures("featurePush"),
    wishlist: tFeatures("featureWishlist"),
    offers: tFeatures("featureOffers"),
  };

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("orderInfo")}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Item label={t("orderId")} value={order.orderNumber} />
              <Item label={tCommon("merchant")} value={order.merchantName} />
              <Item label={tCommon("business")} value={order.businessName} />
              <Item
                label={t("orderDate")}
                value={formatDate(order.createdAt, locale)}
              />
              <Item
                label={tCommon("platform")}
                value={order.platform.replace("_", " + ")}
              />
              <Item
                label={tCommon("price")}
                value={formatCurrency(order.price, order.currency, locale)}
              />
              <Item
                label={tCommon("status")}
                value={<StatusBadge status={status} />}
              />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("selectedFeatures")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 sm:grid-cols-2">
              {order.features.map((f) => (
                <li
                  key={f}
                  className="rounded-lg border border-border px-3 py-2 text-sm"
                >
                  {featureLabels[f] || f}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("branding")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <ColorSwatch
              label={t("primaryColor")}
              color={order.branding.primaryColor}
            />
            <ColorSwatch
              label={t("secondaryColor")}
              color={order.branding.secondaryColor}
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("developmentTimeline")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Timeline currentStep={step} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("updateStatus")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as typeof status);
                const map: Record<string, number> = {
                  PAYMENT_PENDING: 1,
                  PAID: 2,
                  CONFIRMED: 2,
                  REQUIREMENTS_PENDING: 3,
                  IN_DEVELOPMENT: 4,
                  TESTING: 6,
                  REVISION: 7,
                  READY_TO_PUBLISH: 8,
                  PUBLISHED: 9,
                };
                setStep(map[e.target.value] || step);
              }}
            >
              <option value="PAYMENT_PENDING">Payment Pending</option>
              <option value="PAID">Paid</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="REQUIREMENTS_PENDING">Requirements Pending</option>
              <option value="IN_DEVELOPMENT">In Development</option>
              <option value="TESTING">Testing</option>
              <option value="REVISION">Revision</option>
              <option value="READY_TO_PUBLISH">Ready to Publish</option>
              <option value="PUBLISHED">Published</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
            <Button
              className="w-full"
              onClick={() => toast.success(tCommon("saved"))}
            >
              {tCommon("save")}
            </Button>
          </CardContent>
        </Card>
      </div>
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

function ColorSwatch({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
      <span
        className="h-10 w-10 rounded-lg border border-border"
        style={{ backgroundColor: color }}
      />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{color}</p>
      </div>
    </div>
  );
}
