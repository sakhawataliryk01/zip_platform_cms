"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Timeline } from "@/components/shared/timeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

const FEATURES = [
  "featureProducts",
  "featureCategories",
  "featureSearch",
  "featureCart",
  "featureCheckout",
  "featureOrders",
  "featureCustomerAccount",
  "featurePush",
  "featureWishlist",
  "featureOffers",
] as const;

export default function OrderNewAppPage() {
  const t = useTranslations("merchant.appOrder");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [orderId] = useState("APP-1028");
  const [form, setForm] = useState({
    businessName: "ABC Store",
    businessDescription: "",
    businessCategory: "Fashion",
    phone: "+966500000001",
    email: "merchant@example.com",
    address: "King Fahd Road, Riyadh",
    primaryColor: "#0F766E",
    secondaryColor: "#134E4A",
    platform: "ANDROID_IOS",
    features: ["featureProducts", "featureCart", "featureCheckout", "featureOrders"] as string[],
    zidConnected: true,
  });

  const price =
    form.platform === "ANDROID_IOS"
      ? 8500
      : form.platform === "ANDROID"
        ? 5500
        : 6000;

  const toggleFeature = (key: string) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.includes(key)
        ? prev.features.filter((f) => f !== key)
        : [...prev.features, key],
    }));
  };

  const submit = () => {
    setSubmitted(true);
    toast.success(t("confirmationTitle"));
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>{t("confirmationTitle")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("confirmationMessage")}
            </p>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm">
              {t("orderId")}: <strong>{orderId}</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              {tCommon("status")}: Pending
            </p>
            <p className="text-sm">
              {t("nextStep")}: {t("confirmationMessage")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Timeline currentStep={1} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("step")} {step} {t("of")} 6 — {t(`step${step}` as "step1")}
        </p>
        <div className="flex gap-1 pt-2">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div
              key={s}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                s <= step ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={t("businessName")}
              value={form.businessName}
              onChange={(v) => setForm({ ...form, businessName: v })}
            />
            <Field
              label={t("businessCategory")}
              value={form.businessCategory}
              onChange={(v) => setForm({ ...form, businessCategory: v })}
            />
            <Field
              label={t("phone")}
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
            />
            <Field
              label={t("email")}
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
            />
            <div className="sm:col-span-2 space-y-2">
              <Label>{t("businessDescription")}</Label>
              <Textarea
                value={form.businessDescription}
                onChange={(e) =>
                  setForm({ ...form, businessDescription: e.target.value })
                }
              />
            </div>
            <div className="sm:col-span-2">
              <Field
                label={t("address")}
                value={form.address}
                onChange={(v) => setForm({ ...form, address: v })}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("logo")}</Label>
              <Input type="file" accept="image/*" />
            </div>
            <div className="space-y-2">
              <Label>{t("appIcon")}</Label>
              <Input type="file" accept="image/*" />
            </div>
            <Field
              label={t("primaryColor")}
              value={form.primaryColor}
              onChange={(v) => setForm({ ...form, primaryColor: v })}
              type="color"
            />
            <Field
              label={t("secondaryColor")}
              value={form.secondaryColor}
              onChange={(v) => setForm({ ...form, secondaryColor: v })}
              type="color"
            />
            <div className="sm:col-span-2 space-y-2">
              <Label>{t("splashScreen")}</Label>
              <Input type="file" accept="image/*" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { key: "ANDROID", label: t("android") },
              { key: "IOS", label: t("ios") },
              { key: "ANDROID_IOS", label: t("androidIos") },
            ].map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setForm({ ...form, platform: p.key })}
                className={cn(
                  "rounded-xl border p-4 text-sm font-medium transition-colors",
                  form.platform === p.key
                    ? "border-primary bg-accent text-accent-foreground"
                    : "border-border hover:bg-muted"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {FEATURES.map((key) => (
              <label
                key={key}
                className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={form.features.includes(key)}
                  onChange={() => toggleFeature(key)}
                  className="rounded border-border"
                />
                {t(key)}
              </label>
            ))}
          </div>
        )}

        {step === 5 && (
          <div className="rounded-xl border border-border p-6 text-center">
            {form.zidConnected ? (
              <p className="text-sm font-medium text-emerald-700">
                {t("connected")} ✓
              </p>
            ) : (
              <Button onClick={() => setForm({ ...form, zidConnected: true })}>
                {t("connectZid")}
              </Button>
            )}
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4 text-sm">
            <ReviewRow label={t("businessName")} value={form.businessName} />
            <ReviewRow label={t("businessCategory")} value={form.businessCategory} />
            <ReviewRow
              label={tCommon("platform")}
              value={
                form.platform === "ANDROID_IOS"
                  ? t("androidIos")
                  : form.platform === "ANDROID"
                    ? t("android")
                    : t("ios")
              }
            />
            <ReviewRow
              label={tCommon("features")}
              value={`${form.features.length}`}
            />
            <ReviewRow
              label={t("estimatedPrice")}
              value={formatCurrency(price, "SAR", locale)}
            />
            <div className="flex gap-3">
              <span
                className="h-8 w-8 rounded-md border"
                style={{ backgroundColor: form.primaryColor }}
              />
              <span
                className="h-8 w-8 rounded-md border"
                style={{ backgroundColor: form.secondaryColor }}
              />
            </div>
          </div>
        )}

        <div className="flex justify-between gap-2 pt-2">
          <Button
            variant="outline"
            disabled={step === 1}
            onClick={() => setStep((s) => s - 1)}
          >
            {tCommon("previous")}
          </Button>
          {step < 6 ? (
            <Button onClick={() => setStep((s) => s + 1)}>
              {tCommon("next")}
            </Button>
          ) : (
            <Button onClick={submit}>{t("submitOrder")}</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
