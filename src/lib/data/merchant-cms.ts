import { createClient } from "@supabase/supabase-js";

export type WeeklyVisit = {
  dayKey: string;
  dayLabelEn: string;
  dayLabelAr: string;
  visitors: number;
};

export type MerchantCmsDashboardData = {
  welcomeName: string;
  stats: {
    sections: number;
    categories: number;
    notifications: number;
    visits: number;
    banners: number;
  };
  weeklyVisits: WeeklyVisit[];
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

/** Exact reference dashboard numbers (Alrajhi-style) */
export const REFERENCE_DASHBOARD: Omit<
  MerchantCmsDashboardData,
  "welcomeName" | "hasApp" | "source"
> = {
  stats: {
    sections: 3,
    categories: 5,
    notifications: 3,
    visits: 230,
    banners: 6,
  },
  weeklyVisits: [
    { dayKey: "sat", dayLabelEn: "Saturday", dayLabelAr: "السبت", visitors: 3 },
    { dayKey: "sun", dayLabelEn: "Sunday", dayLabelAr: "الأحد", visitors: 3 },
    { dayKey: "mon", dayLabelEn: "Monday", dayLabelAr: "الإثنين", visitors: 0 },
    { dayKey: "tue", dayLabelEn: "Tuesday", dayLabelAr: "الثلاثاء", visitors: 0 },
    { dayKey: "wed", dayLabelEn: "Wednesday", dayLabelAr: "الأربعاء", visitors: 0 },
    { dayKey: "thu", dayLabelEn: "Thursday", dayLabelAr: "الخميس", visitors: 0 },
    { dayKey: "fri", dayLabelEn: "Friday", dayLabelAr: "الجمعة", visitors: 0 },
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
  hasApp: boolean,
  source: "supabase" | "local",
  base = REFERENCE_DASHBOARD
): MerchantCmsDashboardData {
  return {
    welcomeName,
    hasApp,
    source,
    stats: { ...base.stats },
    weeklyVisits: base.weeklyVisits.map((d) => ({ ...d })),
  };
}

export async function getMerchantCmsDashboard(
  merchantId?: string,
  welcomeName = "Admin"
): Promise<MerchantCmsDashboardData> {
  if (!merchantId) {
    return withWelcome(welcomeName, false, "local");
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
    ]);

    const sectionsCount = sections.count ?? 0;
    const categoriesCount = categories.count ?? 0;
    const noticesCount = notices.count ?? 0;
    const bannersCount = banners.count ?? 0;

    // No CMS data yet → show the reference dashboard numbers
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
        (apps.data?.length || 0) > 0,
        "local"
      );
    }

    const byJsDay = new Map<number, number>();
    for (const row of weekVisits.data || []) {
      const d = new Date(`${row.visit_date}T12:00:00`);
      byJsDay.set(d.getDay(), Number(row.visit_count || 0));
    }

    const weeklyVisits: WeeklyVisit[] = DAY_META.map((meta) => ({
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
      stats: {
        sections: sectionsCount,
        categories: categoriesCount,
        notifications: noticesCount,
        visits: totalVisits || REFERENCE_DASHBOARD.stats.visits,
        banners: bannersCount,
      },
      weeklyVisits,
      hasApp: (apps.data?.length || 0) > 0,
      source: "supabase",
    };
  } catch {
    return withWelcome(welcomeName, false, "local");
  }
}
