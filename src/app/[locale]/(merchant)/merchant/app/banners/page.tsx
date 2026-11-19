"use client";

import { useTranslations } from "next-intl";
import { AppStudioEditorShell } from "@/components/merchant/app-studio-editor-shell";
import { AppStudioLayoutGrid } from "@/components/merchant/app-studio-layout-grid";
import { AppStudioBannerUpload } from "@/components/merchant/app-studio-banner-upload";
import { useAppStyle } from "@/components/merchant/app-style-provider";
import { BANNER_LAYOUTS } from "@/lib/app-studio-catalogs";

export default function AppStudioBannersPage() {
  const t = useTranslations("merchant.appStudio.pages.banners");
  const { preview, updatePreview } = useAppStyle();

  return (
    <AppStudioEditorShell title={t("title")} subtitle={t("subtitle")}>
      <div className="space-y-8">
        <AppStudioBannerUpload />

        <div className="border-t border-[#eee9dc] pt-6">
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
        </div>
      </div>
    </AppStudioEditorShell>
  );
}
