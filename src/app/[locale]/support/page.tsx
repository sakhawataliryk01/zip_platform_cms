import { getTranslations, setRequestLocale } from "next-intl/server";
import { PublicPageShell } from "@/components/public/public-page-shell";
import { PublicSupportPage } from "@/components/public/public-support-page";

type Props = { params: Promise<{ locale: string }> };

export default async function SupportPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("publicPages");

  return (
    <PublicPageShell title={t("support.navTitle")} loginLabel={t("login")}>
      <PublicSupportPage />
    </PublicPageShell>
  );
}
