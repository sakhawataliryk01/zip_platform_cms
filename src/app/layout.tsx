import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zid App Platform",
  description: "SaaS Merchant & Mobile App Management Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
