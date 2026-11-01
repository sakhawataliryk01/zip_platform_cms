import { NextResponse } from "next/server";
import { zidAuthUrl, zidCallbackUrl } from "@/lib/zid-oauth";

/**
 * Quick production check (no secrets):
 * GET /api/zid/status
 */
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const clientId = process.env.ZID_CLIENT_ID?.trim() || "";
  const clientSecret = process.env.ZID_CLIENT_SECRET?.trim() || "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "";

  return NextResponse.json({
    ok: Boolean(clientId && clientSecret && appUrl),
    hasClientId: Boolean(clientId),
    hasClientSecret: Boolean(clientSecret),
    hasAppUrl: Boolean(appUrl),
    appUrl: appUrl || null,
    expectedRedirectUrl: zidAuthUrl(origin),
    expectedCallbackUrl: zidCallbackUrl(origin),
    hint: "Partner Dashboard → Redirect URL must be expectedRedirectUrl, Callback URL must be expectedCallbackUrl. Activate must open Redirect URL (OAuth), not only Open App.",
  });
}
