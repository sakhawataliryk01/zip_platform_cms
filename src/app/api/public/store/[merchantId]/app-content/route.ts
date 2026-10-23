import { NextResponse } from "next/server";
import { getAppContent } from "@/lib/data/app-content";
import { toAppContentPayload } from "@/lib/data/app-content-shared";

/**
 * Public Flutter API — home top bars for one merchant.
 * GET /api/public/store/{merchantId}/app-content
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ merchantId: string }> }
) {
  const { merchantId } = await context.params;
  if (!merchantId || merchantId.length < 8) {
    return NextResponse.json({ error: "Invalid merchantId" }, { status: 400 });
  }

  const content = await getAppContent(merchantId);
  const payload = toAppContentPayload(content);

  return NextResponse.json(
    {
      ...payload,
      top_bars: payload.top_bars.filter((bar) => bar.enabled),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    }
  );
}
