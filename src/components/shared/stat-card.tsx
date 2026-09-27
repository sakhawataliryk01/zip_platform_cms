"use client";

import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatNumber } from "@/lib/utils";
import { useLocale } from "next-intl";

type StatCardProps = {
  title: string;
  value: string | number;
  description?: string;
  change?: number;
  icon: LucideIcon;
  className?: string;
};

export function StatCard({
  title,
  value,
  description,
  change,
  icon: Icon,
  className,
}: StatCardProps) {
  const locale = useLocale();
  const display =
    typeof value === "number" ? formatNumber(value, locale) : value;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold tracking-tight">{display}</p>
            {(change !== undefined || description) && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {change !== undefined && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 font-medium",
                      change >= 0 ? "text-emerald-600" : "text-red-600"
                    )}
                  >
                    {change >= 0 ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    {Math.abs(change).toFixed(1)}%
                  </span>
                )}
                {description && (
                  <span className="text-muted-foreground">{description}</span>
                )}
              </div>
            )}
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
