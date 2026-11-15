"use client";

import { useTranslations } from "next-intl";
import { AppStudioEditorShell } from "@/components/merchant/app-studio-editor-shell";
import { useAppStyle } from "@/components/merchant/app-style-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  BOTTOM_BAR_STYLES,
  HEADER_STYLES,
  READY_THEMES,
  TYPEFACES,
} from "@/lib/app-studio-catalogs";

export default function AppStudioDesignPage() {
  const t = useTranslations("merchant.appStudio.pages.design");
  const { preview, updatePreview } = useAppStyle();

  return (
    <AppStudioEditorShell title={t("title")} subtitle={t("subtitle")}>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("storeNameEn")}</Label>
            <Input
              value={preview.storeNameEn}
              onChange={(e) => updatePreview({ storeNameEn: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("storeNameAr")}</Label>
            <Input
              value={preview.storeNameAr}
              onChange={(e) => updatePreview({ storeNameAr: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t("readyThemes")}</Label>
          <div className="flex flex-wrap gap-2">
            {READY_THEMES.map((theme) => {
              const selected = preview.readyTheme === theme.key;
              return (
                <button
                  key={theme.key}
                  type="button"
                  onClick={() =>
                    updatePreview({
                      readyTheme: theme.key,
                      primaryColor: theme.primary,
                      secondaryColor: theme.secondary,
                    })
                  }
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition",
                    selected
                      ? "border-desk-green bg-desk-green-soft text-desk-ink"
                      : "border-[#e7e2d6] bg-[#f7f5ef] hover:border-[#c9d6cb]"
                  )}
                >
                  <span className="flex h-4 w-8 overflow-hidden rounded-full">
                    <span
                      className="w-1/2"
                      style={{ backgroundColor: theme.primary }}
                    />
                    <span
                      className="w-1/2"
                      style={{ backgroundColor: theme.secondary }}
                    />
                  </span>
                  {theme.nameEn}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("primaryColor")}</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={preview.primaryColor || "#232F3E"}
                onChange={(e) =>
                  updatePreview({ primaryColor: e.target.value })
                }
                className="h-10 w-12 cursor-pointer rounded-lg border border-[#e7e2d6] bg-white p-1"
              />
              <Input
                value={preview.primaryColor}
                onChange={(e) =>
                  updatePreview({ primaryColor: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{t("secondaryColor")}</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={preview.secondaryColor || "#FF9900"}
                onChange={(e) =>
                  updatePreview({ secondaryColor: e.target.value })
                }
                className="h-10 w-12 cursor-pointer rounded-lg border border-[#e7e2d6] bg-white p-1"
              />
              <Input
                value={preview.secondaryColor}
                onChange={(e) =>
                  updatePreview({ secondaryColor: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <ChipRow
          label={t("typeface")}
          value={preview.typeface}
          options={TYPEFACES.map((x) => [x.key, x.nameEn] as [string, string])}
          onChange={(v) => updatePreview({ typeface: v })}
        />
        <ChipRow
          label={t("headerStyle")}
          value={preview.headerStyle}
          options={HEADER_STYLES.map(
            (x) => [x.key, x.nameEn] as [string, string]
          )}
          onChange={(v) => updatePreview({ headerStyle: v })}
        />
        <ChipRow
          label={t("bottomBar")}
          value={preview.bottomBarStyle}
          options={BOTTOM_BAR_STYLES.map(
            (x) => [x.key, x.nameEn] as [string, string]
          )}
          onChange={(v) => updatePreview({ bottomBarStyle: v })}
        />
      </div>
    </AppStudioEditorShell>
  );
}

function ChipRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: [string, string][];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map(([key, text]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm transition",
              value === key
                ? "bg-desk-green text-white"
                : "bg-[#f3f1ea] text-desk-ink hover:bg-[#e7e2d6]"
            )}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
