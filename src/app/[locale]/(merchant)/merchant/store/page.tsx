"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  CheckCircle2,
  CircleAlert,
  Copy,
  ExternalLink,
  Link2,
  Package,
  RefreshCw,
  ShieldCheck,
  Store,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { DeskPageHeader } from "@/components/merchant/desk-page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, formatDate } from "@/lib/utils";

type StoreInfo = {
  merchantId: string;
  storeId: string;
  storeName?: string;
  storeUrl?: string;
  connectionStatus: "CONNECTED" | "DISCONNECTED" | "ERROR";
  lastSyncedAt?: string;
  productsCount?: number;
  accessTokenMasked?: string;
  hasAccessToken?: boolean;
  hasAuthorizationToken?: boolean;
  tokenExpiresAt?: string;
};

export default function MerchantStorePage() {
  const t = useTranslations("merchant.store");
  const tCommon = useTranslations("common");
  const tDesk = useTranslations("merchant.desk");
  const locale = useLocale();
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [form, setForm] = useState({
    storeId: "",
    accessToken: "",
    storeName: "",
    storeUrl: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/merchant/zid-store");
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || tCommon("error"));
        return;
      }
      setStore(data.store);
      if (data.store) {
        setForm((f) => ({
          ...f,
          storeId: data.store.storeId || "",
          storeName: data.store.storeName || "",
          storeUrl: data.store.storeUrl || "",
          accessToken: "",
        }));
      } else {
        setShowManual(true);
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
    const zid = params.get("zid");
    const zidError = params.get("zid_error");
    if (zid === "connected") {
      toast.success(t("oauthConnected"));
      load();
    } else if (zidError) {
      toast.error(t("oauthFailed", { error: zidError }));
    }
    if (zid || zidError) {
      const url = new URL(window.location.href);
      url.searchParams.delete("zid");
      url.searchParams.delete("zid_error");
      url.searchParams.delete("store_id");
      url.searchParams.delete("source");
      window.history.replaceState({}, "", url.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connected = store?.connectionStatus === "CONNECTED";
  const health = useMemo(() => {
    const checks = [
      {
        key: "storeId",
        ok: Boolean(store?.storeId),
        label: t("health.storeId"),
      },
      {
        key: "oauth",
        ok: Boolean(store?.hasAuthorizationToken),
        label: t("health.oauth"),
      },
      {
        key: "manager",
        ok: Boolean(store?.hasAccessToken),
        label: t("health.manager"),
      },
      {
        key: "url",
        ok: Boolean(store?.storeUrl),
        label: t("health.url"),
      },
    ];
    const score = checks.filter((c) => c.ok).length;
    return { checks, score, total: checks.length };
  }, [store, t]);

  const save = async () => {
    if (!form.storeId.trim()) {
      toast.error(t("storeIdRequired"));
      return;
    }
    if (!form.accessToken.trim() && !store?.hasAccessToken) {
      toast.error(t("accessTokenRequired"));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/merchant/zid-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: form.storeId.trim(),
          accessToken: form.accessToken.trim() || "__KEEP_EXISTING__",
          storeName: form.storeName.trim() || undefined,
          storeUrl: form.storeUrl.trim() || undefined,
          keepExistingToken: !form.accessToken.trim() && store?.hasAccessToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || tCommon("error"));
        return;
      }
      setStore(data.store);
      setForm((f) => ({ ...f, accessToken: "" }));
      toast.success(tCommon("success"));
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setSaving(false);
    }
  };

  const copyStoreId = async () => {
    if (!store?.storeId) return;
    try {
      await navigator.clipboard.writeText(store.storeId);
      toast.success(t("copiedStoreId"));
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
        subtitle={t("subtitleRich")}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-[#d9d3c5] bg-white"
              onClick={() => load()}
            >
              <RefreshCw className="me-1.5 h-4 w-4" />
              {t("refreshStatus")}
            </Button>
            <Button
              type="button"
              className="bg-desk-green text-white hover:bg-[#346940]"
              onClick={() => {
                window.location.href = "/api/zid/auth";
              }}
            >
              <Link2 className="me-1.5 h-4 w-4" />
              {store?.hasAccessToken ? t("reconnectOAuth") : t("connectOAuth")}
            </Button>
          </div>
        }
      />

      {/* Connection hero */}
      <section
        className={cn(
          "overflow-hidden rounded-[1.6rem] border shadow-[0_1px_0_rgba(27,43,33,0.04)]",
          connected
            ? "border-emerald-200/80 bg-[linear-gradient(135deg,#f3faf4_0%,#ffffff_45%,#fbfaf6_100%)]"
            : "border-amber-200/80 bg-[linear-gradient(135deg,#fff8ef_0%,#ffffff_50%,#fbfaf6_100%)]"
        )}
      >
        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start gap-3">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl",
                  connected ? "bg-desk-green-soft text-desk-green" : "bg-amber-100 text-amber-800"
                )}
              >
                <Store className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold text-desk-ink">
                    {store?.storeName || t("untitledStore")}
                  </h2>
                  {store ? (
                    <StatusBadge status={store.connectionStatus} />
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900">
                      {t("notConnectedBadge")}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-desk-muted">
                  {connected ? t("connectedHint") : t("notConnectedHint")}
                </p>
                {store?.storeUrl ? (
                  <a
                    href={store.storeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-desk-green hover:underline"
                  >
                    {store.storeUrl}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : null}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Stat
                icon={<Package className="h-4 w-4" />}
                label={t("productsCount")}
                value={
                  store?.productsCount != null
                    ? String(store.productsCount)
                    : "—"
                }
              />
              <Stat
                icon={<RefreshCw className="h-4 w-4" />}
                label={t("lastSync")}
                value={
                  store?.lastSyncedAt
                    ? formatDate(store.lastSyncedAt, locale)
                    : "—"
                }
              />
              <Stat
                icon={<ShieldCheck className="h-4 w-4" />}
                label={t("healthScore")}
                value={`${health.score}/${health.total}`}
              />
            </div>
          </div>

          <div className="border-t border-[#e7e2d6]/70 bg-white/70 p-5 sm:p-6 lg:border-s lg:border-t-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-desk-muted">
              {t("healthTitle")}
            </p>
            <ul className="mt-3 space-y-2.5">
              {health.checks.map((check) => (
                <li key={check.key} className="flex items-center gap-2 text-sm">
                  {check.ok ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-desk-green" />
                  ) : (
                    <CircleAlert className="h-4 w-4 shrink-0 text-amber-600" />
                  )}
                  <span
                    className={cn(
                      check.ok ? "text-desk-ink" : "text-desk-muted"
                    )}
                  >
                    {check.label}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-desk-muted">
              {t("healthHint")}
            </p>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <QuickAction
          title={t("actions.openStore")}
          desc={t("actions.openStoreDesc")}
          disabled={!store?.storeUrl}
          href={store?.storeUrl}
          external
        />
        <QuickAction
          title={t("actions.products")}
          desc={t("actions.productsDesc")}
          href="/merchant/products"
        />
        <QuickAction
          title={t("actions.appStudio")}
          desc={t("actions.appStudioDesc")}
          href="/merchant/app"
        />
        <button
          type="button"
          onClick={copyStoreId}
          disabled={!store?.storeId}
          className="rounded-[1.25rem] border border-[#e7e2d6] bg-white p-4 text-start shadow-[0_1px_0_rgba(27,43,33,0.03)] transition hover:border-desk-green/40 disabled:opacity-50"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-desk-ink">
            <Copy className="h-4 w-4 text-desk-green" />
            {t("actions.copyId")}
          </div>
          <p className="mt-1 text-xs text-desk-muted">
            {store?.storeId || t("actions.copyIdEmpty")}
          </p>
        </button>
      </section>

      {/* Connection details */}
      <section className="rounded-[1.6rem] border border-[#e7e2d6] bg-white p-5 shadow-[0_1px_0_rgba(27,43,33,0.03)] sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-desk-ink">
              {t("detailsTitle")}
            </h3>
            <p className="mt-1 text-sm text-desk-muted">{t("detailsHint")}</p>
          </div>
        </div>

        {store ? (
          <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Detail label={t("storeName")} value={store.storeName || "—"} />
            <Detail label={t("storeId")} value={store.storeId} mono />
            <Detail
              label={t("connectionStatus")}
              value={<StatusBadge status={store.connectionStatus} />}
            />
            <Detail
              label={t("accessToken")}
              value={store.accessTokenMasked || "—"}
              mono
            />
            <Detail
              label={t("authorizationStatus")}
              value={
                store.hasAuthorizationToken
                  ? t("authorizationPresent")
                  : t("authorizationMissing")
              }
            />
            <Detail
              label={t("tokenExpiry")}
              value={
                store.tokenExpiresAt
                  ? formatDate(store.tokenExpiresAt, locale)
                  : "—"
              }
            />
          </dl>
        ) : (
          <p className="mt-4 text-sm text-desk-muted">{t("notConnected")}</p>
        )}
      </section>

      {/* OAuth primary */}
      <section className="rounded-[1.6rem] border border-[#e7e2d6] bg-[radial-gradient(ellipse_at_top_left,#e7f0e8_0%,#ffffff_55%)] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <h3 className="text-base font-semibold text-desk-ink">
              {t("oauthTitle")}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-desk-muted">
              {t("oauthHint")}
            </p>
          </div>
          <Button
            type="button"
            className="shrink-0 bg-desk-green text-white hover:bg-[#346940]"
            onClick={() => {
              window.location.href = "/api/zid/auth";
            }}
          >
            {store?.hasAccessToken ? t("reconnectOAuth") : t("connectOAuth")}
          </Button>
        </div>
      </section>

      {/* Manual fallback */}
      <section className="rounded-[1.6rem] border border-[#e7e2d6] bg-white p-5 shadow-[0_1px_0_rgba(27,43,33,0.03)] sm:p-6">
        <button
          type="button"
          onClick={() => setShowManual((v) => !v)}
          className="flex w-full items-center justify-between gap-3 text-start"
        >
          <div>
            <h3 className="text-base font-semibold text-desk-ink">
              {t("credentialsTitle")}
            </h3>
            <p className="mt-1 text-sm text-desk-muted">{t("manualHint")}</p>
          </div>
          <span className="rounded-full border border-[#e7e2d6] px-3 py-1 text-xs font-medium text-desk-muted">
            {showManual ? t("hideManual") : t("showManual")}
          </span>
        </button>

        {showManual ? (
          <div className="mt-5 space-y-4 border-t border-[#eee9dc] pt-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="storeId">{t("storeId")}</Label>
                <Input
                  id="storeId"
                  value={form.storeId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, storeId: e.target.value }))
                  }
                  placeholder="3075120"
                  className="bg-[#fbfaf6]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeName">{t("storeName")}</Label>
                <Input
                  id="storeName"
                  value={form.storeName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, storeName: e.target.value }))
                  }
                  className="bg-[#fbfaf6]"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="accessToken">{t("accessToken")}</Label>
                <Input
                  id="accessToken"
                  type="password"
                  value={form.accessToken}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, accessToken: e.target.value }))
                  }
                  placeholder={
                    store?.hasAccessToken
                      ? t("accessTokenKeepHint")
                      : t("accessTokenPlaceholder")
                  }
                  className="bg-[#fbfaf6]"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="storeUrl">{t("storeUrl")}</Label>
                <Input
                  id="storeUrl"
                  value={form.storeUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, storeUrl: e.target.value }))
                  }
                  placeholder="https://your-store.zid.store"
                  className="bg-[#fbfaf6]"
                />
              </div>
            </div>
            <Button
              onClick={save}
              disabled={saving}
              className="bg-desk-ink text-white hover:bg-[#24352c]"
            >
              {saving ? tCommon("loading") : t("saveCredentials")}
            </Button>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e7e2d6]/80 bg-white/80 px-3.5 py-3">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-desk-muted">
        {icon}
        {label}
      </div>
      <p className="mt-1.5 text-lg font-semibold text-desk-ink">{value}</p>
    </div>
  );
}

function Detail({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#eee9dc] bg-[#fbfaf6] px-3.5 py-3">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-desk-muted">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1.5 text-sm font-medium text-desk-ink break-all",
          mono && "font-mono text-[13px]"
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function QuickAction({
  title,
  desc,
  href,
  external,
  disabled,
}: {
  title: string;
  desc: string;
  href?: string;
  external?: boolean;
  disabled?: boolean;
}) {
  const className =
    "rounded-[1.25rem] border border-[#e7e2d6] bg-white p-4 text-start shadow-[0_1px_0_rgba(27,43,33,0.03)] transition hover:border-desk-green/40 disabled:opacity-50";

  if (disabled || !href) {
    return (
      <div className={cn(className, "opacity-50")}>
        <p className="text-sm font-semibold text-desk-ink">{title}</p>
        <p className="mt-1 text-xs text-desk-muted">{desc}</p>
      </div>
    );
  }

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={className}
      >
        <p className="text-sm font-semibold text-desk-ink">{title}</p>
        <p className="mt-1 text-xs text-desk-muted">{desc}</p>
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      <p className="text-sm font-semibold text-desk-ink">{title}</p>
      <p className="mt-1 text-xs text-desk-muted">{desc}</p>
    </Link>
  );
}
