"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockPlans } from "@/lib/mock/data";
import { toast } from "sonner";

export default function CreateMerchantPage() {
  const t = useTranslations("admin.merchants");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || ""),
      password: String(form.get("password") || ""),
      businessName: String(form.get("businessName") || ""),
      category: String(form.get("category") || ""),
      country: String(form.get("country") || "Saudi Arabia"),
      city: String(form.get("city") || ""),
      address: String(form.get("address") || ""),
      zidStoreUrl: String(form.get("zidStoreUrl") || ""),
      zidStoreId: String(form.get("zidStoreId") || ""),
      plan: String(form.get("plan") || "Professional"),
      status: String(form.get("status") || "ACTIVE"),
    };

    try {
      const res = await fetch("/api/admin/merchants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || tCommon("error"));
        return;
      }
      toast.success(t("createSuccess"));
      router.push("/admin/merchants");
      router.refresh();
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("createTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold">{t("personalInfo")}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("fullName")} name="name" required />
              <Field label={tCommon("email")} name="email" type="email" required />
              <Field label={tCommon("phone")} name="phone" required />
              <Field label={t("password")} name="password" type="password" required />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold">{t("businessInfo")}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("businessName")} name="businessName" required />
              <Field label={t("businessCategory")} name="category" required />
              <Field label={t("country")} name="country" defaultValue="Saudi Arabia" />
              <Field label={t("city")} name="city" />
              <div className="sm:col-span-2">
                <Field label={t("address")} name="address" />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold">{t("zidInfo")}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("zidStoreUrl")} name="zidStoreUrl" />
              <Field label={t("zidStoreId")} name="zidStoreId" />
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("selectPlan")}</Label>
              <Select name="plan" defaultValue="Professional" required>
                {mockPlans.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name} — SAR {p.price}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{tCommon("status")}</Label>
              <Select name="status" defaultValue="ACTIVE">
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="INACTIVE">Inactive</option>
              </Select>
            </div>
          </section>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/merchants")}
            >
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? tCommon("loading") : t("createMerchant")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
      />
    </div>
  );
}
