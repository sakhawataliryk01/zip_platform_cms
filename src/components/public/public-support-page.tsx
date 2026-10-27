"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ChevronDown,
  CircleHelp,
  Headphones,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

const FAQ_KEYS = [
  "connectStore",
  "authorizeApi",
  "troubleshoot",
  "contactSupport",
] as const;

const SUPPORT_PHONE = "+966555683990";
const SUPPORT_PHONE_TEL = "+966555683990";
const SUPPORT_WHATSAPP = "https://wa.me/966555683990";

export function PublicSupportPage() {
  const t = useTranslations("merchant.support");
  const tPublic = useTranslations("publicPages");
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || "";
  const [openFaq, setOpenFaq] = useState<(typeof FAQ_KEYS)[number] | null>(
    "connectStore"
  );

  const mailtoHref = useMemo(() => {
    if (!supportEmail) return null;
    return `mailto:${supportEmail}?subject=${encodeURIComponent("ZidFlow Support")}`;
  }, [supportEmail]);

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="space-y-3 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Headphones className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl">{tPublic("support.title")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {tPublic("support.subtitle")}
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <a
            href={`tel:${SUPPORT_PHONE_TEL}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4 hover:bg-muted/50"
          >
            <Phone className="h-5 w-5 text-primary" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                {tPublic("support.phone")}
              </p>
              <p className="truncate text-sm font-medium">{SUPPORT_PHONE}</p>
            </div>
          </a>
          <a
            href={SUPPORT_WHATSAPP}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4 hover:bg-muted/50"
          >
            <MessageCircle className="h-5 w-5 text-primary" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">WhatsApp</p>
              <p className="truncate text-sm font-medium">{SUPPORT_PHONE}</p>
            </div>
          </a>
          {supportEmail ? (
            <a
              href={mailtoHref ?? undefined}
              className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4 hover:bg-muted/50"
            >
              <Mail className="h-5 w-5 text-primary" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  {tPublic("support.email")}
                </p>
                <p className="truncate text-sm font-medium">{supportEmail}</p>
              </div>
            </a>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 p-4">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  {tPublic("support.email")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {tPublic("support.emailSoon")}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <CircleHelp className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{t("faq.title")}</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">{t("faq.subtitle")}</p>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {FAQ_KEYS.map((key) => {
            const open = openFaq === key;
            return (
              <div key={key}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(open ? null : key)}
                  className="flex w-full items-center gap-3 px-4 py-4 text-start hover:bg-muted/40"
                >
                  <span className="min-w-0 flex-1 text-sm font-medium">
                    {t(`faq.${key}.q`)}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                      open && "rotate-180"
                    )}
                  />
                </button>
                {open ? (
                  <div className="border-t border-border bg-muted/30 px-4 py-4 text-sm leading-relaxed text-muted-foreground">
                    {t(`faq.${key}.a`)}
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
            <p className="text-sm font-medium">{tPublic("support.privacyTitle")}</p>
            <p className="text-xs text-muted-foreground">
              {tPublic("support.privacyHint")}
            </p>
          </div>
          <Link
            href="/privacy"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium hover:bg-muted"
          >
            {tPublic("support.viewPrivacy")}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
