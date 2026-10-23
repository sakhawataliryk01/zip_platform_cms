import { parseYoutubeChannelInput } from "@/lib/youtube-channel-shared";
import { youtubeThumbnailUrl } from "@/lib/youtube";
import {
  getYoutubeChannel,
  updateYoutubeTokens,
} from "@/lib/data/youtube-channel";

export type ResolvedYoutubeChannel = {
  channelId: string;
  channelTitle: string;
  channelHandle?: string;
  channelUrl: string;
  thumbnailUrl?: string;
};

export type YoutubeShortItem = {
  videoId: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  publishedAt?: string;
};

type AuthMode =
  | { type: "apiKey"; key: string }
  | { type: "oauth"; accessToken: string };

function apiKey() {
  return process.env.YOUTUBE_API_KEY?.trim() || "";
}

export function hasYoutubeApiKey() {
  return Boolean(apiKey());
}

async function ytGet<T>(
  path: string,
  params: Record<string, string>,
  auth: AuthMode
): Promise<T> {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const headers: HeadersInit = { Accept: "application/json" };
  if (auth.type === "apiKey") {
    url.searchParams.set("key", auth.key);
  } else {
    headers.Authorization = `Bearer ${auth.accessToken}`;
  }

  const res = await fetch(url.toString(), {
    headers,
    next: { revalidate: 0 },
  });
  const data = await res.json();

  if (!res.ok) {
    const message =
      data?.error?.message || `YouTube API error (${res.status})`;
    throw new Error(message);
  }

  return data as T;
}

function requireApiKeyAuth(): AuthMode {
  const key = apiKey();
  if (!key) {
    throw new Error(
      "YOUTUBE_API_KEY is not set. Add it to .env.local, or connect YouTube with OAuth."
    );
  }
  return { type: "apiKey", key };
}

type ChannelsList = {
  items?: Array<{
    id: string;
    snippet?: {
      title?: string;
      customUrl?: string;
      thumbnails?: { medium?: { url?: string }; default?: { url?: string } };
    };
  }>;
};

type SearchList = {
  items?: Array<{
    id?: { channelId?: string; videoId?: string };
    snippet?: {
      title?: string;
      channelId?: string;
      channelTitle?: string;
      publishedAt?: string;
      thumbnails?: { medium?: { url?: string }; high?: { url?: string } };
    };
  }>;
};

function mapChannelItem(
  item: NonNullable<ChannelsList["items"]>[number],
  fallbackUrl?: string
): ResolvedYoutubeChannel {
  const handle = item.snippet?.customUrl?.replace(/^@/, "");
  return {
    channelId: item.id,
    channelTitle: item.snippet?.title || item.id,
    channelHandle: handle,
    channelUrl: handle
      ? `https://www.youtube.com/@${handle}`
      : fallbackUrl || `https://www.youtube.com/channel/${item.id}`,
    thumbnailUrl:
      item.snippet?.thumbnails?.medium?.url ||
      item.snippet?.thumbnails?.default?.url,
  };
}

/** Fetch the authenticated user's YouTube channel (OAuth) */
export async function fetchMineYoutubeChannel(
  accessToken: string
): Promise<ResolvedYoutubeChannel> {
  const data = await ytGet<ChannelsList>(
    "channels",
    { part: "snippet", mine: "true" },
    { type: "oauth", accessToken }
  );
  const item = data.items?.[0];
  if (!item) {
    throw new Error(
      "No YouTube channel found for this Google account. Create a channel on YouTube first."
    );
  }
  return mapChannelItem(item);
}

export async function refreshGoogleAccessToken(
  refreshToken: string,
  merchantId?: string
): Promise<{
  accessToken: string;
  expiresIn: number;
}> {
  const { resolveYoutubeOAuthCredentials } = await import(
    "@/lib/data/youtube-apps"
  );

  let clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  let clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  if (merchantId) {
    const credentials = await resolveYoutubeOAuthCredentials(merchantId);
    if (credentials) {
      clientId = credentials.clientId;
      clientSecret = credentials.clientSecret;
    }
  }

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth client is not configured for this merchant");
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(
      data?.error_description || data?.error || "Failed to refresh YouTube token"
    );
  }

  return {
    accessToken: String(data.access_token),
    expiresIn: Number(data.expires_in || 3600),
  };
}

/** Return a valid OAuth access token for the merchant, refreshing if needed */
export async function getMerchantYoutubeAccessToken(
  merchantId: string
): Promise<string | null> {
  const channel = await getYoutubeChannel(merchantId, { includeSecrets: true });
  if (!channel?.accessToken && !channel?.refreshToken) return null;

  const expiresAt = channel.tokenExpiresAt
    ? new Date(channel.tokenExpiresAt).getTime()
    : 0;
  const stillValid =
    channel.accessToken && expiresAt > Date.now() + 60_000;

  if (stillValid && channel.accessToken) {
    return channel.accessToken;
  }

  if (!channel.refreshToken) {
    return channel.accessToken || null;
  }

  const refreshed = await refreshGoogleAccessToken(
    channel.refreshToken,
    merchantId
  );
  const tokenExpiresAt = new Date(
    Date.now() + refreshed.expiresIn * 1000
  ).toISOString();

  await updateYoutubeTokens(merchantId, {
    accessToken: refreshed.accessToken,
    refreshToken: channel.refreshToken,
    tokenExpiresAt,
  });

  return refreshed.accessToken;
}

async function authForMerchant(merchantId?: string): Promise<AuthMode> {
  if (merchantId) {
    const token = await getMerchantYoutubeAccessToken(merchantId);
    if (token) return { type: "oauth", accessToken: token };
  }
  return requireApiKeyAuth();
}

/** Resolve merchant-pasted channel URL/handle to a YouTube channel id */
export async function resolveYoutubeChannel(
  input: string,
  merchantId?: string
): Promise<ResolvedYoutubeChannel> {
  const parsed = parseYoutubeChannelInput(input);
  if (!parsed) {
    throw new Error(
      "Enter a valid YouTube channel URL or @handle (e.g. https://www.youtube.com/@mystore)"
    );
  }

  const auth = await authForMerchant(merchantId);

  if (parsed.kind === "id") {
    const data = await ytGet<ChannelsList>(
      "channels",
      { part: "snippet", id: parsed.value },
      auth
    );
    const item = data.items?.[0];
    if (!item) throw new Error("YouTube channel not found");
    return mapChannelItem(item, parsed.normalizedUrl);
  }

  if (parsed.kind === "handle") {
    try {
      const data = await ytGet<ChannelsList>(
        "channels",
        { part: "snippet", forHandle: parsed.value },
        auth
      );
      const item = data.items?.[0];
      if (item) return mapChannelItem(item, parsed.normalizedUrl);
    } catch {
      // fall through to search
    }
  }

  const query =
    parsed.kind === "handle"
      ? `@${parsed.value}`
      : parsed.kind === "custom" || parsed.kind === "user"
        ? parsed.value
        : parsed.normalizedUrl;

  const search = await ytGet<SearchList>(
    "search",
    {
      part: "snippet",
      type: "channel",
      q: query,
      maxResults: "1",
    },
    auth
  );

  const hit = search.items?.[0];
  const channelId = hit?.id?.channelId || hit?.snippet?.channelId;
  if (!channelId) {
    throw new Error("Could not find that YouTube channel. Check the URL/@handle.");
  }

  const data = await ytGet<ChannelsList>(
    "channels",
    { part: "snippet", id: channelId },
    auth
  );
  const item = data.items?.[0];
  if (!item) throw new Error("YouTube channel not found");
  return mapChannelItem(item);
}

/** Fetch recent short-form videos from a channel (YouTube Shorts candidates) */
export async function fetchChannelShorts(
  channelId: string,
  maxResults = 15,
  merchantId?: string
): Promise<YoutubeShortItem[]> {
  const auth = await authForMerchant(merchantId);
  const search = await ytGet<SearchList>(
    "search",
    {
      part: "snippet",
      channelId,
      type: "video",
      order: "date",
      videoDuration: "short",
      maxResults: String(Math.min(Math.max(maxResults, 1), 25)),
    },
    auth
  );

  const items: YoutubeShortItem[] = [];
  for (const item of search.items || []) {
    const videoId = item.id?.videoId;
    if (!videoId) continue;
    items.push({
      videoId,
      title: item.snippet?.title || "Untitled Short",
      videoUrl: `https://www.youtube.com/shorts/${videoId}`,
      thumbnailUrl:
        item.snippet?.thumbnails?.high?.url ||
        item.snippet?.thumbnails?.medium?.url ||
        youtubeThumbnailUrl(videoId),
      publishedAt: item.snippet?.publishedAt,
    });
  }
  return items;
}
