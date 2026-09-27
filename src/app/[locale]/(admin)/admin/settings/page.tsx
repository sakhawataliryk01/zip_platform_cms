"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const t = useTranslations("admin.settings");
  const tCommon = useTranslations("common");

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success(tCommon("saved"));
          }}
        >
          <h3 className="text-sm font-semibold">{t("general")}</h3>
          <div className="space-y-2">
            <Label>{t("appName")}</Label>
            <Input defaultValue="Zid App Platform" />
          </div>
          <div className="space-y-2">
            <Label>{t("supportEmail")}</Label>
            <Input type="email" defaultValue="support@zidplatform.com" />
          </div>
          <div className="space-y-2">
            <Label>{t("defaultCurrency")}</Label>
            <Input defaultValue="SAR" />
          </div>
          <Button type="submit">{tCommon("save")}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
