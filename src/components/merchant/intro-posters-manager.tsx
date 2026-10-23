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
import type {
  ContentStatus,
  IntroPosterItem,
} from "@/lib/data/intro-poster-shared";
import { MAX_INTRO_POSTERS } from "@/lib/data/intro-poster-shared";

const emptyForm = {
  title: "",
  titleAr: "",
  sortOrder: "0",
  status: "ACTIVE" as ContentStatus,
};

export function IntroPostersManager() {
  const t = useTranslations("merchant.introPosters");
  const tCommon = useTranslations("common");
  const tTable = useTranslations("table");
  const locale = useLocale();
  const fileRef = useRef<HTMLInputElement>(null);

  const [posters, setPosters] = useState<IntroPosterItem[]>([]);
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
      const res = await fetch("/api/merchant/intro-posters");
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || tCommon("error"));
        return;
      }
      setPosters(data.posters || []);
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

  const startEdit = (poster: IntroPosterItem) => {
    setEditingId(poster.id);
    setForm({
      title: poster.title,
      titleAr: poster.titleAr || "",
      sortOrder: String(poster.sortOrder ?? 0),
      status: poster.status,
    });
    setFile(null);
    setPreview(null);
    setExistingImage(poster.imageUrl || null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const save = async () => {
    if (!editingId && posters.length >= MAX_INTRO_POSTERS) {
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
      body.set("sortOrder", form.sortOrder || "0");
      body.set("status", form.status);
      if (editingId) body.set("id", editingId);
      if (file) body.set("file", file);

      const res = await fetch("/api/merchant/intro-posters", {
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
        `/api/merchant/intro-posters?id=${encodeURIComponent(deleteId)}`,
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

  if (loading) return <LoadingState label={tCommon("loading")} />;

  const previewSrc = preview || existingImage;
  const atLimit = posters.length >= MAX_INTRO_POSTERS;

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{t("title")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
            <p className="text-xs text-muted-foreground">{t("storageHint")}</p>
          </div>
          <p className="rounded-lg bg-muted px-3 py-1.5 text-sm font-medium">
            {t("slotsUsed", {
              count: posters.length,
              max: MAX_INTRO_POSTERS,
            })}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!editingId && atLimit ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {t("maxReached")}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ip-title">{t("titleEn")}</Label>
              <Input
                id="ip-title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder={t("titleEnPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ip-title-ar">{t("titleAr")}</Label>
              <Input
                id="ip-title-ar"
                value={form.titleAr}
                onChange={(e) =>
                  setForm((f) => ({ ...f, titleAr: e.target.value }))
                }
                placeholder={t("titleArPlaceholder")}
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ip-sort">{t("sortOrder")}</Label>
              <Input
                id="ip-sort"
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sortOrder: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ip-status">{tCommon("status")}</Label>
              <Select
                id="ip-status"
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

          <div className="space-y-2">
            <Label htmlFor="ip-file">{t("image")}</Label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="flex-1 space-y-2">
                <Input
                  id="ip-file"
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  disabled={!editingId && atLimit}
                  onChange={(e) => onPickFile(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-muted-foreground">{t("imageHint")}</p>
              </div>
              <div className="flex h-40 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted/40">
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
              {editingId ? tCommon("update") : t("addPoster")}
            </Button>
            {editingId ? (
              <Button variant="outline" onClick={resetForm}>
                {tCommon("cancel")}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{t("listTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {posters.length === 0 ? (
            <EmptyState title={tCommon("empty")} description={t("subtitle")} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead>
                  <tr className="border-b text-start text-muted-foreground">
                    <th className="pb-3 font-medium">{t("image")}</th>
                    <th className="pb-3 font-medium">{t("titleEn")}</th>
                    <th className="pb-3 font-medium">{t("sortOrder")}</th>
                    <th className="pb-3 font-medium">{tTable("status")}</th>
                    <th className="pb-3 font-medium">{tTable("createdDate")}</th>
                    <th className="pb-3 font-medium">{tTable("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {posters.map((poster) => (
                    <tr key={poster.id} className="border-b border-border/70">
                      <td className="py-3">
                        {poster.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={poster.imageUrl}
                            alt={poster.title}
                            className="h-20 w-14 rounded object-cover"
                          />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3">
                        <div className="font-medium">{poster.title || "—"}</div>
                        {poster.titleAr ? (
                          <div
                            className="text-xs text-muted-foreground"
                            dir="rtl"
                          >
                            {poster.titleAr}
                          </div>
                        ) : null}
                      </td>
                      <td className="py-3">{poster.sortOrder}</td>
                      <td className="py-3">
                        <StatusBadge status={poster.status} />
                      </td>
                      <td className="py-3">
                        {formatDate(poster.createdAt, locale)}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title={tCommon("edit")}
                            onClick={() => startEdit(poster)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title={tCommon("delete")}
                            onClick={() => setDeleteId(poster.id)}
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
