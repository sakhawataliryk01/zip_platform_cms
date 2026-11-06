"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Check,
  GripVertical,
  Heart,
  Home,
  Plus,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ADDABLE_SECTION_TYPES,
  inferSectionType,
  type AppLayout,
  type AppSection,
  type AppSectionType,
  type AppTheme,
} from "@/lib/data/app-sections-shared";
import { LoadingState } from "@/components/shared/empty-state";

function sectionPreviewBlock(
  type: AppSectionType,
  colors: { primary: string; secondary: string; accent: string }
) {
  switch (type) {
    case "ads_bar":
      return (
        <div
          className="rounded-md px-2 py-1 text-[9px] font-medium text-white"
          style={{ backgroundColor: colors.primary }}
        >
          Free shipping today
        </div>
      );
    case "image_slider":
      return (
        <div className="flex gap-1 overflow-hidden">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-16 min-w-[70%] flex-1 rounded-lg"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              }}
            />
          ))}
        </div>
      );
    case "promo_banner":
      return (
        <div
          className="flex h-14 items-center justify-between rounded-xl px-3 text-[10px] font-semibold text-white"
          style={{ backgroundColor: colors.secondary }}
        >
          <span>Summer Sale</span>
          <span className="rounded-full bg-white/20 px-2 py-0.5">Shop</span>
        </div>
      );
    case "products":
      return (
        <div className="grid grid-cols-2 gap-1.5">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-black/5 bg-white"
            >
              <div
                className="h-16"
                style={{
                  background: `linear-gradient(160deg, ${colors.accent}, ${colors.primary}55)`,
                }}
              />
              <div className="space-y-1 p-1.5">
                <div className="h-1.5 w-3/4 rounded bg-slate-200" />
                <div className="h-1.5 w-1/2 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      );
    case "category_grid":
    case "categories":
      return (
        <div className="grid grid-cols-3 gap-1.5">
          {["New", "Wear", "Bags"].map((label, i) => (
            <div key={label} className="text-center">
              <div
                className="mx-auto mb-1 h-9 w-9 rounded-full"
                style={{
                  backgroundColor: i % 2 ? colors.accent : colors.primary + "33",
                }}
              />
              <p className="text-[8px] text-slate-600">{label}</p>
            </div>
          ))}
        </div>
      );
    case "videos":
      return (
        <div className="flex gap-1.5 overflow-hidden">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-20 w-14 shrink-0 rounded-xl"
              style={{
                background: `linear-gradient(180deg, ${colors.secondary}, ${colors.primary})`,
              }}
            />
          ))}
        </div>
      );
    case "reviews":
      return (
        <div className="rounded-xl border border-slate-100 bg-white p-2">
          <div className="mb-1 flex gap-0.5 text-[9px] text-amber-500">
            ★★★★★
          </div>
          <div className="h-1.5 w-full rounded bg-slate-100" />
          <div className="mt-1 h-1.5 w-2/3 rounded bg-slate-100" />
        </div>
      );
    case "offers":
      return (
        <div
          className="rounded-xl px-2 py-3 text-center text-[10px] font-semibold text-white"
          style={{ backgroundColor: colors.primary }}
        >
          Special Offers
        </div>
      );
    default:
      return (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-3 text-center text-[9px] text-slate-400">
          Section
        </div>
      );
  }
}

export function AppInterfaceBuilder() {
  const t = useTranslations("merchant.sections");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [themes, setThemes] = useState<AppTheme[]>([]);
  const [layouts, setLayouts] = useState<AppLayout[]>([]);
  const [selectedThemeKey, setSelectedThemeKey] = useState("teal");
  const [selectedLayoutKey, setSelectedLayoutKey] = useState("classic");
  const [sections, setSections] = useState<AppSection[]>([]);
  const [dirty, setDirty] = useState(false);

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
      const nextSections = (data.sections || []) as AppSection[];
      setSections(
        nextSections.map((s) => ({ ...s, type: inferSectionType(s) }))
      );
      setDirty(false);
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

  const colors = useMemo(() => {
    const theme = themes.find((th) => th.key === selectedThemeKey) || themes[0];
    return {
      primary: theme?.primaryColor || "#0F766E",
      secondary: theme?.secondaryColor || "#134E4A",
      accent: theme?.accentColor || "#CCFBF1",
      bg: theme?.backgroundColor || "#F8FAFC",
    };
  }, [themes, selectedThemeKey]);

  const moveSection = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0) return;
    setSections((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next.map((s, i) => ({ ...s, sortOrder: i + 1 }));
    });
    setDirty(true);
  };

  const saveArrangement = async () => {
    setReordering(true);
    try {
      const res = await fetch("/api/merchant/app-sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: sections.map((s) => s.id) }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || tCommon("error"));
        return;
      }
      if (Array.isArray(data.sections)) {
        setSections(
          data.sections.map((s: AppSection) => ({
            ...s,
            type: inferSectionType(s),
          }))
        );
      }
      setDirty(false);
      toast.success(t("arrangeSaved"));
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setReordering(false);
    }
  };

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
      toast.success(payload.layoutKey ? t("layoutSaved") : t("themeSaved"));
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setSaving(false);
    }
  };

  const addSection = (type: AppSectionType) => {
    const meta = ADDABLE_SECTION_TYPES.find((s) => s.type === type);
    if (!meta) return;
    const id = `sec-${type}-${Date.now()}`;
    setSections((prev) => [
      ...prev,
      {
        id,
        title: meta.title,
        titleAr: meta.titleAr,
        sortOrder: prev.length + 1,
        status: "ACTIVE",
        type,
      },
    ]);
    setShowAdd(false);
    setDirty(true);
    toast.success(t("sectionAdded"));
  };

  const removeSection = (id: string) => {
    setSections((prev) =>
      prev
        .filter((s) => s.id !== id)
        .map((s, i) => ({ ...s, sortOrder: i + 1 }))
    );
    setDirty(true);
  };

  if (loading) return <LoadingState label={tCommon("loading")} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            {t("title")}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{t("builderSubtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => setShowThemes((v) => !v)}
          >
            {t("themeAndLayout")}
          </Button>
          {dirty ? (
            <Button
              className="rounded-xl bg-slate-900 text-white hover:bg-slate-800"
              disabled={reordering}
              onClick={saveArrangement}
            >
              {reordering ? tCommon("loading") : t("saveArrangement")}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        {/* Page management */}
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {t("pageManagement")}
              </p>
              <p className="text-xs text-slate-500">{t("arrangeHint")}</p>
            </div>
          </div>

          <Button
            className="mb-3 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800"
            onClick={() => setShowAdd((v) => !v)}
          >
            <Plus className="h-4 w-4" />
            {t("addCategory")}
          </Button>

          {showAdd ? (
            <div className="mb-3 space-y-1 rounded-xl border border-slate-100 bg-slate-50 p-2">
              {ADDABLE_SECTION_TYPES.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => addSection(item.type)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-start text-sm hover:bg-white"
                >
                  <span>{isAr ? item.titleAr : item.title}</span>
                  <Plus className="h-3.5 w-3.5 text-slate-400" />
                </button>
              ))}
            </div>
          ) : null}

          <ul className="space-y-2">
            {sections.map((s, index) => {
              const type = inferSectionType(s);
              return (
                <li
                  key={s.id}
                  draggable={!reordering}
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setOverIndex(index);
                  }}
                  onDrop={() => {
                    if (dragIndex !== null) moveSection(dragIndex, index);
                    setDragIndex(null);
                    setOverIndex(null);
                  }}
                  onDragEnd={() => {
                    setDragIndex(null);
                    setOverIndex(null);
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2.5 transition-colors",
                    !reordering && "cursor-grab active:cursor-grabbing",
                    overIndex === index && dragIndex !== index
                      ? "border-slate-900 bg-slate-50"
                      : null,
                    dragIndex === index ? "opacity-50" : null
                  )}
                >
                  <GripVertical className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">
                    {isAr && s.titleAr ? s.titleAr : s.title}
                  </span>
                  <button
                    type="button"
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    onClick={() => removeSection(s.id)}
                    aria-label={tCommon("delete")}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <span className="sr-only">{type}</span>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Live phone preview */}
        <div className="flex min-h-[640px] items-start justify-center rounded-2xl border border-slate-200 bg-[linear-gradient(to_right,#eef2f7_1px,transparent_1px),linear-gradient(to_bottom,#eef2f7_1px,transparent_1px)] bg-[size:24px_24px] bg-slate-50 p-6 shadow-sm">
          <div className="relative w-[300px] shrink-0">
            <div className="absolute -inset-3 rounded-[2.2rem] border border-slate-300/70 bg-white/40 shadow-xl" />
            <div
              className="relative overflow-hidden rounded-[2rem] border-[3px] border-slate-900 shadow-2xl"
              style={{ backgroundColor: colors.bg }}
            >
              <div className="flex items-center justify-between px-4 pb-1 pt-3 text-[10px] text-slate-500">
                <span>9:41</span>
                <span className="h-3 w-16 rounded-full bg-slate-900" />
                <span>●●</span>
              </div>

              <div className="border-b border-black/5 px-4 py-2">
                <p className="text-center text-sm font-semibold text-slate-900">
                  {t("previewStoreName")}
                </p>
                <div className="mt-2 flex gap-1.5 overflow-hidden">
                  {(isAr
                    ? ["جديد", "ملابس", "أحذية", "حقائب"]
                    : ["New", "Clothes", "Shoes", "Bags"]
                  ).map((label) => (
                    <span
                      key={label}
                      className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[9px] text-slate-600 shadow-sm"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="max-h-[520px] space-y-3 overflow-y-auto px-3 py-3">
                {sections.map((s) => (
                  <div key={s.id}>
                    {sectionPreviewBlock(inferSectionType(s), colors)}
                  </div>
                ))}
                {sections.length === 0 ? (
                  <p className="py-10 text-center text-xs text-slate-400">
                    {t("emptyPreview")}
                  </p>
                ) : null}
              </div>

              <div className="grid grid-cols-4 border-t border-black/5 bg-white px-2 py-2 text-slate-500">
                <div className="flex flex-col items-center gap-0.5 text-[8px]">
                  <Home className="h-4 w-4" style={{ color: colors.primary }} />
                  Home
                </div>
                <div className="flex flex-col items-center gap-0.5 text-[8px]">
                  <Search className="h-4 w-4" />
                  Search
                </div>
                <div className="flex flex-col items-center gap-0.5 text-[8px]">
                  <Heart className="h-4 w-4" />
                  Saved
                </div>
                <div className="flex flex-col items-center gap-0.5 text-[8px]">
                  <ShoppingBag className="h-4 w-4" />
                  Cart
                </div>
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-slate-500">
              {t("livePreview")}
            </p>
          </div>
        </div>
      </div>

      {showThemes ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={t("themeAndLayout")}
          onClick={() => setShowThemes(false)}
        >
          <div
            className="my-4 w-full max-w-3xl space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">
                  {t("themeAndLayout")}
                </p>
                <p className="text-xs text-slate-500">{t("builderSubtitle")}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl"
                onClick={() => setShowThemes(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">{t("chooseLayout")}</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {layouts.map((layout) => {
                  const active = layout.key === selectedLayoutKey;
                  return (
                    <button
                      key={layout.key}
                      type="button"
                      disabled={saving}
                      onClick={() => savePreference({ layoutKey: layout.key })}
                      className={cn(
                        "rounded-xl border p-3 text-start",
                        active
                          ? "border-slate-900 ring-2 ring-slate-900/20"
                          : "border-slate-200 hover:border-slate-400"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">
                            {isAr ? layout.nameAr : layout.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {isAr ? layout.descriptionAr : layout.description}
                          </p>
                        </div>
                        {active ? (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white">
                            <Check className="h-3 w-3" />
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">{t("chooseTheme")}</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {themes.map((theme) => {
                  const active = theme.key === selectedThemeKey;
                  return (
                    <button
                      key={theme.key}
                      type="button"
                      disabled={saving}
                      onClick={() => savePreference({ themeKey: theme.key })}
                      className={cn(
                        "rounded-xl border p-3 text-start",
                        active
                          ? "border-slate-900 ring-2 ring-slate-900/20"
                          : "border-slate-200 hover:border-slate-400"
                      )}
                    >
                      <div className="mb-2 flex h-10 overflow-hidden rounded-lg">
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
                      <p className="text-sm font-medium">
                        {isAr ? theme.nameAr : theme.name}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
