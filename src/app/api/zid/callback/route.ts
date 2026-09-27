import { NextRequest, NextResponse } from "next/server";

/**
 * Callback URL (Zid Partner Dashboard)
 * After the merchant approves scopes, Zid redirects here with ?code=...
 * Exchange the code for access + refresh tokens.
 *
 * Sample: callback = {{base}}/auth/zid/callback
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const callbackUrl = `${appUrl.replace(/\/$/, "")}/api/zid/callback`;

  if (error) {
    return NextResponse.redirect(
      `${appUrl}/en/merchant/store?zid_error=${encodeURIComponent(error)}`
    );
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

  const clientId = process.env.ZID_CLIENT_ID;
  const clientSecret = process.env.ZID_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Received OAuth code, but ZID_CLIENT_ID / ZID_CLIENT_SECRET are missing in .env.local",
        codeReceived: true,
      },
      { status: 503 }
    );
  }

  try {
    const tokenRes = await fetch("https://oauth.zid.sa/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
        code,
      }),
    });

    const tokenData = await tokenRes.json().catch(() => null);

    if (!tokenRes.ok) {
      console.error("Zid token exchange failed:", tokenData);
      return NextResponse.redirect(
        `${appUrl}/en/merchant/store?zid_error=token_exchange_failed`
      );
    }

    // TODO: store access_token + refresh_token securely in zid_stores (server-only)
    // Never send tokens to the browser.
    console.log("Zid OAuth success — store tokens server-side next.");

    return NextResponse.redirect(
      `${appUrl}/en/merchant/store?zid=connected`
    );
  } catch (err) {
    console.error("Zid callback error:", err);
    return NextResponse.redirect(
      `${appUrl}/en/merchant/store?zid_error=callback_failed`
    );
  }
}
