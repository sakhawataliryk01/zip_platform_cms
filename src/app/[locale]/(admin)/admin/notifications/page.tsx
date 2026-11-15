"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { LoadingState } from "@/components/shared/empty-state";
import { LiveAppPhone } from "@/components/merchant/live-app-phone";
import { mockMerchants } from "@/lib/mock/data";
import { cn, formatDate } from "@/lib/utils";
import {
  DEFAULT_PREVIEW_CONFIG,
  type AppPreviewConfig,
} from "@/lib/app-preview-config";
import type {
  AdminNotificationItem,
  DesignSummary,
} from "@/lib/data/admin-notifications-shared";

function previewForNotification(
  n: AdminNotificationItem
): AppPreviewConfig | null {
  if (n.preview && typeof n.preview === "object") {
    return { ...DEFAULT_PREVIEW_CONFIG, ...n.preview };
  }
  if (n.designSummary) {
    return previewFromSummary(n.designSummary);
  }
  return null;
}

function previewFromSummary(summary: DesignSummary): AppPreviewConfig {
  return {
    ...DEFAULT_PREVIEW_CONFIG,
    storeNameEn: summary.storeNameEn || DEFAULT_PREVIEW_CONFIG.storeNameEn,
    storeNameAr: summary.storeNameAr || DEFAULT_PREVIEW_CONFIG.storeNameAr,
    readyTheme: summary.readyTheme || DEFAULT_PREVIEW_CONFIG.readyTheme,
    primaryColor: summary.primaryColor || DEFAULT_PREVIEW_CONFIG.primaryColor,
    secondaryColor:
      summary.secondaryColor || DEFAULT_PREVIEW_CONFIG.secondaryColor,
    typeface: summary.typeface || DEFAULT_PREVIEW_CONFIG.typeface,
    headerStyle: summary.headerStyle || DEFAULT_PREVIEW_CONFIG.headerStyle,
    bottomBarStyle:
      summary.bottomBarStyle || DEFAULT_PREVIEW_CONFIG.bottomBarStyle,
    bannerLayoutId:
      summary.bannerLayoutId || DEFAULT_PREVIEW_CONFIG.bannerLayoutId,
    productCardLayoutId:
      summary.productCardLayoutId || DEFAULT_PREVIEW_CONFIG.productCardLayoutId,
    categoryLayoutId:
      summary.categoryLayoutId || DEFAULT_PREVIEW_CONFIG.categoryLayoutId,
  };
}

export default function AdminNotificationsPage() {
  const t = useTranslations("admin.notifications");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const isAr = locale === "ar";
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>(
    []
  );
  const [live, setLive] = useState(true);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await fetch("/api/admin/notifications", {
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok) {
          if (!silent) toast.error(data.error || tCommon("error"));
          return;
        }
        setNotifications(data.notifications || []);
      } catch {
        if (!silent) toast.error(tCommon("error"));
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [tCommon]
  );

  useEffect(() => {
    load(false);
  }, [load]);

  // Live poll so admin sees merchant design changes as they happen
  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => {
      load(true);
    }, 4000);
    return () => window.clearInterval(id);
  }, [live, load]);

  const markRead = async (id: string) => {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) return;
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      // ignore
    }
  };

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(tCommon("success"));
    setTitle("");
    setMessage("");
  };

  const designRequests = notifications.filter(
    (n) => n.type === "DESIGN_REQUEST"
  );
  const other = notifications.filter((n) => n.type !== "DESIGN_REQUEST");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle>{t("designRequests")}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("designRequestsHint")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                className="rounded border-border"
                checked={live}
                onChange={(e) => setLive(e.target.checked)}
              />
              {t("livePreview")}
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => load(false)}
            >
              {tCommon("refresh")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <LoadingState label={tCommon("loading")} />
          ) : designRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noDesignRequests")}</p>
          ) : (
            designRequests.map((n) => {
              const preview = previewForNotification(n);
              const presetKey = n.presetKey || n.designSummary?.presetKey;
              return (
                <article
                  key={n.id}
                  className={cn(
                    "rounded-xl border p-4",
                    n.read
                      ? "border-border bg-card"
                      : "border-emerald-200 bg-emerald-50/60"
                  )}
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {n.title}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {n.businessName || n.merchantName}
                            {n.merchantId ? ` · ${n.merchantId}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
                            {t("designBadge")}
                          </span>
                          {live ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-800">
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
                              {t("live")}
                            </span>
                          ) : null}
                          <span className="text-xs text-muted-foreground">
                            {formatDate(n.createdAt, locale)}
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {n.message}
                      </p>
                      {n.designSummary ? (
                        <div className="mt-3 grid gap-2 rounded-lg border border-border/70 bg-white/80 p-3 text-xs sm:grid-cols-2">
                          <Detail
                            label={t("fields.preset")}
                            value={`Like ${n.designSummary.presetKey}`}
                          />
                          <Detail
                            label={t("fields.theme")}
                            value={n.designSummary.readyTheme}
                          />
                          <Detail
                            label={t("fields.colors")}
                            value={`${n.designSummary.primaryColor} / ${n.designSummary.secondaryColor}`}
                          />
                          <Detail
                            label={t("fields.typeface")}
                            value={n.designSummary.typeface}
                          />
                          <Detail
                            label={t("fields.banner")}
                            value={`#${n.designSummary.bannerLayoutId}`}
                          />
                          <Detail
                            label={t("fields.productCard")}
                            value={`#${n.designSummary.productCardLayoutId}`}
                          />
                          <Detail
                            label={t("fields.category")}
                            value={`#${n.designSummary.categoryLayoutId}`}
                          />
                          <Detail
                            label={t("fields.header")}
                            value={n.designSummary.headerStyle}
                          />
                        </div>
                      ) : null}
                      {!n.read ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="mt-3"
                          onClick={() => markRead(n.id)}
                        >
                          {t("markRead")}
                        </Button>
                      ) : null}
                    </div>

                    {preview ? (
                      <div className="mx-auto shrink-0 lg:mx-0">
                        <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {t("customerPreview")}
                        </p>
                        <LiveAppPhone
                          key={`${n.id}-${n.createdAt}-${presetKey}`}
                          size="sm"
                          isAr={isAr}
                          interactive
                          showTapHint={false}
                          previewOverride={preview}
                          presetKey={presetKey}
                          storeName={
                            isAr
                              ? preview.storeNameAr
                              : preview.storeNameEn
                          }
                        />
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("create")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={send} className="space-y-4">
              <div className="space-y-2">
                <Label>{t("titleField")}</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t("message")}</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t("recipient")}</Label>
                <Select defaultValue="all">
                  <option value="all">{t("allMerchants")}</option>
                  {mockMerchants.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.businessName}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("type")}</Label>
                <Select defaultValue="INFO">
                  <option value="INFO">Info</option>
                  <option value="SUCCESS">Success</option>
                  <option value="WARNING">Warning</option>
                  <option value="APP_ORDER">App Order</option>
                  <option value="PAYMENT">Payment</option>
                </Select>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded border-border" />
                {t("scheduleLater")}
              </label>
              <Button type="submit">{t("send")}</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("history")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {other.map((n) => (
              <div key={n.id} className="rounded-lg border border-border p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{n.title}</p>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(n.createdAt, locale)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 font-medium text-foreground">{value}</p>
    </div>
  );
}
