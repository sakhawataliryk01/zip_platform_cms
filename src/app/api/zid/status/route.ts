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
    /** Client ID is public in OAuth authorize URLs — compare to Partner → API keys */
    clientId: clientId || null,
    appUrl: appUrl || null,
    expectedRedirectUrl: zidAuthUrl(origin),
    expectedCallbackUrl: zidCallbackUrl(origin),
    checks: [
      "Partner Redirection URL must equal expectedRedirectUrl",
      "Partner Callback URL must equal expectedCallbackUrl",
      "Vercel ZID_CLIENT_ID must equal Client ID on ZidFlow API keys page (not an old app)",
      "After Activate, address bar must show /api/zid/auth or /api/zid/callback?code= — not only /en/login",
    ],
  });
}
