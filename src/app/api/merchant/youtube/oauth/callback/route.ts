import { NextRequest, NextResponse } from "next/server";
import { connectYoutubeChannel } from "@/lib/data/youtube-channel";
import { resolveYoutubeOAuthCredentials } from "@/lib/data/youtube-apps";
import { fetchMineYoutubeChannel } from "@/lib/youtube-api";
import {
  STATE_COOKIE,
  verifyYoutubeOAuthState,
  youtubeOAuthRedirectUri,
} from "@/lib/youtube-oauth";

/**
 * Google OAuth callback — uses this merchant's Client ID/Secret from dashboard.
 */
export async function GET(request: NextRequest) {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const redirectUri = youtubeOAuthRedirectUri(appUrl);

  const error = request.nextUrl.searchParams.get("error");
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state") || "";
  const cookieState = request.cookies.get(STATE_COOKIE)?.value;

  const clearCookie = (res: NextResponse) => {
    res.cookies.set(STATE_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
    return res;
  };

  const parsedState = verifyYoutubeOAuthState(state, cookieState);
  const locale = parsedState?.locale || "en";
  const returnBase = `${appUrl.replace(/\/$/, "")}/${locale}/merchant/video-categories`;

  if (error) {
    return clearCookie(
      NextResponse.redirect(
        `${returnBase}?youtube_error=${encodeURIComponent(error)}`
      )
    );
  }

  if (!parsedState) {
    return clearCookie(
      NextResponse.redirect(
        `${returnBase}?youtube_error=${encodeURIComponent("invalid_state")}`
      )
    );
  }

  if (!code) {
    return clearCookie(
      NextResponse.redirect(
        `${returnBase}?youtube_error=${encodeURIComponent("missing_code")}`
      )
    );
  }

  const credentials = await resolveYoutubeOAuthCredentials(
    parsedState.merchantId
  );
  if (!credentials) {
    return clearCookie(
      NextResponse.redirect(
        `${returnBase}?youtube_error=${encodeURIComponent("oauth_not_configured")}`
      )
    );
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("YouTube token exchange failed:", tokenData);
      return clearCookie(
        NextResponse.redirect(
          `${returnBase}?youtube_error=${encodeURIComponent("token_exchange_failed")}`
        )
      );
    }

    const accessToken = String(tokenData.access_token);
    const refreshToken = tokenData.refresh_token
      ? String(tokenData.refresh_token)
      : undefined;
    const expiresIn = Number(tokenData.expires_in || 3600);
    const tokenExpiresAt = new Date(
      Date.now() + expiresIn * 1000
    ).toISOString();

    let googleAccountEmail: string | undefined;
    try {
      const infoRes = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (infoRes.ok) {
        const info = await infoRes.json();
        googleAccountEmail = info.email ? String(info.email) : undefined;
      }
    } catch {
      // ignore
    }

    const channel = await fetchMineYoutubeChannel(accessToken);

    const { getYoutubeChannel } = await import("@/lib/data/youtube-channel");
    const existing = await getYoutubeChannel(parsedState.merchantId, {
      includeSecrets: true,
    });

    await connectYoutubeChannel(parsedState.merchantId, {
      channelUrl: channel.channelUrl,
      channelId: channel.channelId,
      channelTitle: channel.channelTitle,
      channelHandle: channel.channelHandle,
      thumbnailUrl: channel.thumbnailUrl,
      authType: "oauth",
      googleAccountEmail,
      accessToken,
      refreshToken: refreshToken || existing?.refreshToken,
      tokenExpiresAt,
    });

    return clearCookie(
      NextResponse.redirect(`${returnBase}?youtube=connected`)
    );
  } catch (err) {
    console.error("YouTube OAuth callback error:", err);
    const message =
      err instanceof Error ? err.message : "callback_failed";
    return clearCookie(
      NextResponse.redirect(
        `${returnBase}?youtube_error=${encodeURIComponent(message.slice(0, 120))}`
      )
    );
  }
}
