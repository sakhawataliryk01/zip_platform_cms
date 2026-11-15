"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Check, ExternalLink, Link2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState, LoadingState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DeskPageHeader } from "@/components/merchant/desk-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, cn } from "@/lib/utils";
import {
  DESK_DEMO_PRODUCTS,
  type DeskProductCard,
} from "@/lib/data/desk-demo-products";
import type { ZidProduct } from "@/lib/data/zid-store-shared";
import type { ProductYoutubeReel } from "@/lib/data/product-reel-shared";
import type { VideoItem } from "@/lib/data/video-shared";

function toCard(p: ZidProduct): DeskProductCard {
  const demo = DESK_DEMO_PRODUCTS.find((d) => d.id === p.id);
  return {
    ...p,
    category: demo?.category || "General",
    categoryAr: demo?.categoryAr || "عام",
    compareAtPrice: demo?.compareAtPrice,
    stock: demo?.stock ?? 0,
  };
}

export default function MerchantProductsPage() {
  const t = useTranslations("merchant.products");
  const tDesk = useTranslations("merchant.desk");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [products, setProducts] = useState<DeskProductCard[]>([]);
  const [reels, setReels] = useState<ProductYoutubeReel[]>([]);
  const [channelVideos, setChannelVideos] = useState<VideoItem[]>([]);
  const [search, setSearch] = useState("");
  const [reelSearch, setReelSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(false);
  const [attachProduct, setAttachProduct] = useState<DeskProductCard | null>(
    null
  );
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [manualUrl, setManualUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [productsRes, reelsRes, videosRes] = await Promise.all([
        fetch("/api/merchant/zid-products?pageSize=100"),
        fetch("/api/merchant/product-reels"),
        fetch("/api/merchant/videos"),
      ]);
      const productsData = await productsRes.json();
      const reelsData = await reelsRes.json();
      const videosData = await videosRes.json();

      if (!productsRes.ok) {
        toast.error(productsData.error || t("loadProductsError"));
        setProducts(DESK_DEMO_PRODUCTS);
        setUsingDemo(true);
      } else {
        const list = (productsData.products || []) as ZidProduct[];
        if (!list.length) {
          setProducts(DESK_DEMO_PRODUCTS);
          setUsingDemo(true);
        } else {
          setProducts(list.map(toCard));
          setUsingDemo(false);
        }
      }

      if (!reelsRes.ok) {
        toast.error(reelsData.error || tCommon("error"));
      } else {
        setReels(reelsData.reels || []);
      }

      if (videosRes.ok) {
        const all = (videosData.videos || []) as VideoItem[];
        setChannelVideos(
          all.filter((v) => v.status === "ACTIVE" && v.videoUrl)
        );
      } else {
        setChannelVideos([]);
      }
    } catch {
      setProducts(DESK_DEMO_PRODUCTS);
      setUsingDemo(true);
      toast.error(tCommon("error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reelsByProduct = useMemo(() => {
    const map = new Map<string, ProductYoutubeReel[]>();
    for (const reel of reels) {
      const list = map.get(reel.productId) || [];
      list.push(reel);
      map.set(reel.productId, list);
    }
    return map;
  }, [reels]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.nameAr || "").toLowerCase().includes(q) ||
        (p.sku || "").toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
    );
  }, [products, search]);

  const selectableVideos = useMemo(() => {
    const q = reelSearch.toLowerCase().trim();
    return channelVideos.filter((v) => {
      if (!v.videoUrl) return false;
      const title = (
        isAr && v.titleAr ? v.titleAr : v.title
      ).toLowerCase();
      if (q && !title.includes(q) && !v.videoUrl.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [channelVideos, reelSearch, isAr]);

  const openAttach = (product: DeskProductCard) => {
    setAttachProduct(product);
    setSelectedVideoId(null);
    setManualUrl("");
    setReelSearch("");
  };

  const closeAttach = () => {
    setAttachProduct(null);
    setSelectedVideoId(null);
    setManualUrl("");
    setReelSearch("");
  };

  const saveReel = async () => {
    if (!attachProduct) return;

    const selected = selectedVideoId
      ? channelVideos.find((v) => v.id === selectedVideoId)
      : null;

    const youtubeUrl = selected?.videoUrl?.trim() || manualUrl.trim();
    if (!youtubeUrl) {
      toast.error(t("selectReelRequired"));
      return;
    }

    const title =
      (isAr && selected?.titleAr ? selected.titleAr : selected?.title) ||
      attachProduct.name;

    setSaving(true);
    try {
      const res = await fetch("/api/merchant/product-reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: attachProduct.id,
          productName: attachProduct.name,
          productSku: attachProduct.sku,
          productImageUrl: attachProduct.imageUrl,
          youtubeUrl,
          title,
          thumbnail: selected?.thumbnailUrl || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || tCommon("error"));
        return;
      }
      toast.success(tCommon("success"));
      closeAttach();
      await load();
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(
        `/api/merchant/product-reels?id=${encodeURIComponent(deleteId)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || tCommon("error"));
        return;
      }
      toast.success(tCommon("success"));
      setDeleteId(null);
      await load();
    } catch {
      toast.error(tCommon("error"));
    }
  };

  if (loading) return <LoadingState label={tCommon("loading")} />;

  return (
    <div className="space-y-6">
      <DeskPageHeader
        eyebrow={tDesk("storeOperations")}
        title={t("title")}
        subtitle={t("deskSubtitle")}
        actions={
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t("searchPlaceholder")}
            className="w-full sm:w-72"
          />
        }
      />

      {usingDemo ? (
        <p className="text-xs text-desk-muted">{t("demoCatalogNote")}</p>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState title={t("empty")} description={t("emptyHint")} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => {
            const displayName = isAr && p.nameAr ? p.nameAr : p.name;
            const category = isAr ? p.categoryAr : p.category;
            const linked = reelsByProduct.get(p.id) || [];
            return (
              <article
                key={p.id}
                className="group overflow-hidden rounded-[1.5rem] border border-[#e7e2d6] bg-white shadow-[0_1px_0_rgba(27,43,33,0.03)] transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative aspect-[4/3] bg-[#f3f1ea]">
                  {p.imageUrl ? (
                    <Image
                      src={p.imageUrl}
                      alt={displayName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-desk-muted">
                      {displayName}
                    </div>
                  )}
                </div>
                <div className="space-y-3 p-4">
                  <div>
                    <h2 className="text-base font-semibold text-desk-ink">
                      {displayName}
                    </h2>
                    <p className="mt-0.5 text-xs text-desk-muted">
                      {p.sku || "—"}
                      <span className="mx-1.5 text-[#c5bfb2]">·</span>
                      {category}
                    </p>
                  </div>

                  <div className="flex items-end justify-between gap-3">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <p className="text-lg font-semibold tabular-nums text-desk-ink">
                        {p.price != null
                          ? formatCurrency(
                              p.price,
                              p.currency || "SAR",
                              locale
                            )
                          : "—"}
                      </p>
                      {p.compareAtPrice ? (
                        <p className="text-sm tabular-nums text-desk-muted line-through">
                          {formatCurrency(
                            p.compareAtPrice,
                            p.currency || "SAR",
                            locale
                          )}
                        </p>
                      ) : null}
                    </div>
                    <p className="text-xs text-desk-muted">
                      {t("stockCount", { count: p.stock })}
                    </p>
                  </div>

                  {linked.length > 0 ? (
                    <ul className="space-y-1.5 border-t border-[#efeae0] pt-3">
                      {linked.map((reel) => (
                        <li
                          key={reel.id}
                          className="flex items-center gap-2 text-xs"
                        >
                          <a
                            href={reel.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-w-0 flex-1 items-center gap-1 truncate text-desk-green hover:underline"
                          >
                            <span className="truncate">{reel.title}</span>
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                          <button
                            type="button"
                            className="rounded-lg p-1 text-desk-muted hover:bg-[#f3f1ea] hover:text-destructive"
                            onClick={() => setDeleteId(reel.id)}
                            aria-label={tCommon("delete")}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {!usingDemo ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="w-full rounded-full border-[#ddd6c8]"
                      onClick={() => openAttach(p)}
                    >
                      <Link2 className="me-1.5 h-3.5 w-3.5" />
                      {t("attachReel")}
                    </Button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {attachProduct ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="flex max-h-[90vh] w-full max-w-2xl flex-col shadow-lg">
            <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
              <div>
                <CardTitle className="text-lg">{t("attachTitle")}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {attachProduct.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("pickFromChannel")}
                </p>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={closeAttach}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
              <SearchInput
                value={reelSearch}
                onChange={setReelSearch}
                placeholder={t("searchReelsPlaceholder")}
              />

              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pe-1">
                {selectableVideos.length === 0 ? (
                  <EmptyState
                    title={t("noChannelReels")}
                    description={t("noChannelReelsHint")}
                  />
                ) : (
                  selectableVideos.map((video) => {
                    const selected = selectedVideoId === video.id;
                    const title =
                      isAr && video.titleAr ? video.titleAr : video.title;
                    return (
                      <button
                        key={video.id}
                        type="button"
                        onClick={() => {
                          setSelectedVideoId(video.id);
                          setManualUrl("");
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg border p-2 text-start transition-colors",
                          selected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/50"
                        )}
                      >
                        <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded bg-muted">
                          {video.thumbnailUrl ? (
                            <Image
                              src={video.thumbnailUrl}
                              alt={title}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="line-clamp-2 text-sm font-medium">
                            {title}
                          </div>
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {video.videoType === "EXPLORE"
                              ? t("sectionExplore")
                              : t("sectionExperiences")}
                          </div>
                        </div>
                        {selected ? (
                          <Check className="h-5 w-5 shrink-0 text-primary" />
                        ) : null}
                      </button>
                    );
                  })
                )}
              </div>

              <div className="space-y-2 border-t pt-3">
                <Label htmlFor="manualUrl">{t("orPasteUrl")}</Label>
                <Input
                  id="manualUrl"
                  value={manualUrl}
                  onChange={(e) => {
                    setManualUrl(e.target.value);
                    if (e.target.value.trim()) setSelectedVideoId(null);
                  }}
                  placeholder="https://www.youtube.com/shorts/xxxxx"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeAttach}>
                  {tCommon("cancel")}
                </Button>
                <Button
                  type="button"
                  onClick={saveReel}
                  disabled={saving || (!selectedVideoId && !manualUrl.trim())}
                >
                  {saving ? tCommon("loading") : t("saveReel")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteId)}
        title={t("deleteReelTitle")}
        description={t("deleteReelDescription")}
        confirmLabel={tCommon("delete")}
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
