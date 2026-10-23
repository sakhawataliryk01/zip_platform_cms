"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ChevronDown,
  CircleHelp,
  CreditCard,
  KeyRound,
  LifeBuoy,
  Mail,
  Package,
  RefreshCw,
  Shield,
  Store,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { SupportCategory } from "@/lib/data/support-shared";

const CATEGORY_CARDS: Array<{
  key: SupportCategory;
  icon: typeof Store;
}> = [
  { key: "ACCOUNT_LOGIN", icon: Shield },
  { key: "ZID_STORE", icon: Store },
  { key: "API_OAUTH", icon: KeyRound },
  { key: "ORDERS_PRODUCTS", icon: RefreshCw },
  { key: "BILLING", icon: CreditCard },
  { key: "TECHNICAL", icon: Wrench },
];

const FAQ_KEYS = [
  "connectStore",
  "authorizeApi",
  "troubleshoot",
  "contactSupport",
] as const;

type FormState = {
  fullName: string;
  email: string;
  subject: string;
  category: SupportCategory;
  message: string;
};

const emptyForm: FormState = {
  fullName: "",
  email: "",
  subject: "",
  category: "GENERAL",
  message: "",
};

export function MerchantSupportPage() {
  const t = useTranslations("merchant.support");
  const tCommon = useTranslations("common");

  const supportEmail =
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || "";

  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>(
    {}
  );
  const [saving, setSaving] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<string | null>("connectStore");

  const mailtoHref = useMemo(() => {
    if (!supportEmail) return null;
    return `mailto:${supportEmail}?subject=${encodeURIComponent("ZidFlow Support")}`;
  }, [supportEmail]);

  const validate = () => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.fullName.trim()) next.fullName = t("errors.fullName");
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = t("errors.email");
    }
    if (!form.subject.trim() || form.subject.trim().length < 3) {
      next.subject = t("errors.subject");
    }
    if (!form.message.trim() || form.message.trim().length < 10) {
      next.message = t("errors.message");
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const selectCategory = (category: SupportCategory) => {
    setForm((f) => ({
      ...f,
      category,
      subject: f.subject.trim()
        ? f.subject
        : t(`categories.${category}.title`),
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedId(null);
    if (!validate()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/merchant/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || tCommon("error"));
        return;
      }
      setSubmittedId(data.ticket?.id || null);
      toast.success(t("form.success"));
      setForm((f) => ({
        ...emptyForm,
        fullName: f.fullName,
        email: f.email,
      }));
      setErrors({});
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 px-6 py-10 text-white shadow-sm sm:px-10">
        <div className="pointer-events-none absolute -end-16 -top-16 h-48 w-48 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -start-10 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-teal-100 ring-1 ring-white/15">
              <LifeBuoy className="h-3.5 w-3.5" />
              {t("badge")}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("heading")}
            </h1>
            <p className="text-sm leading-relaxed text-slate-200 sm:text-base">
              {t("description")}
            </p>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-3 text-sm ring-1 ring-white/15 backdrop-blur">
            <p className="text-xs uppercase tracking-wide text-teal-100">
              {t("contact.emailLabel")}
            </p>
            {supportEmail ? (
              <a
                href={mailtoHref || undefined}
                className="mt-1 inline-flex items-center gap-2 font-medium text-white hover:underline"
              >
                <Mail className="h-4 w-4" />
                {supportEmail}
              </a>
            ) : (
              <p className="mt-1 text-amber-100">{t("contact.emailMissing")}</p>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {t("categoriesTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">{t("categoriesSubtitle")}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORY_CARDS.map(({ key, icon: Icon }) => {
            const selected = form.category === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => selectCategory(key)}
                className={cn(
                  "rounded-xl border p-4 text-start transition-all",
                  selected
                    ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30"
                    : "border-border bg-card hover:border-primary/40 hover:bg-muted/40"
                )}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="font-medium text-foreground">
                  {t(`categories.${key}.title`)}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {t(`categories.${key}.description`)}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Contact form */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CircleHelp className="h-5 w-5 text-primary" />
              {t("form.title")}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{t("form.subtitle")}</p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={submit} noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="support-name">{t("form.fullName")}</Label>
                  <Input
                    id="support-name"
                    value={form.fullName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, fullName: e.target.value }))
                    }
                    placeholder={t("form.fullNamePlaceholder")}
                    aria-invalid={Boolean(errors.fullName)}
                  />
                  {errors.fullName ? (
                    <p className="text-xs text-destructive">{errors.fullName}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-email">{t("form.email")}</Label>
                  <Input
                    id="support-email"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    placeholder={t("form.emailPlaceholder")}
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email ? (
                    <p className="text-xs text-destructive">{errors.email}</p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="support-subject">{t("form.subject")}</Label>
                  <Input
                    id="support-subject"
                    value={form.subject}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, subject: e.target.value }))
                    }
                    placeholder={t("form.subjectPlaceholder")}
                    aria-invalid={Boolean(errors.subject)}
                  />
                  {errors.subject ? (
                    <p className="text-xs text-destructive">{errors.subject}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-category">{t("form.category")}</Label>
                  <Select
                    id="support-category"
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        category: e.target.value as SupportCategory,
                      }))
                    }
                  >
                    <option value="GENERAL">{t("categories.GENERAL.title")}</option>
                    {CATEGORY_CARDS.map(({ key }) => (
                      <option key={key} value={key}>
                        {t(`categories.${key}.title`)}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="support-message">{t("form.message")}</Label>
                <Textarea
                  id="support-message"
                  rows={5}
                  value={form.message}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, message: e.target.value }))
                  }
                  placeholder={t("form.messagePlaceholder")}
                  aria-invalid={Boolean(errors.message)}
                />
                {errors.message ? (
                  <p className="text-xs text-destructive">{errors.message}</p>
                ) : null}
              </div>

              {submittedId ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                  {t("form.ticketCreated", { id: submittedId.slice(0, 8) })}
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? tCommon("loading") : t("form.submit")}
                </Button>
                {mailtoHref ? (
                  <a
                    href={mailtoHref}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    <Mail className="h-4 w-4" />
                    {t("contact.emailCta")}
                  </a>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">{t("form.disclaimer")}</p>
            </form>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>{t("faq.title")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t("faq.subtitle")}</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {FAQ_KEYS.map((key) => {
              const open = openFaq === key;
              return (
                <div
                  key={key}
                  className="overflow-hidden rounded-xl border border-border"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start text-sm font-medium"
                    onClick={() => setOpenFaq(open ? null : key)}
                    aria-expanded={open}
                  >
                    <span>{t(`faq.${key}.q`)}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                        open && "rotate-180"
                      )}
                    />
                  </button>
                  {open ? (
                    <div className="border-t border-border bg-muted/30 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                      {t(`faq.${key}.a`)}
                    </div>
                  ) : null}
                </div>
              );
            })}

            <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/20 p-4">
              <div className="flex items-start gap-3">
                <Package className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{t("tickets.title")}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {t("tickets.description")}
                  </p>
                  <code className="mt-2 block rounded bg-muted px-2 py-1 text-[11px]">
                    POST /api/merchant/support
                  </code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
