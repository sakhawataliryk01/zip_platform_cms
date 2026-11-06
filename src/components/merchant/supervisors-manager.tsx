"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Filter, MoreVertical, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Supervisor = {
  id: string;
  name: string;
  email: string;
  role: "SYSTEM_ADMIN" | "CONTENT_MANAGER" | "VIEWER";
  active: boolean;
  joinedAt: string;
};

const STORAGE_KEY = "zidflow.merchant.supervisors";

const ROLE_LABEL: Record<Supervisor["role"], string> = {
  SYSTEM_ADMIN: "systemAdmin",
  CONTENT_MANAGER: "contentManager",
  VIEWER: "viewer",
};

function loadInitial(): Supervisor[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Supervisor[];
  } catch {
    // ignore
  }
  return [
    {
      id: "1",
      name: "dawood",
      email: "dawood@example.com",
      role: "SYSTEM_ADMIN",
      active: true,
      joinedAt: new Date().toISOString(),
    },
  ];
}

export function SupervisorsManager() {
  const t = useTranslations("merchant.supervisors");
  const tCommon = useTranslations("common");
  const [rows, setRows] = useState<Supervisor[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [query, setQuery] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "CONTENT_MANAGER" as Supervisor["role"],
  });

  useEffect(() => {
    setRows(loadInitial());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  }, [rows, hydrated]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
    );
  }, [rows, query]);

  const addSupervisor = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error(t("formRequired"));
      return;
    }
    const next: Supervisor = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      role: form.role,
      active: true,
      joinedAt: new Date().toISOString(),
    };
    setRows((prev) => [next, ...prev]);
    setForm({ name: "", email: "", role: "CONTENT_MANAGER" });
    setOpenForm(false);
    toast.success(t("added"));
  };

  const toggleActive = (id: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            {t("title")}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{t("subtitle")}</p>
        </div>
        <Button
          className="rounded-xl bg-slate-900 text-white hover:bg-slate-800"
          onClick={() => setOpenForm((v) => !v)}
        >
          <Plus className="h-4 w-4" />
          {t("addSupervisor")}
        </Button>
      </div>

      {openForm ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>{t("name")}</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("email")}</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("role")}</Label>
              <select
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    role: e.target.value as Supervisor["role"],
                  }))
                }
              >
                <option value="SYSTEM_ADMIN">{t("roles.systemAdmin")}</option>
                <option value="CONTENT_MANAGER">
                  {t("roles.contentManager")}
                </option>
                <option value="VIEWER">{t("roles.viewer")}</option>
              </select>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button onClick={addSupervisor} className="rounded-xl">
              {tCommon("save")}
            </Button>
            <Button
              variant="ghost"
              className="rounded-xl"
              onClick={() => setOpenForm(false)}
            >
              {tCommon("cancel")}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="rounded-xl ps-9"
            />
          </div>
          <Button variant="outline" className="rounded-xl">
            <Filter className="h-4 w-4" />
            {t("filter")}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-start text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-medium">{t("columns.details")}</th>
                <th className="px-4 py-3 font-medium">{t("columns.role")}</th>
                <th className="px-4 py-3 font-medium">{t("columns.status")}</th>
                <th className="px-4 py-3 font-medium">{t("columns.joined")}</th>
                <th className="px-4 py-3 font-medium">{t("columns.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-50 last:border-0"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                        {row.name.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-medium text-slate-900">{row.name}</p>
                        <p className="text-xs text-slate-500">{row.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {t(`roles.${ROLE_LABEL[row.role]}`)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => toggleActive(row.id)}
                      className={cn(
                        "relative h-6 w-11 rounded-full transition-colors",
                        row.active ? "bg-slate-900" : "bg-slate-200"
                      )}
                      aria-pressed={row.active}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
                          row.active ? "start-5" : "start-0.5"
                        )}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-4 text-slate-500">
                    {new Date(row.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                      aria-label={t("columns.actions")}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    {tCommon("empty")}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
