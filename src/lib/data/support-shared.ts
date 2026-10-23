export const SUPPORT_CATEGORIES = [
  "ACCOUNT_LOGIN",
  "ZID_STORE",
  "API_OAUTH",
  "ORDERS_PRODUCTS",
  "BILLING",
  "TECHNICAL",
  "GENERAL",
] as const;

export type SupportCategory = (typeof SUPPORT_CATEGORIES)[number];

export type SupportTicket = {
  id: string;
  merchantId?: string;
  userId?: string;
  fullName: string;
  email: string;
  subject: string;
  category: SupportCategory;
  message: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  createdAt: string;
};

export function isSupportCategory(value: string): value is SupportCategory {
  return (SUPPORT_CATEGORIES as readonly string[]).includes(value);
}
