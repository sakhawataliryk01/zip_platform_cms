import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getSession, sessionCookieSecure } from "@/lib/auth/session";
import {
  ZID_OAUTH_STATE_COOKIE,
  zidAuthUrl,
  zidCallbackUrl,
} from "@/lib/zid-oauth";
import { exchangeZidAuthorizationCode } from "@/lib/zid-oauth-exchange";

/**
 * Redirection URL (Zid Partner Dashboard)
 * Merchant clicks Install / Activate → Zid sends them here → we start OAuth.
 *
 * Some Zid setups return ?code= to this Redirection URL instead of Callback —
 * we handle both.
 */
export async function GET(request: NextRequest) {
  const clientId = process.env.ZID_CLIENT_ID;
  const origin = request.nextUrl.origin;
  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL || origin
  ).replace(/\/$/, "");
  const callbackUrl = zidCallbackUrl(origin);
  const authUrl = zidAuthUrl(origin);

  const code = request.nextUrl.searchParams.get("code");
  const oauthError = request.nextUrl.searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(
      `${appUrl}/en/merchant/store?zid_error=${encodeURIComponent(oauthError)}`
    );
  }

  // If Zid returns ?code= to the Redirection URL, exchange using THIS URL as redirect_uri.
  if (code) {
    const session = await getSession();
    const result = await exchangeZidAuthorizationCode({
      code,
      originFallback: origin,
      oauthRedirectUri: authUrl,
      sessionMerchantId:
        session?.role === "MERCHANT" ? session.merchantId || null : null,
    });

    if (!result.ok) {
      return NextResponse.redirect(
        `${appUrl}/en/merchant/store?zid_error=${encodeURIComponent(
          `${result.error}:${(result.detail || "").slice(0, 120)}`
        )}`
      );
    }

    const q = `zid=connected&store_id=${encodeURIComponent(result.storeId)}&source=${result.source}`;
    if (session?.role === "MERCHANT" && session.merchantId) {
      return NextResponse.redirect(`${appUrl}/en/merchant/store?${q}`);
    }
    return NextResponse.redirect(
      `${appUrl}/en/login?next=${encodeURIComponent("/merchant/store")}&${q}`
    );
  }

  if (!clientId) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "ZID_CLIENT_ID is not set. Add it to Vercel / .env.local after creating the app in Zid Partner Dashboard.",
        expectedCallbackUrl: callbackUrl,
        expectedRedirectUrl: authUrl,
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

  // Prefer Callback URL as OAuth redirect_uri (Zid docs sample).
  // If Partner only allow-listed the Redirection URL, Activate-with-code path above covers it.
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
