"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ExternalLink, Link2, Pencil, Plus, RefreshCw, Trash2, Unlink } from "lucide-react";
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
import { validateYoutubeReelUrl } from "@/lib/youtube";
import type {
  ContentStatus,
  VideoCategory,
  VideoItem,
  VideoType,
} from "@/lib/data/video-shared";

type ConnectedChannel = {
  id: string;
  channelUrl: string;
  channelId?: string;
  channelTitle?: string;
  channelHandle?: string;
  thumbnailUrl?: string;
  googleAccountEmail?: string;
  authType?: string;
  lastSyncedAt?: string;
  status: string;
};

const emptyCategoryForm = {
  name: "",
  nameAr: "",
  status: "ACTIVE" as ContentStatus,
};

const emptyReelForm = {
  title: "",
  titleAr: "",
  videoUrl: "",
  categoryId: "",
  videoType: "EXPLORE" as VideoType,
  status: "ACTIVE" as ContentStatus,
};

export function VideoCategoriesManager() {
  const t = useTranslations("merchant.videoCategories");
  const tCommon = useTranslations("common");
  const tTable = useTranslations("table");
  const locale = useLocale();

  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [reels, setReels] = useState<VideoItem[]>([]);
  const [channel, setChannel] = useState<ConnectedChannel | null>(null);
  const [oauthConfigured, setOauthConfigured] = useState(false);
  const [canSync, setCanSync] = useState(false);
  const [redirectUri, setRedirectUri] = useState("");
  const [javascriptOrigin, setJavascriptOrigin] = useState("");
  const [clientIdInput, setClientIdInput] = useState("");
  const [clientSecretInput, setClientSecretInput] = useState("");
  const [hasSavedSecret, setHasSavedSecret] = useState(false);
  const [savingApp, setSavingApp] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [savingReel, setSavingReel] = useState(false);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [reelForm, setReelForm] = useState(emptyReelForm);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [editingReelId, setEditingReelId] = useState<string | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [deleteReelId, setDeleteReelId] = useState<string | null>(null);
  const [disconnectOpen, setDisconnectOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [catRes, videoRes, channelRes] = await Promise.all([
        fetch("/api/merchant/video-categories"),
        fetch("/api/merchant/videos"),
        fetch("/api/merchant/youtube-channel"),
      ]);
      const catData = await catRes.json();
      const videoData = await videoRes.json();
      const channelData = await channelRes.json();

      if (!catRes.ok) {
        toast.error(catData.error || tCommon("error"));
        return;
      }
      if (!videoRes.ok) {
        toast.error(videoData.error || tCommon("error"));
        return;
      }

      setCategories(catData.categories || []);
      setReels(videoData.videos || []);
      if (channelRes.ok) {
        setChannel(channelData.channel || null);
        setOauthConfigured(Boolean(channelData.oauthConfigured));
        setCanSync(Boolean(channelData.canSync));
        setRedirectUri(channelData.redirectUri || "");
        setJavascriptOrigin(channelData.javascriptOrigin || "");
        setClientIdInput(channelData.youtubeApp?.googleClientId || "");
        setHasSavedSecret(Boolean(channelData.youtubeApp?.hasSecret));
        setClientSecretInput(
          channelData.youtubeApp?.googleClientSecretMasked || ""
        );
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("youtube");
    const err = params.get("youtube_error");
    if (connected === "connected") {
      toast.success(t("oauthConnected"));
      window.history.replaceState({}, "", window.location.pathname);
      load();
    } else if (err) {
      toast.error(decodeURIComponent(err));
      window.history.replaceState({}, "", window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startYoutubeOAuth = () => {
    if (!oauthConfigured) {
      toast.error(t("saveCredentialsFirst"));
      return;
    }
    window.location.href = `/api/merchant/youtube/oauth/start?locale=${encodeURIComponent(locale)}`;
  };

  const saveYoutubeApp = async () => {
    if (!clientIdInput.trim()) {
      toast.error(t("clientIdRequired"));
      return;
    }
    if (!hasSavedSecret && !clientSecretInput.trim()) {
      toast.error(t("clientSecretRequired"));
      return;
    }

    setSavingApp(true);
    try {
      const res = await fetch("/api/merchant/youtube-app", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleClientId: clientIdInput.trim(),
          googleClientSecret: clientSecretInput.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || tCommon("error"));
        return;
      }
      toast.success(t("credentialsSaved"));
      setOauthConfigured(Boolean(data.app?.configured));
      setHasSavedSecret(Boolean(data.app?.hasSecret));
      setClientIdInput(data.app?.googleClientId || clientIdInput);
      setClientSecretInput(data.app?.googleClientSecretMasked || "");
      await load();
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setSavingApp(false);
    }
  };

  const syncShorts = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/merchant/youtube-channel/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoType: "EXPLORE",
          categoryId: categories.find((c) => c.status === "ACTIVE")?.id,
          maxResults: 12,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || tCommon("error"));
        return;
      }
      toast.success(
        t("syncSuccess", {
          imported: data.imported ?? 0,
          skipped: data.skipped ?? 0,
        })
      );
      await load();
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setSyncing(false);
    }
  };

  const disconnectChannel = async () => {
    try {
      const res = await fetch("/api/merchant/youtube-channel", {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || tCommon("error"));
        return;
      }
      toast.success(tCommon("success"));
      setDisconnectOpen(false);
      setChannel(null);
      await load();
    } catch {
      toast.error(tCommon("error"));
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm(emptyCategoryForm);
    setEditingCategoryId(null);
  };

  const resetReelForm = () => {
    setReelForm({
      ...emptyReelForm,
      categoryId: categories[0]?.id || "",
    });
    setEditingReelId(null);
  };

  useEffect(() => {
    if (!reelForm.categoryId && categories[0]?.id) {
      setReelForm((f) => ({ ...f, categoryId: categories[0].id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  const startEditCategory = (category: VideoCategory) => {
    setEditingCategoryId(category.id);
    setCategoryForm({
      name: category.name,
      nameAr: category.nameAr || "",
      status: category.status,
    });
  };

  const startEditReel = (reel: VideoItem) => {
    setEditingReelId(reel.id);
    setReelForm({
      title: reel.title,
      titleAr: reel.titleAr || "",
      videoUrl: reel.videoUrl || "",
      categoryId: reel.categoryId || "",
      videoType: reel.videoType,
      status: reel.status,
    });
  };

  const saveCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast.error(t("nameRequired"));
      return;
    }

    setSavingCategory(true);
    try {
      const res = await fetch("/api/merchant/video-categories", {
        method: editingCategoryId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingCategoryId
            ? { id: editingCategoryId, ...categoryForm }
            : categoryForm
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || tCommon("error"));
        return;
      }
      toast.success(tCommon("success"));
      resetCategoryForm();
      await load();
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setSavingCategory(false);
    }
  };

  const saveReel = async () => {
    if (!reelForm.title.trim()) {
      toast.error(t("reelTitleRequired"));
      return;
    }
    if (!reelForm.categoryId) {
      toast.error(t("categoryRequired"));
      return;
    }

    const parsed = validateYoutubeReelUrl(reelForm.videoUrl);
    if (!parsed.ok) {
      toast.error(parsed.error || t("reelUrlInvalid"));
      return;
    }

    setSavingReel(true);
    try {
      const payload = {
        title: reelForm.title,
        titleAr: reelForm.titleAr,
        videoUrl: parsed.normalized,
        thumbnailUrl: parsed.thumbnailUrl,
        categoryId: reelForm.categoryId,
        videoType: reelForm.videoType,
        status: reelForm.status,
      };

      const res = await fetch("/api/merchant/videos", {
        method: editingReelId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingReelId ? { id: editingReelId, ...payload } : payload
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || tCommon("error"));
        return;
      }
      toast.success(tCommon("success"));
      resetReelForm();
      await load();
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setSavingReel(false);
    }
  };

  const removeCategory = async () => {
    if (!deleteCategoryId) return;
    try {
      const res = await fetch(
        `/api/merchant/video-categories?id=${encodeURIComponent(deleteCategoryId)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || tCommon("error"));
        return;
      }
      toast.success(tCommon("success"));
      setDeleteCategoryId(null);
      if (editingCategoryId === deleteCategoryId) resetCategoryForm();
      await load();
    } catch {
      toast.error(tCommon("error"));
    }
  };

  const removeReel = async () => {
    if (!deleteReelId) return;
    try {
      const res = await fetch(
        `/api/merchant/videos?id=${encodeURIComponent(deleteReelId)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || tCommon("error"));
        return;
      }
      toast.success(tCommon("success"));
      setDeleteReelId(null);
      if (editingReelId === deleteReelId) resetReelForm();
      await load();
    } catch {
      toast.error(tCommon("error"));
    }
  };

  const categoryLabel = (id?: string) => {
    if (!id) return "—";
    const cat = categories.find((c) => c.id === id);
    if (!cat) return "—";
    return locale === "ar" && cat.nameAr ? cat.nameAr : cat.name;
  };

  const reelPreview = validateYoutubeReelUrl(reelForm.videoUrl);

  if (loading) {
    return <LoadingState label={tCommon("loading")} />;
  }

  return (
    <div className="space-y-6">
      {/* YouTube Integration (per-merchant OAuth credentials + connect) */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{t("integrationTitle")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("integrationSubtitle")}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium">{t("credentialsTitle")}</p>
            <p className="text-xs text-muted-foreground">{t("credentialsHint")}</p>
            {redirectUri && (
              <div className="space-y-1 text-xs">
                <p>
                  <span className="font-medium">{t("redirectUriLabel")}:</span>{" "}
                  <code className="break-all rounded bg-background px-1 py-0.5">
                    {redirectUri}
                  </code>
                </p>
                {javascriptOrigin && (
                  <p>
                    <span className="font-medium">{t("originLabel")}:</span>{" "}
                    <code className="break-all rounded bg-background px-1 py-0.5">
                      {javascriptOrigin}
                    </code>
                  </p>
                )}
              </div>
            )}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="yt-client-id">{t("clientId")}</Label>
                <Input
                  id="yt-client-id"
                  value={clientIdInput}
                  onChange={(e) => setClientIdInput(e.target.value)}
                  placeholder="xxxxx.apps.googleusercontent.com"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yt-client-secret">{t("clientSecret")}</Label>
                <Input
                  id="yt-client-secret"
                  type="password"
                  value={clientSecretInput}
                  onChange={(e) => setClientSecretInput(e.target.value)}
                  placeholder={
                    hasSavedSecret
                      ? t("clientSecretKeepHint")
                      : "GOCSPX-xxxxxxxx"
                  }
                  autoComplete="new-password"
                />
              </div>
            </div>
            <Button onClick={saveYoutubeApp} disabled={savingApp}>
              {savingApp ? tCommon("loading") : t("saveCredentials")}
            </Button>
          </div>

          {channel ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                {channel.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={channel.thumbnailUrl}
                    alt=""
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <Link2 className="h-6 w-6" />
                  </div>
                )}
                <div className="space-y-1">
                  <p className="flex items-center gap-2 font-medium">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500"
                      aria-hidden
                    />
                    {t("connectedLabel")}:{" "}
                    {channel.channelTitle ||
                      channel.channelHandle ||
                      t("myYoutubeChannel")}
                  </p>
                  {channel.channelId && (
                    <p className="font-mono text-xs text-muted-foreground">
                      {t("channelIdLabel")}: {channel.channelId}
                    </p>
                  )}
                  {channel.googleAccountEmail && (
                    <p className="text-xs text-muted-foreground">
                      {channel.googleAccountEmail}
                    </p>
                  )}
                  <a
                    href={channel.channelUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-teal-700 hover:underline"
                  >
                    {t("openChannel")}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <p className="text-xs text-muted-foreground">
                    {channel.lastSyncedAt
                      ? `${t("lastSynced")}: ${formatDate(channel.lastSyncedAt, locale)}`
                      : t("neverSynced")}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={syncShorts} disabled={syncing || !canSync}>
                  <RefreshCw
                    className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`}
                  />
                  {syncing ? t("syncing") : t("syncShorts")}
                </Button>
                <Button
                  variant="outline"
                  onClick={startYoutubeOAuth}
                  disabled={!oauthConfigured}
                >
                  <Link2 className="h-4 w-4" />
                  {t("reconnectChannel")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDisconnectOpen(true)}
                >
                  <Unlink className="h-4 w-4" />
                  {t("disconnectChannel")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {oauthConfigured
                  ? t("oauthConnectHint")
                  : t("saveCredentialsFirst")}
              </p>
              <Button onClick={startYoutubeOAuth} disabled={!oauthConfigured}>
                <Link2 className="h-4 w-4" />
                {t("connectYoutube")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categories */}
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
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder={t("nameEnPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vc-name-ar">{t("nameAr")}</Label>
              <Input
                id="vc-name-ar"
                value={categoryForm.nameAr}
                onChange={(e) =>
                  setCategoryForm((f) => ({ ...f, nameAr: e.target.value }))
                }
                placeholder={t("nameArPlaceholder")}
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vc-status">{tCommon("status")}</Label>
              <Select
                id="vc-status"
                value={categoryForm.status}
                onChange={(e) =>
                  setCategoryForm((f) => ({
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
            <Button onClick={saveCategory} disabled={savingCategory}>
              <Plus className="h-4 w-4" />
              {editingCategoryId ? tCommon("update") : t("addCategory")}
            </Button>
            {editingCategoryId && (
              <Button variant="outline" onClick={resetCategoryForm}>
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
                            onClick={() => startEditCategory(category)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title={tCommon("delete")}
                            onClick={() => setDeleteCategoryId(category.id)}
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

      {/* YouTube Reels */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{t("reelsTitle")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("reelsSubtitle")}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {categories.length === 0 ? (
            <EmptyState
              title={t("needCategoryFirst")}
              description={t("needCategoryHint")}
            />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="reel-title">{t("reelTitleEn")}</Label>
                  <Input
                    id="reel-title"
                    value={reelForm.title}
                    onChange={(e) =>
                      setReelForm((f) => ({ ...f, title: e.target.value }))
                    }
                    placeholder={t("reelTitleEnPlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reel-title-ar">{t("reelTitleAr")}</Label>
                  <Input
                    id="reel-title-ar"
                    value={reelForm.titleAr}
                    onChange={(e) =>
                      setReelForm((f) => ({ ...f, titleAr: e.target.value }))
                    }
                    placeholder={t("reelTitleArPlaceholder")}
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="reel-url">{t("reelUrl")}</Label>
                  <Input
                    id="reel-url"
                    value={reelForm.videoUrl}
                    onChange={(e) =>
                      setReelForm((f) => ({ ...f, videoUrl: e.target.value }))
                    }
                    placeholder="https://www.youtube.com/shorts/xxxxx"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("reelUrlHint")}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reel-category">{t("category")}</Label>
                  <Select
                    id="reel-category"
                    value={reelForm.categoryId}
                    onChange={(e) =>
                      setReelForm((f) => ({
                        ...f,
                        categoryId: e.target.value,
                      }))
                    }
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {locale === "ar" && c.nameAr ? c.nameAr : c.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reel-placement">{t("showIn")}</Label>
                  <Select
                    id="reel-placement"
                    value={reelForm.videoType}
                    onChange={(e) =>
                      setReelForm((f) => ({
                        ...f,
                        videoType: e.target.value as VideoType,
                      }))
                    }
                  >
                    <option value="EXPLORE">{t("placementExplore")}</option>
                    <option value="EXPERIENCE">
                      {t("placementExperiences")}
                    </option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reel-status">{tCommon("status")}</Label>
                  <Select
                    id="reel-status"
                    value={reelForm.status}
                    onChange={(e) =>
                      setReelForm((f) => ({
                        ...f,
                        status: e.target.value as ContentStatus,
                      }))
                    }
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </Select>
                </div>
                <div className="flex items-end">
                  <div className="flex h-24 w-16 overflow-hidden rounded-lg border bg-muted/40">
                    {reelPreview.ok && reelPreview.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={reelPreview.thumbnailUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                        Shorts
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={saveReel} disabled={savingReel}>
                  <Plus className="h-4 w-4" />
                  {editingReelId ? tCommon("update") : t("addReel")}
                </Button>
                {editingReelId && (
                  <Button variant="outline" onClick={resetReelForm}>
                    {tCommon("cancel")}
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{t("reelsListTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {reels.length === 0 ? (
            <EmptyState
              title={tCommon("empty")}
              description={t("reelsSubtitle")}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm">
                <thead>
                  <tr className="border-b text-start text-muted-foreground">
                    <th className="pb-3 font-medium">{t("preview")}</th>
                    <th className="pb-3 font-medium">{t("reelTitleEn")}</th>
                    <th className="pb-3 font-medium">{t("category")}</th>
                    <th className="pb-3 font-medium">{t("showIn")}</th>
                    <th className="pb-3 font-medium">{t("reelUrl")}</th>
                    <th className="pb-3 font-medium">{tTable("status")}</th>
                    <th className="pb-3 font-medium">{tTable("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {reels.map((reel) => (
                    <tr key={reel.id} className="border-b border-border/70">
                      <td className="py-3">
                        {reel.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={reel.thumbnailUrl}
                            alt={reel.title}
                            className="h-14 w-10 rounded object-cover"
                          />
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3">
                        <div className="font-medium">{reel.title}</div>
                        {reel.titleAr && (
                          <div
                            className="text-xs text-muted-foreground"
                            dir="rtl"
                          >
                            {reel.titleAr}
                          </div>
                        )}
                      </td>
                      <td className="py-3">
                        {categoryLabel(reel.categoryId)}
                      </td>
                      <td className="py-3">
                        {reel.videoType === "EXPERIENCE"
                          ? t("placementExperiences")
                          : t("placementExplore")}
                      </td>
                      <td className="py-3">
                        {reel.videoUrl ? (
                          <a
                            href={reel.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-teal-700 hover:underline"
                          >
                            {t("openReel")}
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={reel.status} />
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title={tCommon("edit")}
                            onClick={() => startEditReel(reel)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title={tCommon("delete")}
                            onClick={() => setDeleteReelId(reel.id)}
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
        open={!!deleteCategoryId}
        title={t("deleteTitle")}
        description={t("deleteHint")}
        destructive
        onConfirm={removeCategory}
        onCancel={() => setDeleteCategoryId(null)}
      />
      <ConfirmDialog
        open={!!deleteReelId}
        title={t("deleteReelTitle")}
        description={t("deleteReelHint")}
        destructive
        onConfirm={removeReel}
        onCancel={() => setDeleteReelId(null)}
      />
      <ConfirmDialog
        open={disconnectOpen}
        title={t("disconnectTitle")}
        description={t("disconnectHint")}
        destructive
        onConfirm={disconnectChannel}
        onCancel={() => setDisconnectOpen(false)}
      />
    </div>
  );
}
