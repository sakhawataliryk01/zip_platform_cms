"use client";

import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, ChevronUp } from "lucide-react";
import { AppStudioEditorShell } from "@/components/merchant/app-studio-editor-shell";
import { useAppStyle } from "@/components/merchant/app-style-provider";
import { Button } from "@/components/ui/button";
import { HOME_SECTION_META } from "@/lib/app-studio-catalogs";
import { cn } from "@/lib/utils";
import type { HomeSectionId } from "@/lib/app-preview-config";

export default function AppStudioHomeOrderPage() {
  const t = useTranslations("merchant.appStudio.pages.homeOrder");
  const locale = useLocale();
  const isAr = locale === "ar";
  const { preview, toggleHomeSection, moveHomeSection } = useAppStyle();

  return (
    <AppStudioEditorShell title={t("title")} subtitle={t("subtitle")}>
      <div className="space-y-3">
        <p className="text-sm text-desk-muted">{t("hint")}</p>
        <ul className="space-y-2">
          {preview.homeSections.map((id, index) => {
            const meta = HOME_SECTION_META.find((s) => s.id === id);
            const hidden = preview.hiddenHomeSections.includes(
              id as HomeSectionId
            );
            return (
              <li
                key={id}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border px-4 py-3",
                  hidden
                    ? "border-dashed border-[#ddd6c8] bg-[#f7f5ef]"
                    : "border-[#e7e2d6] bg-white"
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-desk-ink">
                    {meta
                      ? isAr
                        ? meta.nameAr
                        : meta.nameEn
                      : id}
                  </p>
                  <p className="text-xs text-desk-muted">
                    {t("order")} {index + 1}
                  </p>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  disabled={index === 0}
                  onClick={() => moveHomeSection(id as HomeSectionId, "up")}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  disabled={index === preview.homeSections.length - 1}
                  onClick={() => moveHomeSection(id as HomeSectionId, "down")}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <button
                  type="button"
                  onClick={() => toggleHomeSection(id as HomeSectionId)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                    hidden
                      ? "border border-[#ddd6c8] bg-white text-desk-muted"
                      : "bg-desk-green text-white"
                  )}
                >
                  {hidden ? t("hidden") : t("shown")}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </AppStudioEditorShell>
  );
}
