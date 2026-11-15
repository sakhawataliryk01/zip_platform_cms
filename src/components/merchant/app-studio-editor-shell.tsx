"use client";

import { useLocale, useTranslations } from "next-intl";
import { DeskPageHeader } from "@/components/merchant/desk-page-header";
import { LiveAppPhone } from "@/components/merchant/live-app-phone";

export function AppStudioEditorShell({
  title,
  subtitle,
  children,
  storeName,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  storeName?: string;
}) {
  const t = useTranslations("merchant.appStudio");
  const tDesk = useTranslations("merchant.desk");
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <div className="space-y-6">
      <DeskPageHeader
        eyebrow={tDesk("appStudio")}
        title={title}
        subtitle={subtitle}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(280px,320px)_minmax(0,1fr)]">
        <aside className="rounded-[1.6rem] border border-[#e7e2d6] bg-white p-4 shadow-[0_1px_0_rgba(27,43,33,0.03)] xl:sticky xl:top-24 xl:self-start">
          <p className="mb-3 text-sm font-semibold text-desk-ink">
            {t("livePreview")}
          </p>
          <div className="flex justify-center rounded-[1.4rem] bg-[radial-gradient(ellipse_at_center,#fffdf8_0%,#f3f1ea_70%)] px-2 py-5">
            <LiveAppPhone
              storeName={storeName}
              isAr={isAr}
              size="md"
              interactive
              showTapHint={false}
            />
          </div>
          <p className="mt-2 text-center text-[11px] text-desk-muted">
            {t("screens.tapHint")}
          </p>
        </aside>

        <section className="min-w-0 rounded-[1.6rem] border border-[#e7e2d6] bg-white p-5 shadow-[0_1px_0_rgba(27,43,33,0.03)]">
          {children}
        </section>
      </div>
    </div>
  );
}
