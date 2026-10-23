import { NextRequest, NextResponse } from "next/server";
import { getSession, sessionCookieSecure } from "@/lib/auth/session";
import { resolveYoutubeOAuthCredentials } from "@/lib/data/youtube-apps";
import {
  STATE_COOKIE,
  YOUTUBE_OAUTH_SCOPES,
  createYoutubeOAuthState,
  youtubeOAuthRedirectUri,
} from "@/lib/youtube-oauth";

/**
 * Start Google / YouTube OAuth 2.0 using this merchant's Client ID/Secret.
 */
export async function GET(request: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== "MERCHANT" || !user.merchantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const redirectUri = youtubeOAuthRedirectUri(appUrl);
  const locale =
    request.nextUrl.searchParams.get("locale") ||
    request.cookies.get("NEXT_LOCALE")?.value ||
    "en";

  const credentials = await resolveYoutubeOAuthCredentials(user.merchantId!);
  if (!credentials) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Add your Google Client ID and Client Secret in YouTube Integration first.",
        redirectUri,
        javascriptOrigin: appUrl.replace(/\/$/, ""),
      },
      { status: 503 }
    );
  }

  const { state } = createYoutubeOAuthState(user.merchantId, locale);

  const authorize = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorize.searchParams.set("client_id", credentials.clientId);
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("scope", YOUTUBE_OAUTH_SCOPES);
  authorize.searchParams.set("access_type", "offline");
  authorize.searchParams.set("prompt", "consent");
  authorize.searchParams.set("include_granted_scopes", "true");
  authorize.searchParams.set("state", state);

  const response = NextResponse.redirect(authorize.toString());
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: sessionCookieSecure() || appUrl.startsWith("https"),
    path: "/",
    maxAge: 600,
  });
  return response;
}
