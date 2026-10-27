import { getTranslations, setRequestLocale } from "next-intl/server";
import { PublicPageShell } from "@/components/public/public-page-shell";
import { PublicPrivacyPage } from "@/components/public/public-privacy-page";

type Props = { params: Promise<{ locale: string }> };

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("publicPages");

  return (
    <PublicPageShell title={t("privacy.navTitle")} loginLabel={t("login")}>
      <PublicPrivacyPage />
    </PublicPageShell>
  );
}
