"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type TimelineProps = {
  currentStep: number;
  totalSteps?: number;
};

export function Timeline({ currentStep, totalSteps = 9 }: TimelineProps) {
  const t = useTranslations("timeline");
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const completed = step < currentStep;
        const current = step === currentStep;
        return (
          <li key={step} className="relative flex gap-3 pb-6 last:pb-0">
            {index < steps.length - 1 && (
              <span
                className={cn(
                  "absolute start-[15px] top-8 h-[calc(100%-1.5rem)] w-px",
                  completed ? "bg-primary" : "bg-border"
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                completed &&
                  "border-primary bg-primary text-primary-foreground",
                current && "border-primary bg-accent text-accent-foreground",
                !completed &&
                  !current &&
                  "border-border bg-card text-muted-foreground"
              )}
            >
              {completed ? <Check className="h-4 w-4" /> : step}
            </span>
            <div className="pt-1.5">
              <p
                className={cn(
                  "text-sm font-medium",
                  current ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {t(String(step) as "1")}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
