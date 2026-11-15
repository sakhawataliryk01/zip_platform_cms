import type { AppPreviewConfig } from "@/lib/app-preview-config";

export type DesignSummary = {
  presetKey: string;
  readyTheme: string;
  primaryColor: string;
  secondaryColor: string;
  typeface: string;
  headerStyle: string;
  bottomBarStyle: string;
  bannerLayoutId: number;
  productCardLayoutId: number;
  categoryLayoutId: number;
  storeNameEn: string;
  storeNameAr: string;
};

export type AdminNotificationItem = {
  id: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "APP_ORDER" | "PAYMENT" | "DESIGN_REQUEST";
  read: boolean;
  createdAt: string;
  merchantId?: string;
  merchantName?: string;
  businessName?: string;
  designSummary?: DesignSummary;
  /** Full App Studio preview so admin can render a live phone */
  preview?: AppPreviewConfig;
  presetKey?: string;
};

export function formatDesignSummaryMessage(summary: DesignSummary): string {
  return [
    `Preset: Like ${capitalize(summary.presetKey)}`,
    `Theme: ${summary.readyTheme || "custom"}`,
    `Colors: ${summary.primaryColor} / ${summary.secondaryColor}`,
    `Banner layout #${summary.bannerLayoutId}`,
    `Product card #${summary.productCardLayoutId}`,
    `Category layout #${summary.categoryLayoutId}`,
    `Typeface: ${summary.typeface}`,
    `Header: ${summary.headerStyle}`,
  ].join(" · ");
}

function capitalize(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}
