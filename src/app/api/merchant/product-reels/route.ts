import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  createProductReel,
  deleteProductReel,
  listProductReels,
} from "@/lib/data/product-reels";
import { toFlutterReelPayload } from "@/lib/data/product-reel-shared";

async function requireMerchant() {
  const user = await getSession();
  if (!user || user.role !== "MERCHANT" || !user.merchantId) return null;
  return user;
}

export async function GET(request: NextRequest) {
  const user = await requireMerchant();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const productId = request.nextUrl.searchParams.get("productId") || undefined;
  const reels = await listProductReels(user.merchantId!, { productId });

  return NextResponse.json({
    reels,
    flutter: reels.map(toFlutterReelPayload),
  });
}

export async function POST(request: NextRequest) {
  const user = await requireMerchant();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const productId = String(body?.productId || "").trim();
  const youtubeUrl = String(
    body?.youtubeUrl || body?.url || ""
  ).trim();
  const title = body?.title ? String(body.title).trim() : undefined;
  const thumbnail = body?.thumbnail
    ? String(body.thumbnail).trim()
    : undefined;

  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }
  if (!youtubeUrl) {
    return NextResponse.json(
      { error: "YouTube Shorts / Reel URL is required" },
      { status: 400 }
    );
  }

  try {
    const result = await createProductReel(user.merchantId!, {
      productId,
      productName: body?.productName ? String(body.productName) : undefined,
      productSku: body?.productSku ? String(body.productSku) : undefined,
      productImageUrl: body?.productImageUrl
        ? String(body.productImageUrl)
        : undefined,
      youtubeUrl,
      title,
      thumbnail,
      status: body?.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    });

    return NextResponse.json({
      ok: true,
      source: result.source,
      reel: result.reel,
      flutter: toFlutterReelPayload(result.reel),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save reel";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = await requireMerchant();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const result = await deleteProductReel(user.merchantId!, id);
  if (!result.ok) {
    return NextResponse.json({ error: "Reel not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, source: result.source });
}
