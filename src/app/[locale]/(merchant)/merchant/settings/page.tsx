"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const sections = [
  "profile",
  "businessInformation",
  "password",
  "notifications",
  "zidConnection",
  "subscription",
  "billing",
] as const;

export default function MerchantSettingsPage() {
  const t = useTranslations("merchant.settings");
  const tCommon = useTranslations("common");
  const [section, setSection] = useState<(typeof sections)[number]>("profile");

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <Card className="h-fit">
        <CardContent className="space-y-1 p-3">
          {sections.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSection(key)}
              className={cn(
                "w-full rounded-lg px-3 py-2 text-start text-sm transition-colors",
                section === key
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              {t(key)}
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t(section)}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="max-w-lg space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success(tCommon("saved"));
            }}
          >
            {section === "profile" && (
              <>
                <Field label={tCommon("name")} defaultValue="Ahmed Merchant" />
                <Field
                  label={tCommon("email")}
                  defaultValue="merchant@example.com"
                  type="email"
                />
                <Field label={tCommon("phone")} defaultValue="+966500000001" />
              </>
            )}
            {section === "businessInformation" && (
              <>
                <Field label={tCommon("business")} defaultValue="ABC Store" />
                <Field label={tCommon("name")} defaultValue="Fashion" />
              </>
            )}
            {section === "password" && (
              <>
                <Field label={t("currentPassword")} type="password" />
                <Field label={t("newPassword")} type="password" />
                <Field label={t("confirmPassword")} type="password" />
              </>
            )}
            {section === "notifications" && (
              <>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" defaultChecked className="rounded" />
                  {t("emailNotifications")}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" defaultChecked className="rounded" />
                  {t("pushNotifications")}
                </label>
              </>
            )}
            {(section === "zidConnection" ||
              section === "subscription" ||
              section === "billing") && (
              <p className="text-sm text-muted-foreground">{tCommon("empty")}</p>
            )}
            <Button type="submit">{tCommon("save")}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  defaultValue,
  type = "text",
}: {
  label: string;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} defaultValue={defaultValue} />
    </div>
  );
}
