import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  deleteMerchantYoutubeApp,
  getMerchantYoutubeApp,
  saveMerchantYoutubeApp,
  toPublicYoutubeApp,
} from "@/lib/data/youtube-apps";
import { youtubeOAuthRedirectUri } from "@/lib/youtube-oauth";

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

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const app = await getMerchantYoutubeApp(user.merchantId!);

  return NextResponse.json({
    app: toPublicYoutubeApp(app),
    redirectUri: youtubeOAuthRedirectUri(appUrl),
    javascriptOrigin: appUrl.replace(/\/$/, ""),
  });
}

export async function PUT(request: NextRequest) {
  const user = await requireMerchant();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const googleClientId = String(body?.googleClientId || "").trim();
  const googleClientSecret =
    body?.googleClientSecret !== undefined
      ? String(body.googleClientSecret)
      : undefined;

  try {
    const result = await saveMerchantYoutubeApp(user.merchantId!, {
      googleClientId,
      googleClientSecret,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to save credentials";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE() {
  const user = await requireMerchant();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await deleteMerchantYoutubeApp(user.merchantId!);
  return NextResponse.json(result);
}
