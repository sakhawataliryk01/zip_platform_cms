import { NextRequest, NextResponse } from "next/server";
import { getSession, sessionCookieSecure } from "@/lib/auth/session";
import { ZID_OAUTH_STATE_COOKIE, zidCallbackUrl } from "@/lib/zid-oauth";
import { exchangeZidAuthorizationCode } from "@/lib/zid-oauth-exchange";

/**
 * Callback URL (Zid Partner Dashboard)
 * After the merchant approves scopes, Zid redirects here with ?code=...&state=...
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  const stateParam = request.nextUrl.searchParams.get("state");
  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
  ).replace(/\/$/, "");
  const callbackUrl = zidCallbackUrl(request.nextUrl.origin);

  const clearState = (res: NextResponse) => {
    res.cookies.set(ZID_OAUTH_STATE_COOKIE, "", {
      httpOnly: true,
      secure: sessionCookieSecure(),
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return res;
  };

  const redirectStore = (query: string) =>
    clearState(
      NextResponse.redirect(`${appUrl}/en/merchant/store?${query}`)
    );

  const redirectLogin = (query: string) =>
    clearState(
      NextResponse.redirect(
        `${appUrl}/en/login?next=${encodeURIComponent("/merchant/store")}&${query}`
      )
    );

  if (error) {
    return redirectStore(`zid_error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.json(
      {
        ok: false,
        message: "Missing authorization code from Zid",
        hint: "Open this URL only via Zid OAuth redirect after merchant approval.",
        expectedCallbackUrl: callbackUrl,
      },
      { status: 400 }
    );
  }

  const rawState = request.cookies.get(ZID_OAUTH_STATE_COOKIE)?.value;
  let stateMerchantId: string | null = null;
  if (rawState) {
    try {
      const parsed = JSON.parse(rawState) as { s?: string; m?: string | null };
      if (!parsed.s || parsed.s !== stateParam) {
        return redirectStore("zid_error=state_mismatch");
      }
      stateMerchantId = parsed.m || null;
    } catch {
      return redirectStore("zid_error=state_invalid");
    }
  } else if (stateParam) {
    console.warn("Zid OAuth: state cookie missing; continuing without CSRF bind");
  }

  const session = await getSession();
  const result = await exchangeZidAuthorizationCode({
    code,
    originFallback: request.nextUrl.origin,
    oauthRedirectUri: callbackUrl,
    preferredMerchantId: stateMerchantId,
    sessionMerchantId:
      session?.role === "MERCHANT" ? session.merchantId || null : null,
  });

  if (!result.ok) {
    console.error("Zid callback exchange failed:", result);
    return redirectStore(
      `zid_error=${encodeURIComponent(
        `${result.error}:${(result.detail || "").slice(0, 120)}`
      )}`
    );
  }

  console.log("Zid OAuth tokens saved", result);

  const q = `zid=connected&store_id=${encodeURIComponent(result.storeId)}&source=${result.source}`;
  if (session?.role === "MERCHANT" && session.merchantId) {
    return redirectStore(q);
  }
  return redirectLogin(q);
}
