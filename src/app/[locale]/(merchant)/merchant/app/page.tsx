import { getSession } from "@/lib/auth/session";
import { AppStudioOverview } from "@/components/merchant/app-studio-overview";

export default async function MerchantAppStudioPage() {
  const user = await getSession();
  return (
    <AppStudioOverview
      storeName={user?.businessName || "Al Noor Store"}
    />
  );
}
