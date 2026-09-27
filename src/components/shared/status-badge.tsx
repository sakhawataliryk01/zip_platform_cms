"use client";

import { useTranslations } from "next-intl";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const t = useTranslations("status");
  const label = t.has(status as "ACTIVE") ? t(status as "ACTIVE") : status;

  return <Badge variant={statusBadgeVariant(status)}>{label}</Badge>;
}
