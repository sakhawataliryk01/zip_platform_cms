"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("language");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (next: "en" | "ar") => {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-border bg-card p-0.5 text-sm",
        className
      )}
      role="group"
      aria-label={t("switchLanguage")}
    >
      <button
        type="button"
        onClick={() => switchLocale("en")}
        className={cn(
          "rounded-md px-2.5 py-1.5 transition-colors",
          locale === "en"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {t("english")}
      </button>
      <button
        type="button"
        onClick={() => switchLocale("ar")}
        className={cn(
          "rounded-md px-2.5 py-1.5 transition-colors",
          locale === "ar"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {t("arabic")}
      </button>
    </div>
  );
}
