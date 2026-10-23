import { NextResponse } from "next/server";
import { listIntroPosters } from "@/lib/data/intro-posters";

/**
 * Public Flutter API — intro / onboarding posters for one merchant.
 * GET /api/public/store/{merchantId}/intro-posters
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ merchantId: string }> }
) {
  const { merchantId } = await context.params;
  if (!merchantId || merchantId.length < 8) {
    return NextResponse.json({ error: "Invalid merchantId" }, { status: 400 });
  }

  const posters = await listIntroPosters(merchantId, { activeOnly: true });

  return NextResponse.json(
    {
      merchant_id: merchantId,
      count: posters.length,
      posters: posters.map((p) => ({
        id: p.id,
        title: p.title,
        title_ar: p.titleAr || "",
        image_url: p.imageUrl,
        sort_order: p.sortOrder,
      })),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    }
  );
}
