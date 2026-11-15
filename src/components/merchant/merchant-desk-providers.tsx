"use client";

import { AppStyleProvider } from "@/components/merchant/app-style-provider";

export function MerchantDeskProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppStyleProvider>{children}</AppStyleProvider>;
}
