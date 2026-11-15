"use client";

import { useTranslations } from "next-intl";
import { AppStudioEditorShell } from "@/components/merchant/app-studio-editor-shell";
import { AppStudioLayoutGrid } from "@/components/merchant/app-studio-layout-grid";
import { useAppStyle } from "@/components/merchant/app-style-provider";
import { BANNER_LAYOUTS } from "@/lib/app-studio-catalogs";

export default function AppStudioBannersPage() {
  const t = useTranslations("merchant.appStudio.pages.banners");
  const { preview, updatePreview } = useAppStyle();

  return (
    <AppStudioEditorShell title={t("title")} subtitle={t("subtitle")}>
      <AppStudioLayoutGrid
        title={t("gridTitle")}
        options={BANNER_LAYOUTS}
        selectedId={preview.bannerLayoutId}
        onSelect={(id) => {
          const layout = BANNER_LAYOUTS.find((l) => l.id === id);
          updatePreview({
            bannerLayoutId: id,
            announcementStyle:
              layout?.key.includes("32") || id === 32
                ? "tag"
                : id === 3 || id === 11
                  ? "pill"
                  : id === 10
                    ? "frame"
                    : id % 5 === 0
                      ? "marquee"
                      : "pill",
            heroTitleEn: layout?.nameEn || preview.heroTitleEn,
          });
        }}
      />
    </AppStudioEditorShell>
  );
}
