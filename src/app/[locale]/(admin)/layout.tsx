import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { adminNavItems, serializeUser } from "@/lib/nav";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") {
    redirect("/en/login");
  }

  const t = await getTranslations("nav.admin");

  return (
    <DashboardLayout
      user={serializeUser(user)}
      navItems={adminNavItems}
      title={t("dashboard")}
      navNamespace="nav.admin"
    >
      {children}
    </DashboardLayout>
  );
}
