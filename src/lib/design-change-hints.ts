import type { AppPreviewConfig } from "@/lib/app-preview-config";
import type { AppStylePresetKey } from "@/lib/app-style-presets";

type Snapshot = {
  presetKey: AppStylePresetKey;
  preview: AppPreviewConfig;
};

/** Short human-readable list of what changed between two design snapshots */
export function describeDesignChanges(
  prev: Snapshot | null,
  next: Snapshot
): string[] {
  if (!prev) return ["App design updated"];

  const hints: string[] = [];
  if (prev.presetKey !== next.presetKey) {
    hints.push(`Preset → Like ${capitalize(next.presetKey)}`);
  }

  const a = prev.preview;
  const b = next.preview;
  const field = (
    label: string,
    before: string | number | boolean | undefined,
    after: string | number | boolean | undefined
  ) => {
    if (before !== after) hints.push(`${label} → ${String(after)}`);
  };

  field("Theme", a.readyTheme, b.readyTheme);
  field("Primary color", a.primaryColor, b.primaryColor);
  field("Secondary color", a.secondaryColor, b.secondaryColor);
  field("Typeface", a.typeface, b.typeface);
  field("Header", a.headerStyle, b.headerStyle);
  field("Bottom bar", a.bottomBarStyle, b.bottomBarStyle);
  field("Banner layout", `#${a.bannerLayoutId}`, `#${b.bannerLayoutId}`);
  field(
    "Product card",
    `#${a.productCardLayoutId}`,
    `#${b.productCardLayoutId}`
  );
  field("Category layout", `#${a.categoryLayoutId}`, `#${b.categoryLayoutId}`);
  field("Announcement style", a.announcementStyle, b.announcementStyle);
  field("Announcement icon", a.announcementShowIcon, b.announcementShowIcon);
  field("Announcement bold", a.announcementBold, b.announcementBold);
  field(
    "Announcement dismiss",
    a.announcementDismissible,
    b.announcementDismissible
  );

  if (JSON.stringify(a.announcementBars) !== JSON.stringify(b.announcementBars)) {
    hints.push("Announcement bars updated");
  }
  if (
    JSON.stringify(a.homeSections) !== JSON.stringify(b.homeSections) ||
    JSON.stringify(a.hiddenHomeSections) !==
      JSON.stringify(b.hiddenHomeSections)
  ) {
    hints.push("Home section order / visibility");
  }
  if (
    JSON.stringify(a.blockOrder) !== JSON.stringify(b.blockOrder) ||
    JSON.stringify(a.hiddenBlocks) !== JSON.stringify(b.hiddenBlocks)
  ) {
    hints.push("Home block layout");
  }
  if (a.storeNameEn !== b.storeNameEn || a.storeNameAr !== b.storeNameAr) {
    hints.push("Store name");
  }

  return hints.length ? hints.slice(0, 8) : ["App design updated"];
}

function capitalize(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}
