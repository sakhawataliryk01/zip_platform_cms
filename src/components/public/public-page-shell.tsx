import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/shared/language-switcher";

type Props = {
  title: string;
  children: React.ReactNode;
  loginLabel: string;
};

export function PublicPageShell({ title, children, loginLabel }: Props) {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50 via-background to-background">
      <header className="border-b border-border/70 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-foreground">
              ZidFlow
            </p>
            <p className="truncate text-xs text-muted-foreground">{title}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <LanguageSwitcher />
            <Link
              href="/login"
              className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
            >
              {loginLabel}
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-10">{children}</main>
    </div>
  );
}
