import { createClient } from "@supabase/supabase-js";
import type {
  AppOrder,
  Application,
  Customer,
  Merchant,
  Payment,
  Product,
  StoreOrder,
} from "@/types";
import {
  mockAppOrders,
  mockApplications,
  mockCustomers,
  mockMerchants,
  mockPayments,
  mockProducts,
  mockStoreOrders,
  mockZidStore,
} from "@/lib/mock/data";

export type AdminDashboardData = {
  stats: {
    totalMerchants: number;
    activeMerchants: number;
    pendingMerchants: number;
    totalAppOrders: number;
    appsInDevelopment: number;
    publishedApps: number;
    totalRevenue: number;
    changes: {
      totalMerchants: number;
      activeMerchants: number;
      pendingMerchants: number;
      totalAppOrders: number;
      appsInDevelopment: number;
      publishedApps: number;
      totalRevenue: number;
    };
  };
  chart: { label: string; revenue: number; orders: number }[];
  recentMerchants: Merchant[];
  recentAppOrders: AppOrder[];
  source: "supabase" | "local";
};

export type MerchantDashboardData = {
  stats: {
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    revenue: number;
    changes: {
      totalOrders: number;
      totalProducts: number;
      totalCustomers: number;
      revenue: number;
    };
  };
  chart: { label: string; sales: number; orders: number; revenue: number }[];
  source: "supabase" | "local";
};

function supabaseBrowserSafe() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

function pctChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function dayLabels(locale: string) {
  const en = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const ar = ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"];
  return locale === "ar" ? ar : en;
}

function buildAdminFromLocal(locale = "en"): AdminDashboardData {
  const merchants = mockMerchants;
  const orders = mockAppOrders;
  const apps = mockApplications;
  const payments = mockPayments;

  const totalMerchants = merchants.length;
  const activeMerchants = merchants.filter((m) => m.status === "ACTIVE").length;
  const pendingMerchants = merchants.filter((m) => m.status === "PENDING").length;
  const totalAppOrders = orders.length;
  const appsInDevelopment = apps.filter((a) => a.status === "IN_DEVELOPMENT").length;
  const publishedApps = apps.filter((a) => a.status === "PUBLISHED").length;
  const totalRevenue = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);

  // Approximate previous-period baselines from entity mix for % change
  const prev = {
    totalMerchants: Math.max(1, totalMerchants - 1),
    activeMerchants: Math.max(1, activeMerchants - 1),
    pendingMerchants: Math.max(1, pendingMerchants + 1),
    totalAppOrders: Math.max(1, totalAppOrders - 1),
    appsInDevelopment: Math.max(0, appsInDevelopment),
    publishedApps: Math.max(0, publishedApps - 1),
    totalRevenue: Math.max(1, totalRevenue - 2500),
  };

  const labels = dayLabels(locale);
  const paid = payments.filter((p) => p.status === "PAID");
  const chart = labels.map((label, i) => {
    const payment = paid[i % paid.length];
    const orderSlice = orders.filter((_, idx) => idx % 7 === i);
    return {
      label,
      revenue: payment ? Math.round(payment.amount / (i + 2)) + 800 * ((i % 3) + 1) : 1000,
      orders: orderSlice.length || (i % 3) + 1,
    };
  });

  return {
    stats: {
      totalMerchants,
      activeMerchants,
      pendingMerchants,
      totalAppOrders,
      appsInDevelopment,
      publishedApps,
      totalRevenue,
      changes: {
        totalMerchants: pctChange(totalMerchants, prev.totalMerchants),
        activeMerchants: pctChange(activeMerchants, prev.activeMerchants),
        pendingMerchants: pctChange(pendingMerchants, prev.pendingMerchants),
        totalAppOrders: pctChange(totalAppOrders, prev.totalAppOrders),
        appsInDevelopment: pctChange(appsInDevelopment, prev.appsInDevelopment || 1),
        publishedApps: pctChange(publishedApps, prev.publishedApps || 1),
        totalRevenue: pctChange(totalRevenue, prev.totalRevenue),
      },
    },
    chart,
    recentMerchants: [...merchants].sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
    ),
    recentAppOrders: [...orders].sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
    ),
    source: "local",
  };
}

function buildMerchantFromLocal(locale = "en"): MerchantDashboardData {
  const orders = mockStoreOrders;
  const products = mockProducts;
  const customers = mockCustomers;

  // Prefer Zid store sync totals so dashboard matches My Store
  const totalOrders = mockZidStore.ordersCount || orders.length;
  const totalProducts = mockZidStore.productsCount || products.length;
  const totalCustomers = mockZidStore.customersCount || customers.length;

  const sampleTotal = orders.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue =
    orders.length > 0 ? sampleTotal / orders.length : 0;
  const revenue =
    avgOrderValue > 0
      ? Math.round(avgOrderValue * totalOrders)
      : sampleTotal;

  const labels = dayLabels(locale);
  const chart = labels.map((label, i) => {
    const dayOrders = orders.filter((_, idx) => idx % orders.length === i % Math.max(orders.length, 1));
    const dayRevenue =
      dayOrders.reduce((s, o) => s + o.total, 0) ||
      Math.round(avgOrderValue * (12 + i * 2));
    return {
      label,
      sales: dayRevenue,
      orders: dayOrders.length || 12 + i * 2,
      revenue: dayRevenue,
    };
  });

  return {
    stats: {
      totalOrders,
      totalProducts,
      totalCustomers,
      revenue,
      changes: {
        totalOrders: pctChange(totalOrders, totalOrders - 75),
        totalProducts: pctChange(totalProducts, totalProducts - 7),
        totalCustomers: pctChange(totalCustomers, totalCustomers - 38),
        revenue: pctChange(revenue, Math.max(1, revenue - 6200)),
      },
    },
    chart,
    source: "local",
  };
}

async function fetchAdminFromSupabase(
  locale: string
): Promise<AdminDashboardData | null> {
  try {
    const sb = supabaseBrowserSafe();
    const [
      merchantsRes,
      ordersRes,
      appsRes,
      paymentsRes,
    ] = await Promise.all([
      sb.from("merchants").select("id, status, business_name, phone, category, country, city, address, created_at, user_id"),
      sb.from("app_orders").select("*").order("created_at", { ascending: false }),
      sb.from("applications").select("*"),
      sb.from("payments").select("*"),
    ]);

    if (merchantsRes.error || !merchantsRes.data?.length) return null;

    const usersRes = await sb.from("users").select("id, name, email");
    const users = usersRes.data || [];
    const userMap = new Map(users.map((u) => [u.id, u]));

    const merchants: Merchant[] = merchantsRes.data.map((m) => {
      const u = userMap.get(m.user_id);
      return {
        id: m.id,
        userId: m.user_id,
        name: u?.name || m.business_name,
        email: u?.email || "",
        phone: m.phone || "",
        businessName: m.business_name,
        category: m.category || "",
        country: m.country || "",
        city: m.city || "",
        address: m.address || "",
        status: m.status,
        subscription: "",
        createdAt: m.created_at,
      };
    });

    const orders: AppOrder[] = (ordersRes.data || []).map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      merchantId: o.merchant_id,
      merchantName: merchants.find((m) => m.id === o.merchant_id)?.name || "",
      businessName:
        merchants.find((m) => m.id === o.merchant_id)?.businessName || "",
      platform: o.platform,
      features: o.features || [],
      branding: o.branding || { primaryColor: "#0F766E", secondaryColor: "#134E4A" },
      price: Number(o.price),
      currency: o.currency,
      paymentStatus: o.payment_status,
      developmentStatus: o.development_status,
      developmentStep: o.development_step,
      createdAt: o.created_at,
    }));

    const apps: Application[] = (appsRes.data || []).map((a) => ({
      id: a.id,
      merchantId: a.merchant_id,
      merchantName: merchants.find((m) => m.id === a.merchant_id)?.name || "",
      name: a.name,
      platform: a.platform,
      version: a.version || "0.0.0",
      status: a.status,
      publishedAt: a.published_at || undefined,
      lastUpdatedAt: a.last_updated_at || a.updated_at,
    }));

    const payments: Payment[] = (paymentsRes.data || []).map((p) => ({
      id: p.id,
      paymentNumber: p.payment_number,
      merchantName:
        merchants.find((m) => m.id === p.merchant_id)?.name || "",
      invoice: p.invoice_number || "",
      amount: Number(p.amount),
      currency: p.currency,
      paymentMethod: p.payment_method || "",
      status: p.status,
      createdAt: p.created_at,
    }));

    const totalMerchants = merchants.length;
    const activeMerchants = merchants.filter((m) => m.status === "ACTIVE").length;
    const pendingMerchants = merchants.filter((m) => m.status === "PENDING").length;
    const totalAppOrders = orders.length;
    const appsInDevelopment = apps.filter((a) => a.status === "IN_DEVELOPMENT").length;
    const publishedApps = apps.filter((a) => a.status === "PUBLISHED").length;
    const totalRevenue = payments
      .filter((p) => p.status === "PAID")
      .reduce((sum, p) => sum + p.amount, 0);

    const labels = dayLabels(locale);
    const chart = labels.map((label, i) => ({
      label,
      revenue: payments
        .filter((p) => p.status === "PAID")
        .reduce((s, p, idx) => (idx % 7 === i ? s + p.amount / 3 : s), 0) || 0,
      orders: orders.filter((_, idx) => idx % 7 === i).length,
    }));

    return {
      stats: {
        totalMerchants,
        activeMerchants,
        pendingMerchants,
        totalAppOrders,
        appsInDevelopment,
        publishedApps,
        totalRevenue,
        changes: {
          totalMerchants: 0,
          activeMerchants: 0,
          pendingMerchants: 0,
          totalAppOrders: 0,
          appsInDevelopment: 0,
          publishedApps: 0,
          totalRevenue: 0,
        },
      },
      chart,
      recentMerchants: merchants.slice(0, 8),
      recentAppOrders: orders.slice(0, 8),
      source: "supabase",
    };
  } catch {
    return null;
  }
}

async function fetchMerchantFromSupabase(
  merchantId: string | undefined,
  locale: string
): Promise<MerchantDashboardData | null> {
  if (!merchantId) return null;
  try {
    const sb = supabaseBrowserSafe();
    const [ordersRes, productsRes, customersRes, storeRes] = await Promise.all([
      sb.from("store_orders").select("*").eq("merchant_id", merchantId),
      sb.from("products").select("*").eq("merchant_id", merchantId),
      sb.from("customers").select("*").eq("merchant_id", merchantId),
      sb.from("zid_stores").select("*").eq("merchant_id", merchantId).maybeSingle(),
    ]);

    const orders = (ordersRes.data || []) as StoreOrder[];
    const products = (productsRes.data || []) as Product[];
    const customers = (customersRes.data || []) as Customer[];

    if (!orders.length && !products.length && !storeRes.data) return null;

    const store = storeRes.data;
    const totalOrders = store?.orders_count ?? orders.length;
    const totalProducts = store?.products_count ?? products.length;
    const totalCustomers = store?.customers_count ?? customers.length;
    const revenue = orders.reduce((s, o: { total?: number }) => s + Number(o.total || 0), 0);

    const labels = dayLabels(locale);
    const chart = labels.map((label, i) => {
      const dayRevenue =
        orders
          .filter((_, idx) => idx % 7 === i)
          .reduce((s, o: { total?: number }) => s + Number(o.total || 0), 0) || 0;
      return {
        label,
        sales: dayRevenue,
        orders: orders.filter((_, idx) => idx % 7 === i).length,
        revenue: dayRevenue,
      };
    });

    return {
      stats: {
        totalOrders,
        totalProducts,
        totalCustomers,
        revenue,
        changes: {
          totalOrders: 0,
          totalProducts: 0,
          totalCustomers: 0,
          revenue: 0,
        },
      },
      chart,
      source: "supabase",
    };
  } catch {
    return null;
  }
}

export async function getAdminDashboardData(
  locale = "en"
): Promise<AdminDashboardData> {
  const fromDb = await fetchAdminFromSupabase(locale);
  if (fromDb) return fromDb;
  return buildAdminFromLocal(locale);
}

export async function getMerchantDashboardData(
  merchantId?: string,
  locale = "en"
): Promise<MerchantDashboardData> {
  const fromDb = await fetchMerchantFromSupabase(merchantId, locale);
  if (fromDb) return fromDb;
  return buildMerchantFromLocal(locale);
}
