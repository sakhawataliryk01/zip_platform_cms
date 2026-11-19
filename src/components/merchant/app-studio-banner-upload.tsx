"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { LoadingState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import {
  MAX_BANNERS,
  type BannerItem,
  type ContentStatus,
} from "@/lib/data/banner-shared";
import { notifyMerchantBannersChanged } from "@/hooks/use-merchant-banners";

const emptyForm = {
  title: "",
  titleAr: "",
  linkUrl: "",
  sortOrder: "0",
  status: "ACTIVE" as ContentStatus,
};

export function AppStudioBannerUpload() {
  const t = useTranslations("merchant.appStudio.pages.banners");
  const tBanners = useTranslations("merchant.banners");
  const tCommon = useTranslations("common");
  const fileRef = useRef<HTMLInputElement>(null);

  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/merchant/banners", { cache: "no-store" });
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
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(null);
    setExistingImage(null);
    setEditingId(null);
    setFormOpen(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const onPickFile = (picked: File | null) => {
    setFile(picked);
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(picked ? URL.createObjectURL(picked) : null);
  };

  const startCreate = () => {
    resetForm();
    setFormOpen(true);
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
    setFilePreview(null);
    setExistingImage(banner.imageUrl || null);
    setFormOpen(true);
    if (fileRef.current) fileRef.current.value = "";
  };

  const save = async () => {
    if (!form.title.trim()) {
      toast.error(tBanners("titleRequired"));
      return;
    }
    if (!editingId && banners.length >= MAX_BANNERS) {
      toast.error(tBanners("maxReached"));
      return;
    }
    if (!editingId && !file) {
      toast.error(tBanners("imageRequired"));
      return;
    }

    setSaving(true);
    try {
      const body = new FormData();
      body.set("title", form.title.trim());
      body.set("titleAr", form.titleAr.trim());
      body.set("linkUrl", form.linkUrl.trim());
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
      notifyMerchantBannersChanged();
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
      notifyMerchantBannersChanged();
    } catch {
      toast.error(tCommon("error"));
    }
  };

  const previewSrc = filePreview || existingImage;
  const atLimit = banners.length >= MAX_BANNERS;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-desk-ink">
            {t("uploadTitle")}
          </h2>
          <p className="mt-1 text-xs text-desk-muted">{t("uploadHint")}</p>
          <p className="mt-1 text-[11px] text-desk-muted">
            {t("slotsUsed", { count: banners.length, max: MAX_BANNERS })}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          className="bg-desk-green text-white hover:bg-[#346940]"
          disabled={atLimit && !editingId}
          onClick={startCreate}
        >
          <Plus className="me-1 h-4 w-4" />
          {t("uploadBanner")}
        </Button>
      </div>

      {loading ? (
        <LoadingState label={tCommon("loading")} />
      ) : banners.length === 0 ? (
        <button
          type="button"
          onClick={startCreate}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#d9d3c5] bg-[#fbfaf6] px-4 py-8 text-center transition hover:border-desk-green/50"
        >
          <ImagePlus className="h-7 w-7 text-desk-green" />
          <p className="text-sm font-medium text-desk-ink">{t("emptyUpload")}</p>
          <p className="text-xs text-desk-muted">{t("emptyUploadHint")}</p>
        </button>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {banners.map((banner) => (
            <article
              key={banner.id}
              className="overflow-hidden rounded-2xl border border-[#e7e2d6] bg-white"
            >
              <div className="relative h-28 w-full bg-[#f3f1ea]">
                {banner.imageUrl ? (
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-desk-muted">
                    {t("noImage")}
                  </div>
                )}
                <span
                  className={cn(
                    "absolute start-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    banner.status === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-600"
                  )}
                >
                  {banner.status === "ACTIVE" ? t("active") : t("inactive")}
                </span>
              </div>
              <div className="space-y-2 p-3">
                <p className="truncate text-sm font-semibold text-desk-ink">
                  {banner.title}
                </p>
                {banner.titleAr ? (
                  <p className="truncate text-xs text-desk-muted" dir="rtl">
                    {banner.titleAr}
                  </p>
                ) : null}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => startEdit(banner)}
                  >
                    <Pencil className="me-1 h-3.5 w-3.5" />
                    {tCommon("edit")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setDeleteId(banner.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {formOpen ? (
        <div className="rounded-2xl border border-[#e7e2d6] bg-[#fbfaf6] p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-desk-ink">
              {editingId ? t("editBanner") : t("uploadBanner")}
            </h3>
            <Button type="button" size="sm" variant="ghost" onClick={resetForm}>
              {tCommon("cancel")}
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>{tBanners("image")}</Label>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative h-20 w-36 overflow-hidden rounded-xl border border-[#e7e2d6] bg-white">
                  {previewSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewSrc}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[11px] text-desk-muted">
                      {t("pickImage")}
                    </div>
                  )}
                </div>
                <div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onPickFile(e.target.files?.[0] || null)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                  >
                    <ImagePlus className="me-1 h-4 w-4" />
                    {t("chooseImage")}
                  </Button>
                  <p className="mt-1 text-[11px] text-desk-muted">
                    {t("imageHint")}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="as-b-title">{tBanners("titleEn")}</Label>
              <Input
                id="as-b-title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                className="bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="as-b-title-ar">{tBanners("titleAr")}</Label>
              <Input
                id="as-b-title-ar"
                value={form.titleAr}
                onChange={(e) =>
                  setForm((f) => ({ ...f, titleAr: e.target.value }))
                }
                dir="rtl"
                className="bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="as-b-link">{tBanners("linkUrl")}</Label>
              <Input
                id="as-b-link"
                value={form.linkUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, linkUrl: e.target.value }))
                }
                placeholder="https://"
                className="bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="as-b-status">{tCommon("status")}</Label>
              <Select
                id="as-b-status"
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as ContentStatus,
                  }))
                }
                className="bg-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={resetForm}>
              {tCommon("cancel")}
            </Button>
            <Button
              type="button"
              className="bg-desk-green text-white hover:bg-[#346940]"
              disabled={saving}
              onClick={save}
            >
              {saving ? tCommon("loading") : tCommon("save")}
            </Button>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteId)}
        title={tBanners("deleteTitle")}
        description={tBanners("deleteHint")}
        confirmLabel={tCommon("delete")}
        cancelLabel={tCommon("cancel")}
        onConfirm={remove}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
