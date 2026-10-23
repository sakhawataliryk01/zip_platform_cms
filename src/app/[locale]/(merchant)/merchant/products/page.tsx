"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Check, ExternalLink, Link2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState, LoadingState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, cn } from "@/lib/utils";
import type { ZidProduct } from "@/lib/data/zid-store-shared";
import type { ProductYoutubeReel } from "@/lib/data/product-reel-shared";
import type { VideoItem } from "@/lib/data/video-shared";

export default function MerchantProductsPage() {
  const t = useTranslations("merchant.products");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const [products, setProducts] = useState<ZidProduct[]>([]);
  const [reels, setReels] = useState<ProductYoutubeReel[]>([]);
  const [channelVideos, setChannelVideos] = useState<VideoItem[]>([]);
  const [search, setSearch] = useState("");
  const [reelSearch, setReelSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [attachProduct, setAttachProduct] = useState<ZidProduct | null>(null);
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
        setProducts([]);
      } else {
        setProducts(productsData.products || []);
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
        p.id.toLowerCase().includes(q)
    );
  }, [products, search]);

  const selectableVideos = useMemo(() => {
    const q = reelSearch.toLowerCase().trim();
    const alreadyLinkedIds = new Set(
      attachProduct
        ? (reelsByProduct.get(attachProduct.id) || []).map((r) => r.youtubeVideoId)
        : []
    );

    return channelVideos.filter((v) => {
      if (!v.videoUrl) return false;
      const title = (locale === "ar" && v.titleAr ? v.titleAr : v.title).toLowerCase();
      if (q && !title.includes(q) && !v.videoUrl.toLowerCase().includes(q)) {
        return false;
      }
      // still show already-linked — save will upsert
      void alreadyLinkedIds;
      return true;
    });
  }, [channelVideos, reelSearch, locale, attachProduct, reelsByProduct]);

  const openAttach = (product: ZidProduct) => {
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
      (locale === "ar" && selected?.titleAr ? selected.titleAr : selected?.title) ||
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
      <Card className="border-0 shadow-sm">
        <CardHeader className="space-y-3">
          <CardTitle>{t("title")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t("searchPlaceholder")}
            className="max-w-md"
          />
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <EmptyState title={t("empty")} description={t("emptyHint")} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="border-b text-start text-muted-foreground">
                    <th className="pb-3 font-medium">{t("image")}</th>
                    <th className="pb-3 font-medium">{t("productName")}</th>
                    <th className="pb-3 font-medium">{t("sku")}</th>
                    <th className="pb-3 font-medium">{t("price")}</th>
                    <th className="pb-3 font-medium">{t("linkedReels")}</th>
                    <th className="pb-3 font-medium">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const linked = reelsByProduct.get(p.id) || [];
                    const displayName =
                      locale === "ar" && p.nameAr ? p.nameAr : p.name;
                    return (
                      <tr key={p.id} className="border-b border-border/70 align-top">
                        <td className="py-3">
                          <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
                            {p.imageUrl ? (
                              <Image
                                src={p.imageUrl}
                                alt={displayName}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : null}
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="font-medium">{displayName}</div>
                          <div className="text-xs text-muted-foreground">
                            ID: {p.id}
                          </div>
                        </td>
                        <td className="py-3">{p.sku || "—"}</td>
                        <td className="py-3">
                          {p.price != null
                            ? formatCurrency(p.price, p.currency || "SAR", locale)
                            : "—"}
                        </td>
                        <td className="py-3">
                          {linked.length === 0 ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <ul className="space-y-2">
                              {linked.map((reel) => (
                                <li
                                  key={reel.id}
                                  className="flex items-start gap-2 rounded-md bg-muted/50 px-2 py-1.5"
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="truncate font-medium">
                                      {reel.title}
                                    </div>
                                    <a
                                      href={reel.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                    >
                                      {reel.youtubeVideoId}
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </div>
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 shrink-0 text-destructive"
                                    onClick={() => setDeleteId(reel.id)}
                                    aria-label={tCommon("delete")}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                        <td className="py-3">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => openAttach(p)}
                          >
                            <Link2 className="me-1.5 h-3.5 w-3.5" />
                            {t("attachReel")}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

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
                      locale === "ar" && video.titleAr
                        ? video.titleAr
                        : video.title;
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
