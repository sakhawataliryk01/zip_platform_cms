"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Bell, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState, LoadingState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import type { ContentStatus, NoticeItem } from "@/lib/data/notice-shared";
import { MAX_NOTICES } from "@/lib/data/notice-shared";

const emptyForm = {
  title: "",
  titleAr: "",
  message: "",
  messageAr: "",
  status: "ACTIVE" as ContentStatus,
};

export function NoticesManager() {
  const t = useTranslations("merchant.notices");
  const tCommon = useTranslations("common");
  const tTable = useTranslations("table");
  const locale = useLocale();

  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/merchant/notices");
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || tCommon("error"));
        return;
      }
      setNotices(data.notices || []);
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Match other merchant managers (banners / intro posters) load-on-mount pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch after mount
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (notice: NoticeItem) => {
    setEditingId(notice.id);
    setForm({
      title: notice.title,
      titleAr: notice.titleAr || "",
      message: notice.message,
      messageAr: notice.messageAr || "",
      status: notice.status,
    });
  };

  const save = async () => {
    if (!form.title.trim()) {
      toast.error(t("titleRequired"));
      return;
    }
    if (!form.message.trim() || form.message.trim().length < 3) {
      toast.error(t("messageRequired"));
      return;
    }
    if (!editingId && notices.length >= MAX_NOTICES) {
      toast.error(t("maxReached"));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/merchant/notices", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editingId ? { id: editingId } : {}),
          ...form,
        }),
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
        `/api/merchant/notices?id=${encodeURIComponent(deleteId)}`,
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

  const atLimit = notices.length >= MAX_NOTICES;
  const activeCount = notices.filter((n) => n.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              {t("title")}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("hint")}</p>
          </div>
          <div className="rounded-lg bg-muted px-3 py-1.5 text-sm font-medium">
            {t("slotsUsed", { count: notices.length, max: MAX_NOTICES })}
            <span className="ms-2 text-muted-foreground">
              · {t("activeCount", { count: activeCount })}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!editingId && atLimit ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {t("maxReached")}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="n-title">{t("titleEn")}</Label>
              <Input
                id="n-title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder={t("titleEnPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="n-title-ar">{t("titleAr")}</Label>
              <Input
                id="n-title-ar"
                value={form.titleAr}
                onChange={(e) =>
                  setForm((f) => ({ ...f, titleAr: e.target.value }))
                }
                placeholder={t("titleArPlaceholder")}
                dir="rtl"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="n-message">{t("messageEn")}</Label>
              <Textarea
                id="n-message"
                rows={3}
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
                placeholder={t("messageEnPlaceholder")}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="n-message-ar">{t("messageAr")}</Label>
              <Textarea
                id="n-message-ar"
                rows={3}
                dir="rtl"
                value={form.messageAr}
                onChange={(e) =>
                  setForm((f) => ({ ...f, messageAr: e.target.value }))
                }
                placeholder={t("messageArPlaceholder")}
              />
            </div>
            <div className="space-y-2 max-w-xs">
              <Label htmlFor="n-status">{tCommon("status")}</Label>
              <Select
                id="n-status"
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
            <Button onClick={save} disabled={saving || (!editingId && atLimit)}>
              <Plus className="h-4 w-4" />
              {editingId ? tCommon("update") : t("addNotice")}
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
          {notices.length === 0 ? (
            <EmptyState title={t("empty")} description={t("emptyHint")} />
          ) : (
            <div className="space-y-3">
              {notices.map((notice) => (
                <div
                  key={notice.id}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium text-foreground">
                          {locale === "ar" && notice.titleAr
                            ? notice.titleAr
                            : notice.title}
                        </h3>
                        <StatusBadge status={notice.status} />
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {locale === "ar" && notice.messageAr
                          ? notice.messageAr
                          : notice.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tTable("createdDate")}:{" "}
                        {formatDate(notice.createdAt, locale)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title={tCommon("edit")}
                        onClick={() => startEdit(notice)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title={tCommon("delete")}
                        onClick={() => setDeleteId(notice.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
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
