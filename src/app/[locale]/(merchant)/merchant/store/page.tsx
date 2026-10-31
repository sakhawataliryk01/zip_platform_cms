"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

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
  const locale = useLocale();
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
          // leave token blank — user pastes again only when rotating
          accessToken: "",
        }));
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
      // If token blank but already connected, keep existing by re-fetching is not possible
      // (masked). Require paste when updating; if already has token and blank, skip update of token
      // by calling with a sentinel — better: require token on every save for simplicity when blank
      // use a dedicated "keep" path: if blank and hasAccessToken, we need the server to keep it.
      // Current API requires accessToken — so if blank, tell user to paste, OR enhance API.
      // Enhance: if accessToken empty and has existing, keep existing on server.
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

  if (loading) return <LoadingState label={tCommon("loading")} />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {store ? (
            <dl className="grid gap-4 sm:grid-cols-2">
              <Item label={t("storeName")} value={store.storeName || "—"} />
              <Item label={t("storeUrl")} value={store.storeUrl || "—"} />
              <Item label={t("storeId")} value={store.storeId} />
              <Item
                label={t("connectionStatus")}
                value={<StatusBadge status={store.connectionStatus} />}
              />
              <Item
                label={t("lastSync")}
                value={
                  store.lastSyncedAt
                    ? formatDate(store.lastSyncedAt, locale)
                    : "—"
                }
              />
              <Item
                label={t("accessToken")}
                value={store.accessTokenMasked || "—"}
              />
              <Item
                label={t("authorizationStatus")}
                value={
                  store.hasAuthorizationToken
                    ? t("authorizationPresent")
                    : t("authorizationMissing")
                }
              />
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">{t("notConnected")}</p>
          )}

          <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">{t("oauthTitle")}</h3>
              <p className="text-xs text-muted-foreground">{t("oauthHint")}</p>
            </div>
            <Button
              type="button"
              onClick={() => {
                window.location.href = "/api/zid/auth";
              }}
            >
              {store?.hasAccessToken ? t("reconnectOAuth") : t("connectOAuth")}
            </Button>
          </div>

          <div className="space-y-4 border-t pt-6">
            <h3 className="text-sm font-semibold">{t("credentialsTitle")}</h3>
            <p className="text-xs text-muted-foreground">{t("manualHint")}</p>
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
                />
              </div>
            </div>
            <Button onClick={save} disabled={saving}>
              {saving ? tCommon("loading") : t("saveCredentials")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Item({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium break-all">{value}</dd>
    </div>
  );
}
