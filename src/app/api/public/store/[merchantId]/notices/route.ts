import { NextResponse } from "next/server";
import { listNotices } from "@/lib/data/notices";

/**
 * Public Flutter API — active general notices for one merchant.
 * GET /api/public/store/{merchantId}/notices
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ merchantId: string }> }
) {
  const { merchantId } = await context.params;
  if (!merchantId || merchantId.length < 8) {
    return NextResponse.json({ error: "Invalid merchantId" }, { status: 400 });
  }

  const notices = await listNotices(merchantId, { activeOnly: true });

  return NextResponse.json(
    {
      merchant_id: merchantId,
      count: notices.length,
      notices: notices.map((n) => ({
        id: n.id,
        title: n.title,
        title_ar: n.titleAr || "",
        message: n.message,
        message_ar: n.messageAr || "",
        created_at: n.createdAt,
      })),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    }
  );
}
