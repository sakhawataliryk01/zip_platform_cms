"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import type { ContentStatus, VideoCategory } from "@/lib/data/videos";

const emptyForm = {
  name: "",
  nameAr: "",
  status: "ACTIVE" as ContentStatus,
};

export function VideoCategoriesManager() {
  const t = useTranslations("merchant.videoCategories");
  const tCommon = useTranslations("common");
  const tTable = useTranslations("table");
  const locale = useLocale();

  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/merchant/video-categories");
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || tCommon("error"));
        return;
      }
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
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (category: VideoCategory) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      nameAr: category.nameAr || "",
      status: category.status,
    });
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error(t("nameRequired"));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/merchant/video-categories", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingId
            ? { id: editingId, ...form }
            : form
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
        `/api/merchant/video-categories?id=${encodeURIComponent(deleteId)}`,
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
          <CardTitle>{t("title")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="vc-name">{t("nameEn")}</Label>
              <Input
                id="vc-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder={t("nameEnPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vc-name-ar">{t("nameAr")}</Label>
              <Input
                id="vc-name-ar"
                value={form.nameAr}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nameAr: e.target.value }))
                }
                placeholder={t("nameArPlaceholder")}
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vc-status">{tCommon("status")}</Label>
              <Select
                id="vc-status"
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
              {editingId ? tCommon("update") : t("addCategory")}
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
          {categories.length === 0 ? (
            <EmptyState title={tCommon("empty")} description={t("subtitle")} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b text-start text-muted-foreground">
                    <th className="pb-3 font-medium">{t("nameEn")}</th>
                    <th className="pb-3 font-medium">{t("nameAr")}</th>
                    <th className="pb-3 font-medium">{tTable("status")}</th>
                    <th className="pb-3 font-medium">{tTable("createdDate")}</th>
                    <th className="pb-3 font-medium">{tTable("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id} className="border-b border-border/70">
                      <td className="py-3 font-medium">{category.name}</td>
                      <td className="py-3" dir="rtl">
                        {category.nameAr || "—"}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={category.status} />
                      </td>
                      <td className="py-3">
                        {formatDate(category.createdAt, locale)}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title={tCommon("edit")}
                            onClick={() => startEdit(category)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title={tCommon("delete")}
                            onClick={() => setDeleteId(category.id)}
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
