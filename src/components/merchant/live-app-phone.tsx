"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  BatteryFull,
  Bell,
  Heart,
  Home,
  MapPin,
  Megaphone,
  Minus,
  Play,
  Plus,
  Search,
  ShoppingBag,
  Signal,
  Star,
  Trash2,
  User,
  Wifi,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStyle } from "@/components/merchant/app-style-provider";
import type { AppPreviewConfig, PreviewBlockId } from "@/lib/app-preview-config";
import {
  APP_PHONE_STYLES,
  isAppStylePresetKey,
  type AppStylePresetKey,
} from "@/lib/app-style-presets";
import { useMerchantBanners } from "@/hooks/use-merchant-banners";
import type { BannerItem } from "@/lib/data/banner-shared";

type TabId = "home" | "categories" | "cart" | "profile";
type Screen =
  | { name: "home" }
  | { name: "categories" }
  | { name: "cart" }
  | { name: "profile" }
  | { name: "search" }
  | { name: "product"; productId: string }
  | { name: "category"; categoryId: string };

const CATEGORIES = [
  {
    id: "electronics",
    en: "Electronics",
    ar: "إلكترونيات",
    count: 2,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&h=120&fit=crop",
  },
  {
    id: "fashion",
    en: "Fashion",
    ar: "أزياء",
    count: 3,
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=120&h=120&fit=crop",
  },
  {
    id: "home",
    en: "Home",
    ar: "منزل",
    count: 4,
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=120&h=120&fit=crop",
  },
  {
    id: "care",
    en: "Care",
    ar: "عناية",
    count: 5,
    image:
      "https://images.unsplash.com/photo-1620916565138-02267cf4d70d?w=120&h=120&fit=crop",
  },
];

const PRODUCTS = [
  {
    id: "sw-pro",
    en: "Smart watch Pro",
    ar: "ساعة ذكية برو",
    price: 499,
    compare: 649,
    categoryId: "electronics",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=640&h=480&fit=crop",
    rating: 4.6,
  },
  {
    id: "hp-220",
    en: "Wireless headphones",
    ar: "سماعات لاسلكية",
    price: 199,
    compare: 279,
    categoryId: "electronics",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=640&h=480&fit=crop",
    rating: 4.4,
  },
  {
    id: "bg-88",
    en: "Everyday bag",
    ar: "حقيبة يومية",
    price: 149,
    compare: 199,
    categoryId: "fashion",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=640&h=480&fit=crop",
    rating: 4.2,
  },
  {
    id: "sk-14",
    en: "Hydra serum",
    ar: "سيروم الترطيب",
    price: 89,
    compare: 120,
    categoryId: "care",
    image:
      "https://images.unsplash.com/photo-1620916565138-02267cf4d70d?w=640&h=480&fit=crop",
    rating: 4.8,
  },
];

export function LiveAppPhone({
  storeName,
  isAr = false,
  className,
  size = "md",
  interactive = true,
  showTapHint = true,
  previewOverride,
  presetKey: presetKeyOverride,
  bannersOverride,
}: {
  storeName?: string;
  isAr?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  showTapHint?: boolean;
  /** When set (e.g. admin viewing a merchant request), ignore local merchant style context */
  previewOverride?: AppPreviewConfig;
  presetKey?: AppStylePresetKey | string;
  /** Optional banners (skips merchant API fetch when provided) */
  bannersOverride?: BannerItem[];
}) {
  const t = useTranslations("merchant.appStudio");
  const ctx = useAppStyle();
  const preview = previewOverride ?? ctx.preview;
  const style =
    presetKeyOverride && isAppStylePresetKey(presetKeyOverride)
      ? APP_PHONE_STYLES[presetKeyOverride]
      : ctx.style;
  const { activeBanners: fetchedBanners } = useMerchantBanners(
    !bannersOverride && !previewOverride
  );
  const activeBanners = useMemo(() => {
    if (bannersOverride) {
      return bannersOverride
        .filter((b) => b.status === "ACTIVE" && b.imageUrl)
        .sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return fetchedBanners;
  }, [bannersOverride, fetchedBanners]);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [screen, setScreen] = useState<Screen>({ name: "home" });
  const [cartQty, setCartQty] = useState<Record<string, number>>({
    "sw-pro": 1,
  });
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setBannerIndex(0);
  }, [activeBanners.length]);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const id = window.setInterval(() => {
      setBannerIndex((i) => (i + 1) % activeBanners.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [activeBanners.length]);

  // Real-phone proportions (~9:19.5). Keep height fixed so content scrolls inside.
  const shell =
    size === "sm"
      ? { width: "w-[210px]", height: "h-[430px]" }
      : size === "lg"
        ? { width: "w-[252px]", height: "h-[516px]" }
        : { width: "w-[236px]", height: "h-[484px]" };

  const displayStore =
    (isAr ? preview.storeNameAr : preview.storeNameEn) ||
    storeName ||
    "Al Noor Store";
  const activeBar =
    preview.announcementBars?.find((b) => b.visible) ||
    preview.announcementBars?.[0];
  const promo = activeBar
    ? isAr
      ? activeBar.textAr
      : activeBar.textEn
    : isAr
      ? preview.promoTextAr
      : preview.promoTextEn;
  const announcementBold = preview.announcementBold ?? true;
  const announcementShowIcon = preview.announcementShowIcon ?? false;
  const announcementDismissible = preview.announcementDismissible ?? false;
  const heroTitle = isAr ? preview.heroTitleAr : preview.heroTitleEn;
  const heroHint = isAr ? preview.heroHintAr : preview.heroHintEn;

  const promoBg = preview.primaryColor || style.promoBar;
  const promoFg = preview.primaryColor ? "#ffffff" : style.promoBarText;
  const ctaBg = preview.secondaryColor || style.ctaBg;
  const heroBg = preview.secondaryColor || style.heroBg;
  const categoryLayout = preview.categoryLayout || style.categoryShape || "row";
  const showStars = preview.showStars ?? style.showStars;
  const showCompare = preview.showComparePrice ?? style.comparePrice;

  const activeTab: TabId =
    screen.name === "categories" || screen.name === "category"
      ? "categories"
      : screen.name === "cart"
        ? "cart"
        : screen.name === "profile"
          ? "profile"
          : "home";

  const cartCount = useMemo(
    () => Object.values(cartQty).reduce((sum, n) => sum + n, 0),
    [cartQty]
  );

  const go = (next: Screen) => {
    if (!interactive) return;
    setScreen(next);
  };

  const addToCart = (productId: string) => {
    setCartQty((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const visibleBlocks = preview.blockOrder.filter(
    (id) => !preview.hiddenBlocks.includes(id)
  );

  const productName = (p: (typeof PRODUCTS)[number]) =>
    isAr ? p.ar : p.en;

  const renderHomeBlocks = (id: PreviewBlockId) => {
    switch (id) {
      case "announcement": {
        if (!promo) return null;
        const weight = announcementBold ? "font-semibold" : "font-medium";
        const label = (
          <span className="inline-flex items-center justify-center gap-1">
            {announcementShowIcon ? (
              <Megaphone className="h-2.5 w-2.5 shrink-0 opacity-90" />
            ) : null}
            <span>{promo}</span>
          </span>
        );
        const dismiss = announcementDismissible ? (
          <X className="ms-1 h-2.5 w-2.5 shrink-0 opacity-80" />
        ) : null;
        const base = cn("text-center text-[9px]", weight);
        if (preview.announcementStyle === "marquee") {
          return (
            <div
              key={id}
              className={cn(
                base,
                "flex items-center justify-between gap-1 overflow-hidden whitespace-nowrap px-2 py-1.5"
              )}
              style={{ backgroundColor: promoBg, color: promoFg }}
            >
              <span className="min-w-0 flex-1 overflow-hidden">
                <span className="inline-block animate-desk-marquee">
                  {promo} · {promo} · {promo}
                </span>
              </span>
              {dismiss}
            </div>
          );
        }
        if (preview.announcementStyle === "frame") {
          return (
            <div key={id} className="px-1 pt-1">
              <div
                className={cn(
                  base,
                  "flex items-center justify-center gap-1 rounded-xl border-2 px-3 py-1.5"
                )}
                style={{
                  borderColor: promoBg,
                  color: promoBg,
                  backgroundColor: `${promoBg}12`,
                }}
              >
                {label}
                {dismiss}
              </div>
            </div>
          );
        }
        if (preview.announcementStyle === "tag") {
          return (
            <div key={id} className="flex justify-center pt-1">
              <span
                className={cn(
                  base,
                  "inline-flex items-center gap-1 rounded-md px-2.5 py-1"
                )}
                style={{ backgroundColor: promoBg, color: promoFg }}
              >
                {label}
                {dismiss}
              </span>
            </div>
          );
        }
        return (
          <div
            key={id}
            className={cn(
              base,
              "flex items-center justify-center gap-1 rounded-full px-3 py-1.5"
            )}
            style={{ backgroundColor: promoBg, color: promoFg }}
          >
            {label}
            {dismiss}
          </div>
        );
      }
      case "hero": {
        if (activeBanners.length > 0) {
          const current =
            activeBanners[bannerIndex % activeBanners.length] ||
            activeBanners[0];
          const title = isAr
            ? current.titleAr || current.title
            : current.title;
          const layoutId = preview.bannerLayoutId || 1;
          const tall = layoutId % 5 === 0 || layoutId === 14 || layoutId === 36;
          const rounded =
            layoutId % 3 === 0 ? "rounded-3xl" : "rounded-2xl";

          return (
            <div key={id} className="space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  if (current.linkUrl && interactive) {
                    // Keep interaction inside the phone; open product as fallback
                    go({ name: "product", productId: "sw-pro" });
                  } else {
                    go({ name: "product", productId: "sw-pro" });
                  }
                }}
                className={cn(
                  "relative w-full overflow-hidden text-start shadow-sm transition active:scale-[0.99]",
                  rounded,
                  tall ? "h-[118px]" : "h-[96px]"
                )}
              >
                <Image
                  src={current.imageUrl!}
                  alt={title}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-2.5 text-white">
                  <p className="line-clamp-2 text-[11px] font-semibold leading-snug">
                    {title}
                  </p>
                  <span
                    className="mt-1.5 inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-semibold"
                    style={{ backgroundColor: ctaBg, color: style.ctaText }}
                  >
                    {t("previewOrderNow")}
                  </span>
                </div>
              </button>
              {activeBanners.length > 1 ? (
                <div className="flex items-center justify-center gap-1">
                  {activeBanners.map((b, i) => (
                    <button
                      key={b.id}
                      type="button"
                      aria-label={`Banner ${i + 1}`}
                      onClick={() => interactive && setBannerIndex(i)}
                      className={cn(
                        "h-1 rounded-full transition-all",
                        i === bannerIndex % activeBanners.length
                          ? "w-3 bg-desk-ink"
                          : "w-1.5 bg-desk-ink/25"
                      )}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          );
        }

        return (
          <button
            key={id}
            type="button"
            onClick={() => go({ name: "product", productId: "sw-pro" })}
            className="w-full rounded-2xl p-3 text-start shadow-sm transition active:scale-[0.99]"
            style={{ backgroundColor: heroBg, color: style.heroText }}
          >
            <p className="text-[11px] font-semibold">{heroTitle}</p>
            <p className="mt-1 text-[9px] leading-relaxed opacity-75">
              {heroHint}
            </p>
            {style.showCountdown ? (
              <div className="mt-2 flex gap-1">
                {["02", "14", "38"].map((n) => (
                  <span
                    key={n}
                    className="rounded-md px-1.5 py-0.5 text-[9px] font-semibold"
                    style={{
                      backgroundColor: style.accent,
                      color: style.ctaText,
                    }}
                  >
                    {n}
                  </span>
                ))}
              </div>
            ) : null}
            <span
              className="mt-3 inline-flex rounded-full px-3 py-1 text-[9px] font-semibold"
              style={{ backgroundColor: ctaBg, color: style.ctaText }}
            >
              {t("previewOrderNow")}
            </span>
          </button>
        );
      }
      case "categories":
        return categoryLayout === "row" ? (
          <div key={id} className="space-y-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => go({ name: "category", categoryId: cat.id })}
                className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-start transition active:scale-[0.99]"
                style={{
                  backgroundColor: preview.primaryColor
                    ? `${preview.primaryColor}18`
                    : style.accentSoft,
                }}
              >
                {preview.showCategoryPhoto ? (
                  <div className="relative h-8 w-8 overflow-hidden rounded-lg">
                    <Image
                      src={cat.image}
                      alt={cat.en}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : null}
                <span className="flex-1 text-[10px] font-medium text-desk-ink">
                  {isAr ? cat.ar : cat.en}
                </span>
                {preview.showCategoryCount ? (
                  <span className="text-[9px] text-desk-muted">
                    {cat.count} ›
                  </span>
                ) : (
                  <span className="text-[9px] text-desk-muted">›</span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div key={id} className="grid grid-cols-4 gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => go({ name: "category", categoryId: cat.id })}
                className="text-center transition active:scale-95"
              >
                <div
                  className={cn(
                    "relative mx-auto mb-1 h-10 w-10 overflow-hidden",
                    categoryLayout === "round" ? "rounded-full" : "rounded-xl"
                  )}
                  style={{ backgroundColor: style.accentSoft }}
                >
                  <Image
                    src={cat.image}
                    alt={cat.en}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <p className="truncate text-[7px] text-slate-600">
                  {isAr ? cat.ar : cat.en}
                </p>
              </button>
            ))}
          </div>
        );
      case "search":
        return (
          <button
            key={id}
            type="button"
            onClick={() => go({ name: "search" })}
            className="flex h-8 w-full items-center gap-2 rounded-full bg-slate-100 px-2.5 text-start text-[9px] text-slate-400 transition active:bg-slate-200"
          >
            <Search className="h-3 w-3" />
            {t("screens.searchPlaceholder")}
          </button>
        );
      case "product": {
        const p = PRODUCTS[0];
        return (
          <button
            key={id}
            type="button"
            onClick={() => go({ name: "product", productId: p.id })}
            className="w-full overflow-hidden rounded-2xl border border-slate-100 bg-white text-start shadow-sm transition active:scale-[0.99]"
          >
            <div className="relative h-[84px] bg-[#f3f1ea]">
              <Image
                src={p.image}
                alt={productName(p)}
                fill
                className="object-cover"
                unoptimized
              />
              {(preview.productCardStyle === "discount" ||
                preview.productCardStyle === "rating") && (
                <span
                  className="absolute start-2 top-2 rounded-full px-2 py-0.5 text-[8px] font-semibold text-white shadow-sm"
                  style={{ backgroundColor: style.badgeBg }}
                >
                  -23%
                </span>
              )}
            </div>
            <div className="space-y-1 p-2.5">
              <p className="text-[10px] font-semibold text-desk-ink">
                {productName(p)}
              </p>
              {(showStars || preview.productCardStyle === "rating") && (
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-2.5 w-2.5"
                      style={{
                        color: style.accent,
                        fill: i < 4 ? style.accent : "transparent",
                      }}
                    />
                  ))}
                  <span className="ms-1 text-[8px] text-desk-muted">
                    {p.rating}
                  </span>
                </div>
              )}
              <div className="flex items-baseline gap-1.5">
                <p className="text-[11px] font-semibold text-desk-ink">
                  SAR {p.price}
                </p>
                {showCompare ? (
                  <p className="text-[8px] text-desk-muted line-through">
                    SAR {p.compare}
                  </p>
                ) : null}
              </div>
            </div>
          </button>
        );
      }
      case "reels":
        if (!preview.showReels) return null;
        return (
          <div key={id} className="flex gap-1.5 overflow-hidden">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => go({ name: "product", productId: PRODUCTS[i % PRODUCTS.length].id })}
                className="relative h-20 w-14 shrink-0 overflow-hidden rounded-xl transition active:scale-95"
                style={{
                  background: `linear-gradient(180deg, ${style.accentSoft}, ${ctaBg})`,
                }}
              >
                <span className="absolute inset-0 flex items-center justify-center text-white/90">
                  <Play className="h-4 w-4 fill-white" />
                </span>
              </button>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const ScreenHeader = ({
    title,
    onBack,
  }: {
    title: string;
    onBack?: () => void;
  }) => (
    <div className="mb-2 flex items-center gap-2">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-desk-ink transition active:scale-95"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
      ) : null}
      <p className="truncate text-[12px] font-semibold text-desk-ink">{title}</p>
    </div>
  );

  const ProductMiniCard = ({ productId }: { productId: string }) => {
    const p = PRODUCTS.find((x) => x.id === productId);
    if (!p) return null;
    return (
      <button
        type="button"
        onClick={() => go({ name: "product", productId: p.id })}
        className="overflow-hidden rounded-xl border border-slate-100 bg-white text-start transition active:scale-[0.99]"
      >
        <div className="relative h-20 bg-[#f3f1ea]">
          <Image
            src={p.image}
            alt={productName(p)}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="space-y-0.5 p-2">
          <p className="truncate text-[9px] font-medium text-desk-ink">
            {productName(p)}
          </p>
          <p className="text-[10px] font-semibold text-desk-ink">
            SAR {p.price}
          </p>
        </div>
      </button>
    );
  };

  const renderScreen = () => {
    if (screen.name === "search") {
      return (
        <div className="space-y-2">
          <ScreenHeader
            title={t("screens.search")}
            onBack={() => go({ name: "home" })}
          />
          <div className="flex h-8 items-center gap-2 rounded-full bg-slate-100 px-2.5 text-[9px] text-slate-500">
            <Search className="h-3 w-3" />
            {t("screens.searchPlaceholder")}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {PRODUCTS.map((p) => (
              <ProductMiniCard key={p.id} productId={p.id} />
            ))}
          </div>
        </div>
      );
    }

    if (screen.name === "categories") {
      return (
        <div className="space-y-2">
          <ScreenHeader title={t("screens.categories")} />
          <div className="space-y-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => go({ name: "category", categoryId: cat.id })}
                className="flex w-full items-center gap-2 rounded-xl bg-[#f7f5ef] px-2 py-2 text-start transition active:scale-[0.99]"
              >
                <div className="relative h-10 w-10 overflow-hidden rounded-xl">
                  <Image
                    src={cat.image}
                    alt={cat.en}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-desk-ink">
                    {isAr ? cat.ar : cat.en}
                  </p>
                  <p className="text-[9px] text-desk-muted">
                    {cat.count} {t("screens.items")}
                  </p>
                </div>
                <span className="text-desk-muted">›</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (screen.name === "category") {
      const cat = CATEGORIES.find((c) => c.id === screen.categoryId);
      const items = PRODUCTS.filter((p) => p.categoryId === screen.categoryId);
      return (
        <div className="space-y-2">
          <ScreenHeader
            title={cat ? (isAr ? cat.ar : cat.en) : t("screens.categories")}
            onBack={() => go({ name: "categories" })}
          />
          <div className="grid grid-cols-2 gap-2">
            {(items.length ? items : PRODUCTS).map((p) => (
              <ProductMiniCard key={p.id} productId={p.id} />
            ))}
          </div>
        </div>
      );
    }

    if (screen.name === "product") {
      const p = PRODUCTS.find((x) => x.id === screen.productId) || PRODUCTS[0];
      const qty = cartQty[p.id] || 0;
      return (
        <div className="space-y-2">
          <ScreenHeader
            title={productName(p)}
            onBack={() => go({ name: "home" })}
          />
          <div className="relative h-32 overflow-hidden rounded-2xl bg-[#f3f1ea]">
            <Image
              src={p.image}
              alt={productName(p)}
              fill
              className="object-cover"
              unoptimized
            />
            <button
              type="button"
              onClick={() =>
                setSaved((prev) => ({ ...prev, [p.id]: !prev[p.id] }))
              }
              className="absolute end-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-desk-ink shadow"
            >
              <Heart
                className={cn("h-3.5 w-3.5", saved[p.id] && "fill-red-500 text-red-500")}
              />
            </button>
          </div>
          <div className="space-y-1">
            <p className="text-[12px] font-semibold text-desk-ink">
              {productName(p)}
            </p>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-3 w-3"
                  style={{
                    color: style.accent,
                    fill: i < 4 ? style.accent : "transparent",
                  }}
                />
              ))}
              <span className="ms-1 text-[9px] text-desk-muted">{p.rating}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <p className="text-sm font-semibold text-desk-ink">
                SAR {p.price}
              </p>
              <p className="text-[10px] text-desk-muted line-through">
                SAR {p.compare}
              </p>
            </div>
            <p className="text-[9px] leading-relaxed text-desk-muted">
              {t("screens.productDesc")}
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            {qty > 0 ? (
              <div className="flex flex-1 items-center justify-between rounded-full bg-slate-100 px-2 py-1.5">
                <button
                  type="button"
                  className="rounded-full p-1"
                  onClick={() =>
                    setCartQty((prev) => ({
                      ...prev,
                      [p.id]: Math.max(0, (prev[p.id] || 0) - 1),
                    }))
                  }
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="text-[11px] font-semibold">{qty}</span>
                <button
                  type="button"
                  className="rounded-full p-1"
                  onClick={() => addToCart(p.id)}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  addToCart(p.id);
                  go({ name: "cart" });
                }}
                className="flex-1 rounded-full py-2 text-[10px] font-semibold text-white"
                style={{ backgroundColor: ctaBg }}
              >
                {t("screens.addToCart")}
              </button>
            )}
            <button
              type="button"
              onClick={() => go({ name: "cart" })}
              className="rounded-full border border-slate-200 px-3 py-2 text-[10px] font-medium text-desk-ink"
            >
              {t("screens.viewCart")}
            </button>
          </div>
        </div>
      );
    }

    if (screen.name === "cart") {
      const lines = PRODUCTS.filter((p) => (cartQty[p.id] || 0) > 0);
      const total = lines.reduce(
        (sum, p) => sum + p.price * (cartQty[p.id] || 0),
        0
      );
      return (
        <div className="space-y-2">
          <ScreenHeader title={t("screens.cart")} />
          {lines.length === 0 ? (
            <div className="rounded-2xl bg-[#f7f5ef] px-3 py-8 text-center">
              <ShoppingBag className="mx-auto mb-2 h-6 w-6 text-desk-muted" />
              <p className="text-[11px] font-medium text-desk-ink">
                {t("screens.cartEmpty")}
              </p>
              <button
                type="button"
                onClick={() => go({ name: "home" })}
                className="mt-3 rounded-full px-3 py-1.5 text-[10px] font-semibold text-white"
                style={{ backgroundColor: ctaBg }}
              >
                {t("screens.continueShopping")}
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {lines.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 rounded-xl border border-slate-100 p-2"
                  >
                    <button
                      type="button"
                      className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg"
                      onClick={() =>
                        go({ name: "product", productId: p.id })
                      }
                    >
                      <Image
                        src={p.image}
                        alt={productName(p)}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] font-medium text-desk-ink">
                        {productName(p)}
                      </p>
                      <p className="text-[10px] font-semibold text-desk-ink">
                        SAR {p.price}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-slate-100 px-1.5 py-1">
                      <button
                        type="button"
                        onClick={() =>
                          setCartQty((prev) => ({
                            ...prev,
                            [p.id]: Math.max(0, (prev[p.id] || 0) - 1),
                          }))
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-4 text-center text-[10px] font-semibold">
                        {cartQty[p.id]}
                      </span>
                      <button type="button" onClick={() => addToCart(p.id)}>
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="text-desk-muted"
                      onClick={() =>
                        setCartQty((prev) => {
                          const next = { ...prev };
                          delete next[p.id];
                          return next;
                        })
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-[#f7f5ef] px-3 py-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-desk-muted">{t("screens.total")}</span>
                  <span className="font-semibold text-desk-ink">
                    SAR {total}
                  </span>
                </div>
                <button
                  type="button"
                  className="mt-2 w-full rounded-full py-2 text-[10px] font-semibold text-white"
                  style={{ backgroundColor: ctaBg }}
                >
                  {t("screens.checkout")}
                </button>
              </div>
            </>
          )}
        </div>
      );
    }

    if (screen.name === "profile") {
      return (
        <div className="space-y-3">
          <ScreenHeader title={t("screens.profile")} />
          <div className="flex items-center gap-3 rounded-2xl bg-[#f7f5ef] p-3">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: ctaBg }}
            >
              A
            </span>
            <div>
              <p className="text-[12px] font-semibold text-desk-ink">
                {t("screens.guestUser")}
              </p>
              <p className="text-[9px] text-desk-muted">
                {t("screens.profileHint")}
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            {[
              t("screens.orders"),
              t("screens.addresses"),
              t("screens.wishlist"),
              t("screens.settings"),
            ].map((label) => (
              <button
                key={label}
                type="button"
                className="flex w-full items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5 text-start text-[11px] font-medium text-desk-ink transition active:bg-slate-50"
              >
                {label}
                <span className="text-desk-muted">›</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // home
    return (
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold tracking-tight text-desk-ink">
              {displayStore}
            </p>
            {style.showLocation ? (
              <p className="mt-0.5 flex items-center gap-1 text-[9px] text-desk-muted">
                <MapPin className="h-3 w-3" style={{ color: style.accent }} />
                Riyadh · 12 min
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => go({ name: "profile" })}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-desk-muted shadow-sm transition active:scale-95"
          >
            <Bell className="h-3.5 w-3.5" />
          </button>
        </div>
        {visibleBlocks.map((id) => renderHomeBlocks(id))}
      </div>
    );
  };

  const tabs: { id: TabId; label: string; icon: typeof Home; screen: Screen }[] =
    [
      { id: "home", label: t("screens.home"), icon: Home, screen: { name: "home" } },
      {
        id: "categories",
        label: t("screens.categories"),
        icon: Search,
        screen: { name: "categories" },
      },
      {
        id: "cart",
        label: t("screens.cart"),
        icon: ShoppingBag,
        screen: { name: "cart" },
      },
      {
        id: "profile",
        label: t("screens.profile"),
        icon: User,
        screen: { name: "profile" },
      },
    ];

  return (
    <div
      className={cn(
        "relative mx-auto transition-all duration-300",
        shell.width,
        className
      )}
    >
      <div className="pointer-events-none absolute -inset-x-3 bottom-1 top-[10%] rounded-[2.5rem] bg-[radial-gradient(ellipse_at_center,rgba(27,43,33,0.16),transparent_70%)] blur-md" />

      <div
        className={cn(
          "relative flex rounded-[2.15rem] p-[8px]",
          shell.height,
          "bg-[linear-gradient(160deg,#3a3a3c_0%,#1c1c1e_28%,#0a0a0a_72%,#2c2c2e_100%)]",
          "shadow-[0_22px_40px_-16px_rgba(27,43,33,0.5),0_6px_14px_-8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.22)]"
        )}
      >
        <span className="absolute -start-[2px] top-[78px] h-6 w-[2.5px] rounded-s-full bg-[#2a2a2c]" />
        <span className="absolute -start-[2px] top-[108px] h-10 w-[2.5px] rounded-s-full bg-[#2a2a2c]" />
        <span className="absolute -start-[2px] top-[150px] h-10 w-[2.5px] rounded-s-full bg-[#2a2a2c]" />
        <span className="absolute -end-[2px] top-[120px] h-14 w-[2.5px] rounded-e-full bg-[#2a2a2c]" />

        <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-black/40">
          <div className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(125deg,rgba(255,255,255,0.14)_0%,transparent_28%,transparent_70%,rgba(255,255,255,0.05)_100%)]" />

          <div className="relative z-10 flex shrink-0 items-center justify-between px-4 pb-0.5 pt-2.5 text-[9px] font-semibold text-slate-900">
            <span>9:41</span>
            <span className="absolute start-1/2 top-2 h-[18px] w-[68px] -translate-x-1/2 rounded-full bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
              <span className="absolute end-1.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#1a1a1a] ring-1 ring-white/10" />
            </span>
            <span className="flex items-center gap-0.5">
              <Signal className="h-2.5 w-2.5" />
              <Wifi className="h-2.5 w-2.5" />
              <BatteryFull className="h-3 w-3" />
            </span>
          </div>

          <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-2.5 pb-1.5 pt-0.5">
            {renderScreen()}
          </div>

          <div className="relative z-10 shrink-0 border-t border-slate-100 bg-white/95 px-1 pb-2 pt-1 backdrop-blur">
            {style.showPinnedOrder && screen.name === "home" ? (
              <div className="mb-1.5 px-2">
                <button
                  type="button"
                  onClick={() => go({ name: "cart" })}
                  className="w-full rounded-full py-1.5 text-[8px] font-semibold text-white shadow-md"
                  style={{ backgroundColor: ctaBg }}
                >
                  {t("previewOrderNow")}
                </button>
              </div>
            ) : null}
            <div
              className={cn(
                "grid grid-cols-4 text-[7px]",
                preview.bottomBarStyle === "pill" &&
                  "mx-2 rounded-full bg-[#f7f5ef] px-1 py-1"
              )}
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    disabled={!interactive}
                    onClick={() => go(tab.screen)}
                    className={cn(
                      "relative flex flex-col items-center gap-0.5 py-0.5 transition",
                      interactive && "active:scale-95",
                      active ? "font-semibold" : "text-slate-400"
                    )}
                    style={active ? { color: ctaBg } : undefined}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {preview.bottomBarStyle !== "icons" ? tab.label : null}
                    {tab.id === "cart" && cartCount > 0 ? (
                      <span
                        className="absolute end-[16%] top-0 flex h-3 min-w-3 items-center justify-center rounded-full px-0.5 text-[6px] font-bold text-white"
                        style={{ backgroundColor: style.badgeBg }}
                      >
                        {cartCount}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            <div className="mx-auto mt-1.5 h-0.5 w-16 rounded-full bg-slate-900/90" />
          </div>
        </div>
      </div>

      {interactive && showTapHint ? (
        <p className="mt-2 text-center text-[10px] text-desk-muted">
          {t("screens.tapHint")}
        </p>
      ) : null}
    </div>
  );
}
