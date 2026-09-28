"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
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
  VideoCategory,
  VideoItem,
  VideoType,
} from "@/lib/data/videos";

const emptyForm = {
  title: "",
  titleAr: "",
  videoUrl: "",
  thumbnailUrl: "",
  categoryId: "",
  status: "ACTIVE" as ContentStatus,
};

export function VideosManager({ videoType }: { videoType: VideoType }) {
  const t = useTranslations("merchant.videos");
  const tCommon = useTranslations("common");
  const tTable = useTranslations("table");
  const locale = useLocale();

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const pageTitle =
    videoType === "EXPLORE" ? t("exploreTitle") : t("experiencesTitle");
  const pageSubtitle =
    videoType === "EXPLORE" ? t("exploreSubtitle") : t("experiencesSubtitle");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/merchant/videos?type=${encodeURIComponent(videoType)}`
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || tCommon("error"));
        return;
      }
      setVideos(data.videos || []);
      setCategories(data.categories || []);
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoType]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (video: VideoItem) => {
    setEditingId(video.id);
    setForm({
      title: video.title,
      titleAr: video.titleAr || "",
      videoUrl: video.videoUrl || "",
      thumbnailUrl: video.thumbnailUrl || "",
      categoryId: video.categoryId || "",
      status: video.status,
    });
  };

  const categoryLabel = (id?: string) => {
    if (!id) return "—";
    const cat = categories.find((c) => c.id === id);
    if (!cat) return "—";
    return locale === "ar" && cat.nameAr ? cat.nameAr : cat.name;
  };

  const save = async () => {
    if (!form.title.trim()) {
      toast.error(t("titleRequired"));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title,
        titleAr: form.titleAr,
        videoUrl: form.videoUrl,
        thumbnailUrl: form.thumbnailUrl,
        categoryId: form.categoryId || null,
        status: form.status,
        videoType,
      };

      const res = await fetch("/api/merchant/videos", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingId ? { id: editingId, ...payload } : payload
        ),
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
        `/api/merchant/videos?id=${encodeURIComponent(deleteId)}`,
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

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{pageTitle}</CardTitle>
          <p className="text-sm text-muted-foreground">{pageSubtitle}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="v-title">{t("titleEn")}</Label>
              <Input
                id="v-title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder={t("titleEnPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="v-title-ar">{t("titleAr")}</Label>
              <Input
                id="v-title-ar"
                value={form.titleAr}
                onChange={(e) =>
                  setForm((f) => ({ ...f, titleAr: e.target.value }))
                }
                placeholder={t("titleArPlaceholder")}
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="v-url">{t("videoUrl")}</Label>
              <Input
                id="v-url"
                value={form.videoUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, videoUrl: e.target.value }))
                }
                placeholder="https://"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="v-thumb">{t("thumbnailUrl")}</Label>
              <Input
                id="v-thumb"
                value={form.thumbnailUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, thumbnailUrl: e.target.value }))
                }
                placeholder="https://"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="v-category">{t("category")}</Label>
              <Select
                id="v-category"
                value={form.categoryId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, categoryId: e.target.value }))
                }
              >
                <option value="">{t("noCategory")}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {locale === "ar" && c.nameAr ? c.nameAr : c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="v-status">{tCommon("status")}</Label>
              <Select
                id="v-status"
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
          <div className="flex flex-wrap gap-2">
            <Button onClick={save} disabled={saving}>
              <Plus className="h-4 w-4" />
              {editingId ? tCommon("update") : t("addVideo")}
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
          {videos.length === 0 ? (
            <EmptyState title={tCommon("empty")} description={pageSubtitle} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b text-start text-muted-foreground">
                    <th className="pb-3 font-medium">{t("titleEn")}</th>
                    <th className="pb-3 font-medium">{t("category")}</th>
                    <th className="pb-3 font-medium">{t("videoUrl")}</th>
                    <th className="pb-3 font-medium">{tTable("status")}</th>
                    <th className="pb-3 font-medium">{tTable("createdDate")}</th>
                    <th className="pb-3 font-medium">{tTable("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map((video) => (
                    <tr key={video.id} className="border-b border-border/70">
                      <td className="py-3">
                        <div className="font-medium">{video.title}</div>
                        {video.titleAr && (
                          <div className="text-xs text-muted-foreground" dir="rtl">
                            {video.titleAr}
                          </div>
                        )}
                      </td>
                      <td className="py-3">{categoryLabel(video.categoryId)}</td>
                      <td className="py-3">
                        {video.videoUrl ? (
                          <a
                            href={video.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-teal-700 hover:underline"
                          >
                            {t("open")}
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={video.status} />
                      </td>
                      <td className="py-3">
                        {formatDate(video.createdAt, locale)}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title={tCommon("edit")}
                            onClick={() => startEdit(video)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title={tCommon("delete")}
                            onClick={() => setDeleteId(video.id)}
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
