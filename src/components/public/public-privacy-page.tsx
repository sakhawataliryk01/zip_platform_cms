"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ChevronDown,
  Database,
  Eye,
  FileLock,
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
  howWeUse: FileLock,
  zidIntegration: Store,
  storageSecurity: KeyRound,
  sharing: Share2,
  yourRights: Scale,
  contact: Mail,
} as const;

export function PublicPrivacyPage() {
  const t = useTranslations("merchant.privacyPolicy");
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || "";
  const [openSection, setOpenSection] =
    useState<(typeof SECTION_KEYS)[number]>("overview");

  const mailtoHref = useMemo(() => {
    if (!supportEmail) return null;
    return `mailto:${supportEmail}?subject=${encodeURIComponent("ZidFlow Privacy Inquiry")}`;
  }, [supportEmail]);

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="space-y-3 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Shield className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl">{t("heading")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t("description")}</p>
          </div>
          <p className="text-xs text-muted-foreground">{t("lastUpdated")}</p>
          {supportEmail ? (
            <a
              href={mailtoHref ?? undefined}
              className="inline-flex w-fit items-center gap-2 text-sm text-primary hover:underline"
            >
              <Mail className="h-4 w-4" />
              {supportEmail}
            </a>
          ) : (
            <p className="text-xs text-amber-700">{t("contactMissing")}</p>
          )}
        </CardHeader>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{t("sectionsTitle")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("sectionsSubtitle")}</p>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {SECTION_KEYS.map((key) => {
            const Icon = SECTION_ICONS[key];
            const open = openSection === key;
            return (
              <div key={key}>
                <button
                  type="button"
                  onClick={() => setOpenSection(open ? "overview" : key)}
                  className="flex w-full items-center gap-3 px-4 py-4 text-start hover:bg-muted/40"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium">
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
                          href="/support"
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
            href="/support"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium hover:bg-muted"
          >
            {t("goToSupport")}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
