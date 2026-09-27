"use client";

import { useLocale, useTranslations } from "next-intl";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockApplications } from "@/lib/mock/data";
import { formatDate } from "@/lib/utils";

export default function AdminApplicationsPage() {
  const t = useTranslations("admin.applications");
  const tTable = useTranslations("table");
  const locale = useLocale();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b text-start text-muted-foreground">
              <th className="pb-3 font-medium">{tTable("application")}</th>
              <th className="pb-3 font-medium">{tTable("merchant")}</th>
              <th className="pb-3 font-medium">{tTable("platform")}</th>
              <th className="pb-3 font-medium">{tTable("version")}</th>
              <th className="pb-3 font-medium">{tTable("status")}</th>
              <th className="pb-3 font-medium">{tTable("lastUpdated")}</th>
              <th className="pb-3 font-medium">{t("publishedDate")}</th>
            </tr>
          </thead>
          <tbody>
            {mockApplications.map((app) => (
              <tr key={app.id} className="border-b border-border/70">
                <td className="py-3 font-medium">{app.name}</td>
                <td className="py-3">{app.merchantName}</td>
                <td className="py-3">{app.platform.replace("_", " + ")}</td>
                <td className="py-3">{app.version}</td>
                <td className="py-3">
                  <StatusBadge status={app.status} />
                </td>
                <td className="py-3">
                  {formatDate(app.lastUpdatedAt, locale)}
                </td>
                <td className="py-3">
                  {app.publishedAt ? formatDate(app.publishedAt, locale) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
