"use client";

import { useTranslations } from "next-intl";
import { AppStudioEditorShell } from "@/components/merchant/app-studio-editor-shell";
import { AppStudioLayoutGrid } from "@/components/merchant/app-studio-layout-grid";
import { useAppStyle } from "@/components/merchant/app-style-provider";
import { CATEGORY_LAYOUTS } from "@/lib/app-studio-catalogs";
import { cn } from "@/lib/utils";

export default function AppStudioCategoriesPage() {
  const t = useTranslations("merchant.appStudio.pages.categories");
  const { preview, updatePreview } = useAppStyle();

  return (
    <AppStudioEditorShell title={t("title")} subtitle={t("subtitle")}>
      <div className="space-y-5">
        <AppStudioLayoutGrid
          title={t("gridTitle")}
          options={CATEGORY_LAYOUTS}
          selectedId={preview.categoryLayoutId}
          onSelect={(id) => {
            updatePreview({
              categoryLayoutId: id,
              categoryLayout:
                id === 2 || id === 1
                  ? "round"
                  : id === 5 || id === 15
                    ? "row"
                    : "square",
            });
          }}
        />

        <div className="space-y-2">
          <p className="text-sm font-semibold text-desk-ink">{t("options")}</p>
          <div className="flex flex-wrap gap-2">
            <ToggleChip
              label={t("showCount")}
              active={preview.showCategoryCount}
              onClick={() =>
                updatePreview({
                  showCategoryCount: !preview.showCategoryCount,
                })
              }
            />
            <ToggleChip
              label={t("showPhoto")}
              active={preview.showCategoryPhoto}
              onClick={() =>
                updatePreview({
                  showCategoryPhoto: !preview.showCategoryPhoto,
                })
              }
            />
          </div>
        </div>
      </div>
    </AppStudioEditorShell>
  );
}

function ToggleChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-sm font-medium transition",
        active
          ? "bg-desk-green text-white"
          : "border border-[#e7e2d6] bg-white text-desk-ink hover:bg-[#f7f5ef]"
      )}
    >
      {label}
    </button>
  );
}
