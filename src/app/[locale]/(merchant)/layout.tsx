import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { merchantNavItems, serializeUser } from "@/lib/nav";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user || user.role !== "MERCHANT") {
    redirect("/en/login");
  }

  const t = await getTranslations("nav.merchant");

  return (
    <DashboardLayout
      user={serializeUser(user)}
      navItems={merchantNavItems}
      title={t("dashboard")}
      navNamespace="nav.merchant"
    >
      {children}
    </DashboardLayout>
  );
}
