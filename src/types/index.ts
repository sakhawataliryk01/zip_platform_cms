export type UserRole = "ADMIN" | "MERCHANT";

export type UserStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED";

export type MerchantStatus = "ACTIVE" | "PENDING" | "SUSPENDED" | "INACTIVE";

export type ZidConnectionStatus =
  | "CONNECTED"
  | "DISCONNECTED"
  | "CONNECTION_ERROR"
  | "SYNCING";

export type AppPlatform = "ANDROID" | "IOS" | "ANDROID_IOS";

export type ApplicationStatus =
  | "NOT_STARTED"
  | "IN_DEVELOPMENT"
  | "TESTING"
  | "REVISION_REQUIRED"
  | "READY_TO_PUBLISH"
  | "PUBLISHED"
  | "REJECTED";

export type PaymentStatus = "PAID" | "PENDING" | "FAILED" | "REFUNDED";

export type DevelopmentStatus =
  | "PAYMENT_PENDING"
  | "PAID"
  | "CONFIRMED"
  | "REQUIREMENTS_PENDING"
  | "IN_DEVELOPMENT"
  | "TESTING"
  | "READY_TO_PUBLISH"
  | "PUBLISHED"
  | "CANCELLED"
  | "REVISION";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  merchantId?: string;
  businessName?: string;
};

export type Merchant = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  category: string;
  country: string;
  city: string;
  address: string;
  status: MerchantStatus;
  subscription: string;
  zidStore?: string;
  zidStoreId?: string;
  appStatus?: ApplicationStatus;
  createdAt: string;
  lastLoginAt?: string;
};

export type AppOrder = {
  id: string;
  orderNumber: string;
  merchantId: string;
  merchantName: string;
  businessName: string;
  platform: AppPlatform;
  features: string[];
  branding: {
    logo?: string;
    icon?: string;
    primaryColor: string;
    secondaryColor: string;
    splash?: string;
  };
  price: number;
  currency: string;
  paymentStatus: PaymentStatus;
  developmentStatus: DevelopmentStatus;
  developmentStep: number;
  createdAt: string;
};

export type Application = {
  id: string;
  merchantId: string;
  merchantName: string;
  name: string;
  platform: AppPlatform;
  version: string;
  status: ApplicationStatus;
  publishedAt?: string;
  lastUpdatedAt: string;
  apkUrl?: string;
  playStoreUrl?: string;
  appStoreUrl?: string;
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: string;
  imageUrl?: string;
  lastUpdatedAt: string;
};

export type StoreOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  productsCount: number;
  total: number;
  paymentStatus: PaymentStatus;
  orderStatus: string;
  orderDate: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderAt?: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  currency: string;
  billingPeriod: string;
  merchantCount: number;
  activeCount: number;
  status: string;
};

export type Payment = {
  id: string;
  paymentNumber: string;
  merchantName: string;
  invoice: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: PaymentStatus;
  createdAt: string;
};

export type ZidStore = {
  id: string;
  storeId: string;
  storeName: string;
  storeUrl: string;
  connectionStatus: ZidConnectionStatus;
  lastSyncedAt?: string;
  productsCount: number;
  ordersCount: number;
  customersCount: number;
};
