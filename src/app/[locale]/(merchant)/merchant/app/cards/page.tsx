"use client";

import { useTranslations } from "next-intl";
import { AppStudioEditorShell } from "@/components/merchant/app-studio-editor-shell";
import { AppStudioLayoutGrid } from "@/components/merchant/app-studio-layout-grid";
import { useAppStyle } from "@/components/merchant/app-style-provider";
import { PRODUCT_CARD_LAYOUTS } from "@/lib/app-studio-catalogs";

export default function AppStudioCardsPage() {
  const t = useTranslations("merchant.appStudio.pages.cards");
  const { preview, updatePreview } = useAppStyle();

  return (
    <AppStudioEditorShell title={t("title")} subtitle={t("subtitle")}>
      <AppStudioLayoutGrid
        title={t("gridTitle")}
        options={PRODUCT_CARD_LAYOUTS}
        selectedId={preview.productCardLayoutId}
        onSelect={(id) => {
          updatePreview({
            productCardLayoutId: id,
            showStars: id === 24 || id === 25 || id >= 24,
            showComparePrice: id === 26 || id === 5 || id === 23 || id === 24,
            productCardStyle:
              id === 24
                ? "rating"
                : id === 5
                  ? "discount"
                  : id === 3 || id === 16
                    ? "price"
                    : "photo",
          });
        }}
      />
    </AppStudioEditorShell>
  );
}
