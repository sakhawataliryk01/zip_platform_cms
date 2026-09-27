import { NextRequest, NextResponse } from "next/server";

/**
 * Redirection URL (Zid Partner Dashboard)
 * Merchant clicks "Install" → Zid sends them here → we start OAuth.
 *
 * Docs: https://docs.zid.sa/authorization
 * Sample: redirect = {{base}}/auth/zid
 */
export async function GET(request: NextRequest) {
  const clientId = process.env.ZID_CLIENT_ID;
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    request.nextUrl.origin;

  const callbackUrl = `${appUrl.replace(/\/$/, "")}/api/zid/callback`;

  if (!clientId) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "ZID_CLIENT_ID is not set. Add it to .env.local after creating the app in Zid Partner Dashboard.",
        expectedCallbackUrl: callbackUrl,
      },
      { status: 503 }
    );
  }

  const authorize = new URL("https://oauth.zid.sa/oauth/authorize");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("redirect_uri", callbackUrl);
  authorize.searchParams.set("response_type", "code");

  return NextResponse.redirect(authorize.toString());
}
