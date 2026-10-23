import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  disconnectYoutubeChannel,
  getYoutubeChannel,
  toPublicChannel,
} from "@/lib/data/youtube-channel";
import {
  getMerchantYoutubeApp,
  toPublicYoutubeApp,
} from "@/lib/data/youtube-apps";
import { hasYoutubeApiKey } from "@/lib/youtube-api";
import { youtubeOAuthRedirectUri } from "@/lib/youtube-oauth";

async function requireMerchant() {
  const user = await getSession();
  if (!user || user.role !== "MERCHANT" || !user.merchantId) return null;
  return user;
}

export async function GET(request: Request) {
  const user = await requireMerchant();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    new URL(request.url).origin;

  const [channel, app] = await Promise.all([
    getYoutubeChannel(user.merchantId!, { includeSecrets: true }),
    getMerchantYoutubeApp(user.merchantId!),
  ]);

  const youtubeApp = toPublicYoutubeApp(app);

  return NextResponse.json({
    channel: toPublicChannel(channel),
    youtubeApp,
    oauthConfigured: youtubeApp.configured,
    apiConfigured: hasYoutubeApiKey(),
    redirectUri: youtubeOAuthRedirectUri(appUrl),
    javascriptOrigin: appUrl.replace(/\/$/, ""),
    canSync: Boolean(
      channel?.accessToken ||
        channel?.refreshToken ||
        (channel?.channelId && hasYoutubeApiKey()) ||
        channel?.authType === "oauth"
    ),
  });
}

export async function DELETE() {
  const user = await requireMerchant();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await disconnectYoutubeChannel(user.merchantId!);
  return NextResponse.json(result);
}
