"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import type { AppLayout, AppSection, AppTheme } from "@/lib/data/app-sections";

function LayoutPreview({
  style,
  primary,
  secondary,
  accent,
  bg,
}: {
  style: AppLayout["previewStyle"];
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
}) {
  return (
    <div
      className="relative mx-auto h-44 w-[110px] overflow-hidden rounded-[1.25rem] border-[3px] border-slate-800 shadow-md"
      style={{ backgroundColor: bg }}
    >
      {/* status bar */}
      <div className="h-3 w-full" style={{ backgroundColor: primary }} />

      {style === "classic" && (
        <div className="space-y-1.5 p-2">
          <div className="h-5 rounded" style={{ backgroundColor: primary }} />
          <div className="h-4 rounded" style={{ backgroundColor: secondary }} />
          <div className="h-4 rounded" style={{ backgroundColor: secondary }} />
          <div className="h-4 rounded" style={{ backgroundColor: accent }} />
        </div>
      )}

      {style === "grid" && (
        <div className="space-y-1.5 p-2">
          <div className="h-4 rounded" style={{ backgroundColor: primary }} />
          <div className="grid grid-cols-2 gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-8 rounded"
                style={{ backgroundColor: i % 2 ? secondary : accent }}
              />
            ))}
          </div>
        </div>
      )}

      {style === "banner" && (
        <div className="space-y-1.5 p-2">
          <div className="h-14 rounded-md" style={{ backgroundColor: primary }} />
          <div className="h-3 rounded" style={{ backgroundColor: secondary }} />
          <div className="grid grid-cols-3 gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-6 rounded"
                style={{ backgroundColor: accent }}
              />
            ))}
          </div>
        </div>
      )}

      {style === "tabs" && (
        <div className="flex h-[calc(100%-0.75rem)] flex-col">
          <div className="flex-1 space-y-1.5 p-2">
            <div className="h-8 rounded" style={{ backgroundColor: accent }} />
            <div className="h-8 rounded" style={{ backgroundColor: secondary }} />
            <div className="h-8 rounded" style={{ backgroundColor: accent }} />
          </div>
          <div
            className="mt-auto grid grid-cols-4 gap-0.5 px-1 py-1.5"
            style={{ backgroundColor: primary }}
          >
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="mx-auto h-2 w-2 rounded-full bg-white/80" />
            ))}
          </div>
        </div>
      )}

      {style === "cards" && (
        <div className="space-y-1.5 p-2">
          <div className="h-4 rounded" style={{ backgroundColor: primary }} />
          <div
            className="h-12 rounded-lg border border-black/5"
            style={{ backgroundColor: secondary }}
          />
          <div
            className="h-12 rounded-lg border border-black/5"
            style={{ backgroundColor: accent }}
          />
        </div>
      )}

      {style === "split" && (
        <div className="flex h-[calc(100%-0.75rem)] gap-1 p-1.5">
          <div className="w-1/3 space-y-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-5 rounded"
                style={{ backgroundColor: i === 0 ? primary : accent }}
              />
            ))}
          </div>
          <div className="flex-1 space-y-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-7 rounded"
                style={{ backgroundColor: secondary }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MerchantSectionsPage() {
  const t = useTranslations("merchant.sections");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [themes, setThemes] = useState<AppTheme[]>([]);
  const [layouts, setLayouts] = useState<AppLayout[]>([]);
  const [selectedThemeKey, setSelectedThemeKey] = useState("teal");
  const [selectedLayoutKey, setSelectedLayoutKey] = useState("classic");
  const [sections, setSections] = useState<AppSection[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/merchant/app-sections");
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || tCommon("error"));
        return;
      }
      setThemes(data.themes || []);
      setLayouts(data.layouts || []);
      setSelectedThemeKey(data.selectedThemeKey || "teal");
      setSelectedLayoutKey(data.selectedLayoutKey || "classic");
      setSections(data.sections || []);
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const savePreference = async (payload: {
    themeKey?: string;
    layoutKey?: string;
  }) => {
    if (payload.themeKey) setSelectedThemeKey(payload.themeKey);
    if (payload.layoutKey) setSelectedLayoutKey(payload.layoutKey);
    setSaving(true);
    try {
      const res = await fetch("/api/merchant/app-sections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || tCommon("error"));
        return;
      }
      toast.success(
        payload.layoutKey ? t("layoutSaved") : t("themeSaved")
      );
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setSaving(false);
    }
  };

  const selectedTheme =
    themes.find((th) => th.key === selectedThemeKey) || themes[0];
  const selectedLayout =
    layouts.find((l) => l.key === selectedLayoutKey) || layouts[0];

  if (loading) return <LoadingState label={tCommon("loading")} />;

  const previewColors = selectedTheme || {
    primaryColor: "#0F766E",
    secondaryColor: "#134E4A",
    accentColor: "#CCFBF1",
    backgroundColor: "#F8FAFC",
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b text-start text-muted-foreground">
                  <th className="pb-3 font-medium">{t("sectionName")}</th>
                  <th className="pb-3 font-medium">{tCommon("status")}</th>
                  <th className="pb-3 font-medium">{t("sortOrder")}</th>
                </tr>
              </thead>
              <tbody>
                {sections.map((s) => (
                  <tr key={s.id} className="border-b border-border/70">
                    <td className="py-3 font-medium">
                      {isAr && s.titleAr ? s.titleAr : s.title}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="py-3">{s.sortOrder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Layout designs — primary selection */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{t("chooseLayout")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("chooseLayoutHint")}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {layouts.map((layout) => {
              const active = layout.key === selectedLayoutKey;
              return (
                <button
                  key={layout.key}
                  type="button"
                  disabled={saving}
                  onClick={() => savePreference({ layoutKey: layout.key })}
                  className={cn(
                    "rounded-xl border p-4 text-start transition-all",
                    active
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  <LayoutPreview
                    style={layout.previewStyle}
                    primary={previewColors.primaryColor}
                    secondary={previewColors.secondaryColor}
                    accent={previewColors.accentColor}
                    bg={previewColors.backgroundColor}
                  />
                  <div className="mt-3 flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">
                        {isAr ? layout.nameAr : layout.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {isAr ? layout.descriptionAr : layout.description}
                      </p>
                    </div>
                    {active && (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedLayout && (
            <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm">
              <p className="font-medium">{t("selectedLayout")}</p>
              <p className="mt-1 text-muted-foreground">
                {isAr ? selectedLayout.nameAr : selectedLayout.name}
              </p>
              <Button
                className="mt-4"
                disabled={saving}
                onClick={() =>
                  savePreference({ layoutKey: selectedLayoutKey })
                }
              >
                {saving ? tCommon("loading") : t("saveLayout")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Color theme — secondary */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{t("chooseTheme")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("chooseThemeHint")}</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {themes.map((theme) => {
              const active = theme.key === selectedThemeKey;
              return (
                <button
                  key={theme.key}
                  type="button"
                  disabled={saving}
                  onClick={() => savePreference({ themeKey: theme.key })}
                  className={cn(
                    "rounded-xl border p-4 text-start transition-all",
                    active
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  <div className="mb-3 flex h-14 overflow-hidden rounded-lg border border-black/5">
                    <div
                      className="w-1/3"
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                    <div
                      className="w-1/3"
                      style={{ backgroundColor: theme.secondaryColor }}
                    />
                    <div
                      className="w-1/3"
                      style={{ backgroundColor: theme.backgroundColor }}
                    />
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">
                        {isAr ? theme.nameAr : theme.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {isAr ? theme.descriptionAr : theme.description}
                      </p>
                    </div>
                    {active && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
