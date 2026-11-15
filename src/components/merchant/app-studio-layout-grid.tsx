"use client";

import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import type { StudioLayoutOption } from "@/lib/app-studio-catalogs";

export function AppStudioLayoutGrid({
  title,
  options,
  selectedId,
  onSelect,
}: {
  title: string;
  options: StudioLayoutOption[];
  selectedId: number;
  onSelect: (id: number) => void;
}) {
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-desk-ink">{title}</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {options.map((option) => {
          const selected = option.id === selectedId;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={cn(
                "rounded-2xl border p-3 text-start transition",
                selected
                  ? "border-desk-green bg-desk-green-soft/50 ring-2 ring-desk-green/20"
                  : "border-[#e7e2d6] bg-[#fbfaf7] hover:border-[#c9d6cb]"
              )}
            >
              <p className="text-[11px] font-semibold text-desk-muted">
                {option.id}
              </p>
              <p className="mt-1 text-sm font-semibold text-desk-ink">
                {isAr ? option.nameAr : option.nameEn}
              </p>
              <p className="mt-1 text-xs leading-snug text-desk-muted">
                {isAr ? option.hintAr : option.hintEn}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
