"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { mockAdminNotifications, mockMerchants } from "@/lib/mock/data";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminNotificationsPage() {
  const t = useTranslations("admin.notifications");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(tCommon("success"));
    setTitle("");
    setMessage("");
  };

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t("create")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={send} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("titleField")}</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
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
          {mockAdminNotifications.map((n) => (
            <div
              key={n.id}
              className="rounded-lg border border-border p-3"
            >
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
  );
}
