"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Eye, Pencil, Ban, CheckCircle, Trash2, Plus } from "lucide-react";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { LoadingState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { mockPlans } from "@/lib/mock/data";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { Merchant } from "@/types";

export default function MerchantsPage() {
  const t = useTranslations("admin.merchants");
  const tTable = useTranslations("table");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [plan, setPlan] = useState("ALL");
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<{
    type: "suspend" | "activate" | "delete";
    id: string;
  } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/merchants");
      const data = await res.json();
      if (res.ok) {
        setMerchants(data.merchants || []);
      } else {
        toast.error(data.error || tCommon("error"));
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

  const filtered = useMemo(() => {
    return merchants.filter((m) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.businessName.toLowerCase().includes(q);
      const matchesStatus = status === "ALL" || m.status === status;
      const matchesPlan = plan === "ALL" || m.subscription === plan;
      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [merchants, search, status, plan]);

  const runAction = async () => {
    if (!confirm) return;

    try {
      if (confirm.type === "delete") {
        const res = await fetch(`/api/admin/merchants?id=${confirm.id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || tCommon("error"));
          return;
        }
      } else {
        const nextStatus =
          confirm.type === "suspend" ? "SUSPENDED" : "ACTIVE";
        const res = await fetch("/api/admin/merchants", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: confirm.id, status: nextStatus }),
        });
        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || tCommon("error"));
          return;
        }
      }
      toast.success(tCommon("success"));
      setConfirm(null);
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
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>{t("title")}</CardTitle>
          <Link href="/admin/merchants/create">
            <Button>
              <Plus className="h-4 w-4" />
              {t("addMerchant")}
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={t("searchPlaceholder")}
            />
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="ALL">{t("filterStatus")}</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="INACTIVE">Inactive</option>
            </Select>
            <Select value={plan} onChange={(e) => setPlan(e.target.value)}>
              <option value="ALL">{t("filterSubscription")}</option>
              {mockPlans.map((p) => (
                <option key={p.id} value={p.name}>
                  {locale === "ar" ? p.nameAr : p.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b text-start text-muted-foreground">
                  <th className="pb-3 font-medium">{tTable("merchant")}</th>
                  <th className="pb-3 font-medium">{tTable("business")}</th>
                  <th className="pb-3 font-medium">{tTable("email")}</th>
                  <th className="pb-3 font-medium">{tTable("phone")}</th>
                  <th className="pb-3 font-medium">{tTable("zidStore")}</th>
                  <th className="pb-3 font-medium">{tTable("subscription")}</th>
                  <th className="pb-3 font-medium">{tTable("status")}</th>
                  <th className="pb-3 font-medium">{tTable("createdDate")}</th>
                  <th className="pb-3 font-medium">{tTable("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} className="border-b border-border/70">
                    <td className="py-3 font-medium">{m.name}</td>
                    <td className="py-3">{m.businessName}</td>
                    <td className="py-3">{m.email}</td>
                    <td className="py-3">{m.phone}</td>
                    <td className="py-3">{m.zidStore || "—"}</td>
                    <td className="py-3">{m.subscription || "—"}</td>
                    <td className="py-3">
                      <StatusBadge status={m.status} />
                    </td>
                    <td className="py-3">{formatDate(m.createdAt, locale)}</td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <Link href={`/admin/merchants/${m.id}`}>
                          <Button variant="ghost" size="icon" title={tCommon("view")}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/merchants/${m.id}`}>
                          <Button variant="ghost" size="icon" title={tCommon("edit")}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        {m.status === "ACTIVE" ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setConfirm({ type: "suspend", id: m.id })
                            }
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setConfirm({ type: "activate", id: m.id })
                            }
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setConfirm({ type: "delete", id: m.id })
                          }
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!confirm}
        title={
          confirm?.type === "delete"
            ? t("confirmDelete")
            : confirm?.type === "suspend"
              ? t("confirmSuspend")
              : t("confirmActivate")
        }
        destructive={confirm?.type === "delete" || confirm?.type === "suspend"}
        onCancel={() => setConfirm(null)}
        onConfirm={runAction}
      />
    </div>
  );
}
