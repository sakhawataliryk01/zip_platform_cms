import { getLocale } from "next-intl/server";
import { getAdminDashboardData } from "@/lib/data/dashboard";
import { AdminDashboardView } from "@/components/dashboard/admin-dashboard-view";

export default async function AdminDashboardPage() {
  const locale = await getLocale();
  const data = await getAdminDashboardData(locale);
  return <AdminDashboardView data={data} />;
}
