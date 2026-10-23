"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ChevronDown,
  Database,
  Eye,
  FileShield,
  KeyRound,
  Mail,
  Scale,
  Share2,
  Shield,
  Store,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

const SECTION_KEYS = [
  "overview",
  "dataWeCollect",
  "howWeUse",
  "zidIntegration",
  "storageSecurity",
  "sharing",
  "yourRights",
  "contact",
] as const;

const SECTION_ICONS = {
  overview: Eye,
  dataWeCollect: Database,
  howWeUse: FileShield,
  zidIntegration: Store,
  storageSecurity: KeyRound,
  sharing: Share2,
  yourRights: Scale,
  contact: Mail,
} as const;

export function MerchantPrivacyPolicyPage() {
  const t = useTranslations("merchant.privacyPolicy");
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || "";
  const [openSection, setOpenSection] =
    useState<(typeof SECTION_KEYS)[number]>("overview");

  const mailtoHref = useMemo(() => {
    if (!supportEmail) return null;
    return `mailto:${supportEmail}?subject=${encodeURIComponent("ZidFlow Privacy Inquiry")}`;
  }, [supportEmail]);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 px-6 py-10 text-white shadow-sm sm:px-10">
        <div className="pointer-events-none absolute -end-16 -top-16 h-48 w-48 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -start-10 h-56 w-56 rounded-full bg-sky-300/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-indigo-100 ring-1 ring-white/15">
              <Shield className="h-3.5 w-3.5" />
              {t("badge")}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("heading")}
            </h1>
            <p className="text-sm leading-relaxed text-slate-200 sm:text-base">
              {t("description")}
            </p>
            <p className="text-xs text-slate-300">{t("lastUpdated")}</p>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-3 text-sm ring-1 ring-white/15 backdrop-blur">
            <p className="text-xs uppercase tracking-wide text-indigo-100">
              {t("contactLabel")}
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
              <p className="mt-1 text-amber-100">{t("contactMissing")}</p>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SECTION_KEYS.slice(0, 4).map((key) => {
          const Icon = SECTION_ICONS[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => setOpenSection(key)}
              className={cn(
                "rounded-xl border p-4 text-start transition-all",
                openSection === key
                  ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30"
                  : "border-border bg-card hover:border-primary/40 hover:bg-muted/40"
              )}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="text-sm font-medium">{t(`sections.${key}.title`)}</div>
            </button>
          );
        })}
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{t("sectionsTitle")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("sectionsSubtitle")}</p>
        </CardHeader>
        <CardContent className="space-y-2">
          {SECTION_KEYS.map((key) => {
            const open = openSection === key;
            const Icon = SECTION_ICONS[key];
            return (
              <div
                key={key}
                className="overflow-hidden rounded-xl border border-border"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start text-sm font-medium"
                  onClick={() => setOpenSection(open ? "overview" : key)}
                  aria-expanded={open}
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    {t(`sections.${key}.title`)}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                      open && "rotate-180"
                    )}
                  />
                </button>
                {open ? (
                  <div className="space-y-3 border-t border-border bg-muted/30 px-4 py-4 text-sm leading-relaxed text-muted-foreground">
                    <p>{t(`sections.${key}.body`)}</p>
                    {key === "contact" ? (
                      <div className="flex flex-wrap gap-3 pt-1">
                        <Link
                          href="/merchant/support"
                          className="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground"
                        >
                          {t("goToSupport")}
                        </Link>
                        {mailtoHref ? (
                          <a
                            href={mailtoHref}
                            className="inline-flex h-9 items-center gap-2 rounded-lg border border-input bg-background px-3 text-xs font-medium text-foreground hover:bg-muted"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            {t("emailUs")}
                          </a>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">{t("footerTitle")}</p>
            <p className="text-xs text-muted-foreground">{t("footerHint")}</p>
          </div>
          <Link
            href="/merchant/support"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium hover:bg-muted"
          >
            {t("goToSupport")}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
