"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState, LoadingState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import type { BannerItem, ContentStatus } from "@/lib/data/banner-shared";
import { MAX_BANNERS } from "@/lib/data/banner-shared";

const emptyForm = {
  title: "",
  titleAr: "",
  linkUrl: "",
  sortOrder: "0",
  status: "ACTIVE" as ContentStatus,
};

export function BannersManager() {
  const t = useTranslations("merchant.banners");
  const tCommon = useTranslations("common");
  const tTable = useTranslations("table");
  const locale = useLocale();
  const fileRef = useRef<HTMLInputElement>(null);

  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/merchant/banners");
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || tCommon("error"));
        return;
      }
      setBanners(data.banners || []);
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

  const resetForm = () => {
    setForm(emptyForm);
    setFile(null);
    setPreview(null);
    setExistingImage(null);
    setEditingId(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const onPickFile = (picked: File | null) => {
    setFile(picked);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(picked ? URL.createObjectURL(picked) : null);
  };

  const startEdit = (banner: BannerItem) => {
    setEditingId(banner.id);
    setForm({
      title: banner.title,
      titleAr: banner.titleAr || "",
      linkUrl: banner.linkUrl || "",
      sortOrder: String(banner.sortOrder ?? 0),
      status: banner.status,
    });
    setFile(null);
    setPreview(null);
    setExistingImage(banner.imageUrl || null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const save = async () => {
    if (!form.title.trim()) {
      toast.error(t("titleRequired"));
      return;
    }
    if (!editingId && banners.length >= MAX_BANNERS) {
      toast.error(t("maxReached"));
      return;
    }
    if (!editingId && !file) {
      toast.error(t("imageRequired"));
      return;
    }

    setSaving(true);
    try {
      const body = new FormData();
      body.set("title", form.title);
      body.set("titleAr", form.titleAr);
      body.set("linkUrl", form.linkUrl);
      body.set("sortOrder", form.sortOrder || "0");
      body.set("status", form.status);
      if (editingId) body.set("id", editingId);
      if (file) body.set("file", file);

      const res = await fetch("/api/merchant/banners", {
        method: editingId ? "PATCH" : "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || tCommon("error"));
        return;
      }
      toast.success(tCommon("success"));
      resetForm();
      await load();
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(
        `/api/merchant/banners?id=${encodeURIComponent(deleteId)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || tCommon("error"));
        return;
      }
      toast.success(tCommon("success"));
      setDeleteId(null);
      if (editingId === deleteId) resetForm();
      await load();
    } catch {
      toast.error(tCommon("error"));
    }
  };

  if (loading) {
    return <LoadingState label={tCommon("loading")} />;
  }

  const previewSrc = preview || existingImage;
  const atLimit = banners.length >= MAX_BANNERS;
  const canAddNew = !atLimit || !!editingId;

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{t("title")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
            <p className="text-xs text-muted-foreground">{t("storageHint")}</p>
          </div>
          <p className="rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-foreground">
            {t("slotsUsed", { count: banners.length, max: MAX_BANNERS })}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canAddNew && !editingId ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {t("maxReached")}
            </div>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="b-title">{t("titleEn")}</Label>
              <Input
                id="b-title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder={t("titleEnPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="b-title-ar">{t("titleAr")}</Label>
              <Input
                id="b-title-ar"
                value={form.titleAr}
                onChange={(e) =>
                  setForm((f) => ({ ...f, titleAr: e.target.value }))
                }
                placeholder={t("titleArPlaceholder")}
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="b-link">{t("linkUrl")}</Label>
              <Input
                id="b-link"
                value={form.linkUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, linkUrl: e.target.value }))
                }
                placeholder="https://"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="b-sort">{t("sortOrder")}</Label>
                <Input
                  id="b-sort"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sortOrder: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-status">{tCommon("status")}</Label>
                <Select
                  id="b-status"
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      status: e.target.value as ContentStatus,
                    }))
                  }
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="b-file">{t("image")}</Label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="flex-1 space-y-2">
                <Input
                  id="b-file"
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  disabled={!editingId && atLimit}
                  onChange={(e) => onPickFile(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-muted-foreground">{t("imageHint")}</p>
              </div>
              <div className="flex h-28 w-44 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted/40">
                {previewSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewSrc}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <ImagePlus className="h-6 w-6" />
                    <span className="text-xs">{t("noPreview")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={save}
              disabled={saving || (!editingId && atLimit)}
            >
              <Plus className="h-4 w-4" />
              {editingId ? tCommon("update") : t("addBanner")}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={resetForm}>
                {tCommon("cancel")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{t("listTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {banners.length === 0 ? (
            <EmptyState title={tCommon("empty")} description={t("subtitle")} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b text-start text-muted-foreground">
                    <th className="pb-3 font-medium">{t("image")}</th>
                    <th className="pb-3 font-medium">{t("titleEn")}</th>
                    <th className="pb-3 font-medium">{t("linkUrl")}</th>
                    <th className="pb-3 font-medium">{t("sortOrder")}</th>
                    <th className="pb-3 font-medium">{tTable("status")}</th>
                    <th className="pb-3 font-medium">{tTable("createdDate")}</th>
                    <th className="pb-3 font-medium">{tTable("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {banners.map((banner) => (
                    <tr key={banner.id} className="border-b border-border/70">
                      <td className="py-3">
                        {banner.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={banner.imageUrl}
                            alt={banner.title}
                            className="h-12 w-20 rounded object-cover"
                          />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3">
                        <div className="font-medium">{banner.title}</div>
                        {banner.titleAr && (
                          <div
                            className="text-xs text-muted-foreground"
                            dir="rtl"
                          >
                            {banner.titleAr}
                          </div>
                        )}
                      </td>
                      <td className="py-3 max-w-[180px] truncate">
                        {banner.linkUrl || "—"}
                      </td>
                      <td className="py-3">{banner.sortOrder}</td>
                      <td className="py-3">
                        <StatusBadge status={banner.status} />
                      </td>
                      <td className="py-3">
                        {formatDate(banner.createdAt, locale)}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title={tCommon("edit")}
                            onClick={() => startEdit(banner)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title={tCommon("delete")}
                            onClick={() => setDeleteId(banner.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        title={t("deleteTitle")}
        description={t("deleteHint")}
        destructive
        onConfirm={remove}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
