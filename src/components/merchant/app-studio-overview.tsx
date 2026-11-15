"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Clapperboard,
  Images,
  LayoutGrid,
  LayoutTemplate,
  Megaphone,
  Palette,
  Rows3,
  Tags,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { DeskPageHeader } from "@/components/merchant/desk-page-header";
import { LiveAppPhone } from "@/components/merchant/live-app-phone";
import { useAppStyle } from "@/components/merchant/app-style-provider";
import { APP_STYLE_PRESETS } from "@/lib/nav";

const TOOLS = [
  { key: "appearance", href: "/merchant/app/design", icon: Palette },
  { key: "homeOrder", href: "/merchant/app/home-order", icon: Rows3 },
  { key: "banners", href: "/merchant/app/banners", icon: LayoutTemplate },
  { key: "productCards", href: "/merchant/app/cards", icon: LayoutGrid },
  { key: "categories", href: "/merchant/app/categories", icon: Tags },
  { key: "introPosters", href: "/merchant/intro-posters", icon: Images },
  { key: "announcementBar", href: "/merchant/app-content", icon: Megaphone },
  { key: "reels", href: "/merchant/video-categories", icon: Clapperboard },
] as const;

export function AppStudioOverview({
  storeName = "Al Noor Store",
}: {
  storeName?: string;
}) {
  const t = useTranslations("merchant.appStudio");
  const tDesk = useTranslations("merchant.desk");
  const tNav = useTranslations("nav.merchant");
  const locale = useLocale();
  const isAr = locale === "ar";
  const { presetKey, style, preview, updatePreview } = useAppStyle();

  useEffect(() => {
    if (
      storeName &&
      preview.storeNameEn === "Al Noor Store" &&
      storeName !== "Al Noor Store"
    ) {
      updatePreview({ storeNameEn: storeName });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeName]);

  const presetMeta =
    APP_STYLE_PRESETS.find((p) => p.key === presetKey) || APP_STYLE_PRESETS[2];

  return (
    <div className="space-y-6">
      <DeskPageHeader
        eyebrow={tDesk("appStudio")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(300px,340px)_minmax(0,1fr)]">
        <section className="rounded-[1.6rem] border border-[#e7e2d6] bg-white p-4 shadow-[0_1px_0_rgba(27,43,33,0.03)] xl:sticky xl:top-24 xl:self-start">
          <div className="mb-4 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-desk-ink">
              {t("livePreview")}
            </p>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
              style={{
                backgroundColor: style.accentSoft,
                color: style.accent === "#FEEE00" ? "#1b2b21" : style.accent,
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor:
                    style.accent === "#FEEE00" ? "#C9A227" : style.accent,
                }}
              />
              {tNav(presetMeta.labelKey as "likeAmazon")}
            </span>
          </div>
          <div className="flex justify-center rounded-[1.4rem] bg-[radial-gradient(ellipse_at_center,#fffdf8_0%,#f3f1ea_70%)] px-3 py-5">
            <LiveAppPhone
              storeName={storeName}
              isAr={isAr}
              size="md"
              interactive
              showTapHint={false}
            />
          </div>
          <p className="mt-2 text-center text-xs text-desk-muted">
            {t("screens.tapHint")}
          </p>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.key}
                href={tool.href}
                className="rounded-[1.35rem] border border-[#e7e2d6] bg-white p-4 text-start shadow-[0_1px_0_rgba(27,43,33,0.03)] transition hover:-translate-y-0.5 hover:border-[#c9d6cb] hover:shadow-md"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-desk-green-soft text-desk-green">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-base font-semibold text-desk-ink">
                  {t(`tools.${tool.key}.title`)}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-desk-muted">
                  {t(`tools.${tool.key}.desc`)}
                </p>
                <p className="mt-3 text-xs font-medium text-desk-green">
                  {isAr ? "فتح ←" : "Open →"}
                </p>
              </Link>
            );
          })}
        </section>
      </div>
    </div>
  );
}
