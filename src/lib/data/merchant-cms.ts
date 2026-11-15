import { createClient } from "@supabase/supabase-js";

export type WeeklyVisit = {
  dayKey: string;
  dayLabelEn: string;
  dayLabelAr: string;
  visitors: number;
};

export type DeskLatestOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: "COMPLETED" | "NEW" | "PROCESSING";
  timeLabelEn: string;
  timeLabelAr: string;
};

export type MerchantCmsDashboardData = {
  welcomeName: string;
  storeName: string;
  stats: {
    sections: number;
    categories: number;
    notifications: number;
    visits: number;
    banners: number;
    orders: number;
    sales: number;
    newCustomers: number;
  };
  changes: {
    orders: number;
    sales: number;
    newCustomers: number;
    visits: number;
  };
  weeklyVisits: WeeklyVisit[];
  latestOrders: DeskLatestOrder[];
  hasApp: boolean;
  source: "supabase" | "local";
};

const DAY_META = [
  { key: "sat", en: "Saturday", ar: "السبت", jsDay: 6 },
  { key: "sun", en: "Sunday", ar: "الأحد", jsDay: 0 },
  { key: "mon", en: "Monday", ar: "الإثنين", jsDay: 1 },
  { key: "tue", en: "Tuesday", ar: "الثلاثاء", jsDay: 2 },
  { key: "wed", en: "Wednesday", ar: "الأربعاء", jsDay: 3 },
  { key: "thu", en: "Thursday", ar: "الخميس", jsDay: 4 },
  { key: "fri", en: "Friday", ar: "الجمعة", jsDay: 5 },
];

/** Merchant desk reference numbers matching the product mock */
export const REFERENCE_DASHBOARD: Omit<
  MerchantCmsDashboardData,
  "welcomeName" | "storeName" | "hasApp" | "source"
> = {
  stats: {
    sections: 3,
    categories: 5,
    notifications: 3,
    visits: 1245,
    banners: 6,
    orders: 128,
    sales: 24560,
    newCustomers: 32,
  },
  changes: {
    orders: 18,
    sales: 22,
    newCustomers: 12,
    visits: 15,
  },
  weeklyVisits: [
    { dayKey: "d20", dayLabelEn: "20", dayLabelAr: "20", visitors: 820 },
    { dayKey: "d21", dayLabelEn: "21", dayLabelAr: "21", visitors: 940 },
    { dayKey: "d22", dayLabelEn: "22", dayLabelAr: "22", visitors: 880 },
    { dayKey: "d23", dayLabelEn: "23", dayLabelAr: "23", visitors: 1100 },
    { dayKey: "d24", dayLabelEn: "24", dayLabelAr: "24", visitors: 1020 },
    { dayKey: "d25", dayLabelEn: "25", dayLabelAr: "25", visitors: 1180 },
    { dayKey: "d26", dayLabelEn: "26", dayLabelAr: "26", visitors: 1245 },
  ],
  latestOrders: [
    {
      id: "o-1048",
      orderNumber: "#1048",
      customerName: "Mohammed Al-Otaibi",
      total: 1250,
      status: "COMPLETED",
      timeLabelEn: "12 min ago",
      timeLabelAr: "قبل 12 دقيقة",
    },
    {
      id: "o-1047",
      orderNumber: "#1047",
      customerName: "Sarah Al-Khalidi",
      total: 320,
      status: "NEW",
      timeLabelEn: "34 min ago",
      timeLabelAr: "قبل 34 دقيقة",
    },
    {
      id: "o-1046",
      orderNumber: "#1046",
      customerName: "Khaled Al-Shehri",
      total: 870,
      status: "PROCESSING",
      timeLabelEn: "1 hr ago",
      timeLabelAr: "قبل ساعة",
    },
  ],
};

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

function withWelcome(
  welcomeName: string,
  storeName: string,
  hasApp: boolean,
  source: "supabase" | "local",
  base = REFERENCE_DASHBOARD
): MerchantCmsDashboardData {
  return {
    welcomeName,
    storeName,
    hasApp,
    source,
    stats: { ...base.stats },
    changes: { ...base.changes },
    weeklyVisits: base.weeklyVisits.map((d) => ({ ...d })),
    latestOrders: base.latestOrders.map((o) => ({ ...o })),
  };
}

export async function getMerchantCmsDashboard(
  merchantId?: string,
  welcomeName = "Admin",
  storeName = "Al Noor Store"
): Promise<MerchantCmsDashboardData> {
  if (!merchantId) {
    return withWelcome(welcomeName, storeName, false, "local");
  }

  try {
    const client = sb();

    const [
      sections,
      categories,
      notices,
      banners,
      weekVisits,
      allVisits,
      apps,
      merchant,
    ] = await Promise.all([
      client
        .from("app_sections")
        .select("id", { count: "exact", head: true })
        .eq("merchant_id", merchantId),
      client
        .from("app_categories")
        .select("id", { count: "exact", head: true })
        .eq("merchant_id", merchantId),
      client
        .from("app_notices")
        .select("id", { count: "exact", head: true })
        .eq("merchant_id", merchantId),
      client
        .from("banners")
        .select("id", { count: "exact", head: true })
        .eq("merchant_id", merchantId),
      client
        .from("app_visits")
        .select("visit_date, visit_count")
        .eq("merchant_id", merchantId)
        .order("visit_date", { ascending: false })
        .limit(7),
      client
        .from("app_visits")
        .select("visit_count")
        .eq("merchant_id", merchantId),
      client
        .from("applications")
        .select("id")
        .eq("merchant_id", merchantId)
        .limit(1),
      client
        .from("merchants")
        .select("business_name")
        .eq("id", merchantId)
        .maybeSingle(),
    ]);

    const resolvedStore =
      merchant.data?.business_name || storeName || "Al Noor Store";

    const sectionsCount = sections.count ?? 0;
    const categoriesCount = categories.count ?? 0;
    const noticesCount = notices.count ?? 0;
    const bannersCount = banners.count ?? 0;

    // No CMS data yet → show the reference desk numbers
    if (
      sections.error ||
      categories.error ||
      (sectionsCount === 0 &&
        categoriesCount === 0 &&
        bannersCount === 0 &&
        noticesCount === 0)
    ) {
      return withWelcome(
        welcomeName,
        resolvedStore,
        (apps.data?.length || 0) > 0,
        "local"
      );
    }

    const byJsDay = new Map<number, number>();
    for (const row of weekVisits.data || []) {
      const d = new Date(`${row.visit_date}T12:00:00`);
      byJsDay.set(d.getDay(), Number(row.visit_count || 0));
    }

    const weeklyFromDb: WeeklyVisit[] = DAY_META.map((meta) => ({
      dayKey: meta.key,
      dayLabelEn: meta.en,
      dayLabelAr: meta.ar,
      visitors: byJsDay.get(meta.jsDay) ?? 0,
    }));

    const totalVisits = (allVisits.data || []).reduce(
      (sum, row) => sum + Number(row.visit_count || 0),
      0
    );

    return {
      welcomeName,
      storeName: resolvedStore,
      stats: {
        sections: sectionsCount,
        categories: categoriesCount,
        notifications: noticesCount,
        visits: totalVisits || REFERENCE_DASHBOARD.stats.visits,
        banners: bannersCount,
        orders: REFERENCE_DASHBOARD.stats.orders,
        sales: REFERENCE_DASHBOARD.stats.sales,
        newCustomers: REFERENCE_DASHBOARD.stats.newCustomers,
      },
      changes: { ...REFERENCE_DASHBOARD.changes },
      weeklyVisits:
        weeklyFromDb.some((d) => d.visitors > 0)
          ? weeklyFromDb
          : REFERENCE_DASHBOARD.weeklyVisits.map((d) => ({ ...d })),
      latestOrders: REFERENCE_DASHBOARD.latestOrders.map((o) => ({ ...o })),
      hasApp: (apps.data?.length || 0) > 0,
      source: "supabase",
    };
  } catch {
    return withWelcome(welcomeName, storeName, false, "local");
  }
}
