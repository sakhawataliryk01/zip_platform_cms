"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import { AppStudioEditorShell } from "@/components/merchant/app-studio-editor-shell";
import { useAppStyle } from "@/components/merchant/app-style-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { AnnouncementBarItem } from "@/lib/app-preview-config";

function syncPromoFromBars(bars: AnnouncementBarItem[]) {
  const active = bars.find((b) => b.visible) || bars[0];
  return {
    announcementBars: bars,
    promoTextEn: active?.textEn || "",
    promoTextAr: active?.textAr || "",
  };
}

export default function AppStudioAnnouncementPage() {
  const t = useTranslations("merchant.appStudio.pages.announcement");
  const { preview, updatePreview } = useAppStyle();
  const [draft, setDraft] = useState("");

  const bars = preview.announcementBars || [];

  const setBars = (next: AnnouncementBarItem[]) => {
    updatePreview(syncPromoFromBars(next));
  };

  const toggleOption = (
    key:
      | "announcementShowIcon"
      | "announcementBold"
      | "announcementDismissible"
  ) => {
    updatePreview({ [key]: !preview[key] });
  };

  const addBar = () => {
    const text = draft.trim();
    if (!text) return;
    const id = `bar-${Date.now()}`;
    setBars([
      ...bars.map((b) => ({ ...b, visible: false })),
      {
        id,
        textEn: text,
        textAr: text,
        visible: true,
      },
    ]);
    setDraft("");
  };

  const updateBar = (id: string, patch: Partial<AnnouncementBarItem>) => {
    setBars(
      bars.map((b) => {
        if (b.id !== id) return b;
        return { ...b, ...patch };
      })
    );
  };

  const setVisible = (id: string) => {
    setBars(bars.map((b) => ({ ...b, visible: b.id === id })));
  };

  const pauseBar = (id: string) => {
    setBars(bars.map((b) => (b.id === id ? { ...b, visible: false } : b)));
  };

  const removeBar = (id: string) => {
    const next = bars.filter((b) => b.id !== id);
    if (next.length && !next.some((b) => b.visible)) {
      next[0] = { ...next[0], visible: true };
    }
    setBars(next);
  };

  return (
    <AppStudioEditorShell title={t("title")} subtitle={t("subtitle")}>
      <div className="space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-desk-ink">{t("options")}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <OptionChip
              active={preview.announcementShowIcon}
              onClick={() => toggleOption("announcementShowIcon")}
              label={t("icon")}
            />
            <OptionChip
              active={preview.announcementBold}
              onClick={() => toggleOption("announcementBold")}
              label={t("bold")}
            />
            <OptionChip
              active={preview.announcementDismissible}
              onClick={() => toggleOption("announcementDismissible")}
              label={t("dismiss")}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-[#e7e2d6] bg-[#fbfaf6] p-4">
          <Label className="text-xs text-desk-muted">{t("barText")}</Label>
          <div className="mt-2 flex gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t("barTextPlaceholder")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addBar();
                }
              }}
              className="bg-white"
            />
            <Button
              type="button"
              onClick={addBar}
              className="shrink-0 bg-desk-green text-white hover:bg-[#346940]"
            >
              <Plus className="me-1 h-4 w-4" />
              {t("add")}
            </Button>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-desk-ink">{t("listTitle")}</h2>
          {bars.length === 0 ? (
            <p className="text-sm text-desk-muted">{t("empty")}</p>
          ) : (
            bars.map((bar, index) => (
              <article
                key={bar.id}
                className={cn(
                  "rounded-2xl border p-4",
                  bar.visible
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-[#e7e2d6] bg-white"
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-desk-muted">
                      {t("barN", { n: index + 1 })}
                    </p>
                    <p className="mt-1 text-sm font-medium text-desk-ink">
                      {bar.textAr} / {bar.textEn}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {bar.visible ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-emerald-300 bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                        onClick={() => pauseBar(bar.id)}
                      >
                        {t("visible")}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setVisible(bar.id)}
                      >
                        {t("paused")}
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => removeBar(bar.id)}
                      aria-label={t("remove")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-desk-muted">
                      {t("textAr")}
                    </Label>
                    <Input
                      value={bar.textAr}
                      onChange={(e) =>
                        updateBar(bar.id, { textAr: e.target.value })
                      }
                      dir="rtl"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-desk-muted">
                      {t("textEn")}
                    </Label>
                    <Input
                      value={bar.textEn}
                      onChange={(e) =>
                        updateBar(bar.id, { textEn: e.target.value })
                      }
                      className="bg-white"
                    />
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </AppStudioEditorShell>
  );
}

function OptionChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
        active
          ? "border-desk-green bg-desk-green-soft text-desk-ink"
          : "border-[#e7e2d6] bg-white text-desk-muted hover:border-desk-green/40"
      )}
    >
      {label}
    </button>
  );
}
