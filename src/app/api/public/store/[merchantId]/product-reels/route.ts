import { NextRequest, NextResponse } from "next/server";
import { listProductReels } from "@/lib/data/product-reels";
import { toFlutterReelPayload } from "@/lib/data/product-reel-shared";

/**
 * Public Flutter API — always scoped by merchantId so stores never mix.
 * GET /api/public/store/{merchantId}/product-reels
 * GET /api/public/store/{merchantId}/product-reels?product_id=123
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ merchantId: string }> }
) {
  const { merchantId } = await context.params;
  if (!merchantId || merchantId.length < 8) {
    return NextResponse.json({ error: "Invalid merchantId" }, { status: 400 });
  }

  const productId =
    request.nextUrl.searchParams.get("product_id") ||
    request.nextUrl.searchParams.get("productId") ||
    undefined;

  const reels = await listProductReels(merchantId, {
    productId: productId || undefined,
    activeOnly: true,
  });

  const items = reels.map((reel) => ({
    ...toFlutterReelPayload(reel),
    id: reel.id,
  }));

  return NextResponse.json(
    {
      merchant_id: merchantId,
      count: items.length,
      reels: items,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    }
  );
}
