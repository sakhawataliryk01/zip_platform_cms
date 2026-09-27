import { getSession } from "@/lib/auth/session";
import { getMerchantCmsDashboard } from "@/lib/data/merchant-cms";
import { MerchantDashboardView } from "@/components/dashboard/merchant-dashboard-view";

export default async function MerchantDashboardPage() {
  const user = await getSession();
  const data = await getMerchantCmsDashboard(
    user?.merchantId,
    user?.name || "Admin"
  );

  return <MerchantDashboardView data={data} />;
}
