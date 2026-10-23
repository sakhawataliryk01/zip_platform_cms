"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { LoadingState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AppContent } from "@/lib/data/app-content-shared";

const emptyForm = {
  topBar1Text: "",
  topBar1TextAr: "",
  topBar1Enabled: true,
  topBar2Text: "",
  topBar2TextAr: "",
  topBar2Enabled: true,
};

export default function MerchantAppContentPage() {
  const t = useTranslations("merchant.appContent");
  const tCommon = useTranslations("common");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/merchant/app-content");
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || tCommon("error"));
        return;
      }
      const content = data.content as AppContent;
      setForm({
        topBar1Text: content.topBar1Text || "",
        topBar1TextAr: content.topBar1TextAr || "",
        topBar1Enabled: content.topBar1Enabled !== false,
        topBar2Text: content.topBar2Text || "",
        topBar2TextAr: content.topBar2TextAr || "",
        topBar2Enabled: content.topBar2Enabled !== false,
      });
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/merchant/app-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || tCommon("error"));
        return;
      }
      toast.success(tCommon("success"));
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label={tCommon("loading")} />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </CardHeader>
        <CardContent className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">{t("bar1Title")}</h3>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={form.topBar1Enabled}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, topBar1Enabled: e.target.checked }))
                  }
                />
                {t("showInApp")}
              </label>
            </div>
            <div className="overflow-hidden rounded-md bg-[#C41E3A] px-3 py-2 text-sm text-white">
              {form.topBar1Text || t("previewEmpty")}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bar1En">{t("textEn")}</Label>
              <Textarea
                id="bar1En"
                rows={2}
                value={form.topBar1Text}
                onChange={(e) =>
                  setForm((f) => ({ ...f, topBar1Text: e.target.value }))
                }
                placeholder={t("bar1Placeholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bar1Ar">{t("textAr")}</Label>
              <Textarea
                id="bar1Ar"
                rows={2}
                dir="rtl"
                value={form.topBar1TextAr}
                onChange={(e) =>
                  setForm((f) => ({ ...f, topBar1TextAr: e.target.value }))
                }
                placeholder={t("bar1PlaceholderAr")}
              />
            </div>
          </section>

          <section className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">{t("bar2Title")}</h3>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={form.topBar2Enabled}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, topBar2Enabled: e.target.checked }))
                  }
                />
                {t("showInApp")}
              </label>
            </div>
            <div className="overflow-hidden rounded-md bg-[#C41E3A] px-3 py-2 text-sm text-white">
              {form.topBar2Text || t("previewEmpty")}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bar2En">{t("textEn")}</Label>
              <Textarea
                id="bar2En"
                rows={2}
                value={form.topBar2Text}
                onChange={(e) =>
                  setForm((f) => ({ ...f, topBar2Text: e.target.value }))
                }
                placeholder={t("bar2Placeholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bar2Ar">{t("textAr")}</Label>
              <Textarea
                id="bar2Ar"
                rows={2}
                dir="rtl"
                value={form.topBar2TextAr}
                onChange={(e) =>
                  setForm((f) => ({ ...f, topBar2TextAr: e.target.value }))
                }
                placeholder={t("bar2PlaceholderAr")}
              />
            </div>
          </section>

          <div className="flex justify-end border-t pt-4">
            <Button onClick={save} disabled={saving}>
              {saving ? tCommon("loading") : t("save")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
