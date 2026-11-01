import { NextRequest, NextResponse } from "next/server";
import { getSession, sessionCookieSecure } from "@/lib/auth/session";
import {
  DEMO_MERCHANT_ID,
  fetchZidManagerProfile,
  findMerchantIdByStoreId,
  saveZidStoreCredentials,
} from "@/lib/data/zid-store";
import { ZID_OAUTH_STATE_COOKIE, zidCallbackUrl } from "@/lib/zid-oauth";

type TokenResponse = {
  token_type?: string;
  expires_in?: number;
  authorization?: string;
  access_token?: string;
  refresh_token?: string;
  error?: string;
  message?: string;
};

/**
 * Callback URL (Zid Partner Dashboard)
 * After the merchant approves scopes, Zid redirects here with ?code=...&state=...
 * Exchange the code, load store profile, persist tokens server-side.
 *
 * Partner Callback URL: {NEXT_PUBLIC_APP_URL}/api/zid/callback
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

  const clientId = process.env.ZID_CLIENT_ID;
  const clientSecret = process.env.ZID_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Received OAuth code, but ZID_CLIENT_ID / ZID_CLIENT_SECRET are missing. Add them on Vercel and redeploy.",
        codeReceived: true,
      },
      { status: 503 }
    );
  }

  try {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: callbackUrl,
      code,
    });

    const tokenRes = await fetch("https://oauth.zid.sa/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body,
      cache: "no-store",
    });

    const tokenData = (await tokenRes.json().catch(() => null)) as TokenResponse | null;

    if (!tokenRes.ok || !tokenData) {
      console.error("Zid token exchange failed:", tokenData);
      return redirectStore("zid_error=token_exchange_failed");
    }

    const authorization = String(tokenData.authorization || "").trim();
    const accessToken = String(tokenData.access_token || "").trim();
    const refreshToken = String(tokenData.refresh_token || "").trim();
    const expiresIn = Number(tokenData.expires_in || 0);

    if (!authorization || !accessToken) {
      console.error("Zid token response missing authorization/access_token:", {
        keys: tokenData ? Object.keys(tokenData) : [],
      });
      return redirectStore("zid_error=token_incomplete");
    }

    const tokenExpiresAt =
      expiresIn > 0
        ? new Date(Date.now() + expiresIn * 1000).toISOString()
        : undefined;

    const profile = await fetchZidManagerProfile({
      authorization,
      accessToken,
    });

    const session = await getSession();
    const byStore = await findMerchantIdByStoreId(profile.storeId);

    const merchantId =
      stateMerchantId ||
      (session?.role === "MERCHANT" ? session.merchantId : null) ||
      byStore ||
      DEMO_MERCHANT_ID;

    let saved;
    try {
      saved = await saveZidStoreCredentials(merchantId, {
        storeId: profile.storeId,
        accessToken,
        authorizationToken: authorization,
        refreshToken: refreshToken || undefined,
        tokenExpiresAt,
        storeName: profile.storeName,
        storeUrl: profile.storeUrl,
      });
    } catch (saveErr) {
      console.error("Zid OAuth save failed:", saveErr);
      const msg =
        saveErr instanceof Error ? saveErr.message : "supabase_save_failed";
      return redirectStore(
        `zid_error=${encodeURIComponent(msg.slice(0, 180))}`
      );
    }

    console.log("Zid OAuth tokens saved", {
      merchantId,
      storeId: profile.storeId,
      source: saved.source,
      hasAuthorization: Boolean(authorization),
      hasRefresh: Boolean(refreshToken),
      expiresAt: tokenExpiresAt,
    });

    if (session?.role === "MERCHANT" && session.merchantId) {
      return redirectStore(
        `zid=connected&store_id=${encodeURIComponent(profile.storeId)}&source=${saved.source}`
      );
    }

    return redirectLogin(
      `zid=connected&store_id=${encodeURIComponent(profile.storeId)}`
    );
  } catch (err) {
    console.error("Zid callback error:", err);
    const msg = err instanceof Error ? err.message : "callback_failed";
    return redirectStore(`zid_error=${encodeURIComponent(msg.slice(0, 180))}`);
  }
}
