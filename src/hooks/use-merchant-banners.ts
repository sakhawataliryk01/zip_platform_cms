"use client";

import { useCallback, useEffect, useState } from "react";
import type { BannerItem } from "@/lib/data/banner-shared";

export const MERCHANT_BANNERS_CHANGE_EVENT = "merchant-banners-change";

export function useMerchantBanners(enabled = true) {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(enabled);

  const load = useCallback(async () => {
    if (!enabled) {
      setBanners([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/merchant/banners", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setBanners(Array.isArray(data.banners) ? data.banners : []);
      }
    } catch {
      // keep last known banners
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!enabled) return;
    const onChange = () => {
      load();
    };
    window.addEventListener(MERCHANT_BANNERS_CHANGE_EVENT, onChange);
    return () =>
      window.removeEventListener(MERCHANT_BANNERS_CHANGE_EVENT, onChange);
  }, [enabled, load]);

  const activeBanners = banners
    .filter((b) => b.status === "ACTIVE" && b.imageUrl)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return { banners, activeBanners, loading, reload: load };
}

export function notifyMerchantBannersChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(MERCHANT_BANNERS_CHANGE_EVENT));
}
