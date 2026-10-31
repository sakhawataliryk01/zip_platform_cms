import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getSession, sessionCookieSecure } from "@/lib/auth/session";
import {
  ZID_OAUTH_STATE_COOKIE,
  zidAuthUrl,
  zidCallbackUrl,
} from "@/lib/zid-oauth";

/**
 * Redirection URL (Zid Partner Dashboard)
 * Merchant clicks Install / Activate → Zid sends them here → we start OAuth.
 *
 * Docs: https://docs.zid.sa/authorization
 * Partner Redirect URL: {NEXT_PUBLIC_APP_URL}/api/zid/auth
 * Partner Callback URL: {NEXT_PUBLIC_APP_URL}/api/zid/callback
 */
export async function GET(request: NextRequest) {
  const clientId = process.env.ZID_CLIENT_ID;
  const origin = request.nextUrl.origin;
  const callbackUrl = zidCallbackUrl(origin);

  if (!clientId) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "ZID_CLIENT_ID is not set. Add it to Vercel / .env.local after creating the app in Zid Partner Dashboard.",
        expectedCallbackUrl: callbackUrl,
        expectedRedirectUrl: zidAuthUrl(origin),
      },
      { status: 503 }
    );
  }

  const session = await getSession();
  const state = randomBytes(24).toString("hex");
  const statePayload = JSON.stringify({
    s: state,
    m: session?.role === "MERCHANT" ? session.merchantId || null : null,
  });

  const authorize = new URL("https://oauth.zid.sa/oauth/authorize");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("redirect_uri", callbackUrl);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("state", state);

  const response = NextResponse.redirect(authorize.toString());
  response.cookies.set(ZID_OAUTH_STATE_COOKIE, statePayload, {
    httpOnly: true,
    secure: sessionCookieSecure(),
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15,
  });
  return response;
}
