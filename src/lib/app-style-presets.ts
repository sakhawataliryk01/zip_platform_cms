export type AppStylePresetKey =
  | "keeta"
  | "noon"
  | "amazon"
  | "shein"
  | "jahez"
  | "salla";

export type AppPhoneStyle = {
  key: AppStylePresetKey;
  accent: string;
  accentSoft: string;
  promoBar: string;
  promoBarText: string;
  heroBg: string;
  heroText: string;
  ctaBg: string;
  ctaText: string;
  badgeBg: string;
  categoryShape: "round" | "square" | "row";
  productLayout: "detail" | "deal" | "fashion" | "delivery" | "classic";
  showStars: boolean;
  showCountdown: boolean;
  showLocation: boolean;
  showPinnedOrder: boolean;
  comparePrice: boolean;
};

export const APP_PHONE_STYLES: Record<AppStylePresetKey, AppPhoneStyle> = {
  keeta: {
    key: "keeta",
    accent: "#F5C518",
    accentSoft: "#FFF6D1",
    promoBar: "#1B2B21",
    promoBarText: "#FFFFFF",
    heroBg: "#24352A",
    heroText: "#FFFFFF",
    ctaBg: "#F5C518",
    ctaText: "#1B2B21",
    badgeBg: "#E31837",
    categoryShape: "round",
    productLayout: "classic",
    showStars: false,
    showCountdown: false,
    showLocation: true,
    showPinnedOrder: false,
    comparePrice: false,
  },
  noon: {
    key: "noon",
    accent: "#FEEE00",
    accentSoft: "#FFF9B8",
    promoBar: "#FEEE00",
    promoBarText: "#1B2B21",
    heroBg: "#1B2B21",
    heroText: "#FFFFFF",
    ctaBg: "#FEEE00",
    ctaText: "#1B2B21",
    badgeBg: "#E31837",
    categoryShape: "square",
    productLayout: "deal",
    showStars: false,
    showCountdown: true,
    showLocation: false,
    showPinnedOrder: false,
    comparePrice: true,
  },
  amazon: {
    key: "amazon",
    accent: "#FF9900",
    accentSoft: "#FFE8C2",
    promoBar: "#C9A227",
    promoBarText: "#1B2B21",
    heroBg: "#1B2B21",
    heroText: "#FFFFFF",
    ctaBg: "#3D7A4A",
    ctaText: "#FFFFFF",
    badgeBg: "#E31837",
    categoryShape: "row",
    productLayout: "detail",
    showStars: true,
    showCountdown: false,
    showLocation: false,
    showPinnedOrder: false,
    comparePrice: true,
  },
  shein: {
    key: "shein",
    accent: "#111827",
    accentSoft: "#F3F4F6",
    promoBar: "#111827",
    promoBarText: "#FFFFFF",
    heroBg: "#F3F1EA",
    heroText: "#111827",
    ctaBg: "#111827",
    ctaText: "#FFFFFF",
    badgeBg: "#E83E8C",
    categoryShape: "round",
    productLayout: "fashion",
    showStars: false,
    showCountdown: false,
    showLocation: false,
    showPinnedOrder: false,
    comparePrice: true,
  },
  jahez: {
    key: "jahez",
    accent: "#E31837",
    accentSoft: "#FDE8EB",
    promoBar: "#E31837",
    promoBarText: "#FFFFFF",
    heroBg: "#1B2B21",
    heroText: "#FFFFFF",
    ctaBg: "#E31837",
    ctaText: "#FFFFFF",
    badgeBg: "#E31837",
    categoryShape: "square",
    productLayout: "delivery",
    showStars: false,
    showCountdown: false,
    showLocation: true,
    showPinnedOrder: true,
    comparePrice: false,
  },
  salla: {
    key: "salla",
    accent: "#0047AB",
    accentSoft: "#E8F0FF",
    promoBar: "#0047AB",
    promoBarText: "#FFFFFF",
    heroBg: "#0F274F",
    heroText: "#FFFFFF",
    ctaBg: "#0047AB",
    ctaText: "#FFFFFF",
    badgeBg: "#E31837",
    categoryShape: "square",
    productLayout: "classic",
    showStars: true,
    showCountdown: false,
    showLocation: false,
    showPinnedOrder: false,
    comparePrice: true,
  },
};

export const DEFAULT_APP_STYLE: AppStylePresetKey = "amazon";
export const APP_STYLE_STORAGE_KEY = "merchant-desk-app-style";

export function isAppStylePresetKey(value: string | null | undefined): value is AppStylePresetKey {
  return Boolean(value && value in APP_PHONE_STYLES);
}
