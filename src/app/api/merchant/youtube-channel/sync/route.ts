import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  getYoutubeChannel,
  markYoutubeChannelSynced,
  toPublicChannel,
} from "@/lib/data/youtube-channel";
import {
  createVideo,
  createVideoCategory,
  listVideoCategories,
  listVideos,
} from "@/lib/data/videos";
import {
  fetchChannelShorts,
  getMerchantYoutubeAccessToken,
  hasYoutubeApiKey,
} from "@/lib/youtube-api";
import type { VideoType } from "@/lib/data/video-shared";

async function requireMerchant() {
  const user = await getSession();
  if (!user || user.role !== "MERCHANT" || !user.merchantId) return null;
  return user;
}

export async function POST(request: NextRequest) {
  const user = await requireMerchant();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const videoType =
    body?.videoType === "EXPERIENCE"
      ? ("EXPERIENCE" as VideoType)
      : ("EXPLORE" as VideoType);
  const maxResults = Math.min(Number(body?.maxResults || 12) || 12, 25);

  try {
    const channel = await getYoutubeChannel(user.merchantId!, {
      includeSecrets: true,
    });
    if (!channel) {
      return NextResponse.json(
        { error: "Connect a YouTube channel first (Connect YouTube)." },
        { status: 400 }
      );
    }

    const oauthToken = await getMerchantYoutubeAccessToken(user.merchantId!);
    if (!oauthToken && !hasYoutubeApiKey()) {
      return NextResponse.json(
        {
          error:
            "Reconnect YouTube with Google sign-in, or add YOUTUBE_API_KEY to sync Shorts.",
        },
        { status: 400 }
      );
    }

    if (!channel.channelId) {
      return NextResponse.json(
        {
          error:
            "Channel id missing. Disconnect and connect YouTube again with Google sign-in.",
        },
        { status: 400 }
      );
    }

    let categories = await listVideoCategories(user.merchantId!);
    let categoryId = body?.categoryId
      ? String(body.categoryId)
      : categories.find((c) => c.status === "ACTIVE")?.id ||
        categories[0]?.id;

    if (!categoryId) {
      const created = await createVideoCategory(user.merchantId!, {
        name: "YouTube Shorts",
        nameAr: "يوتيوب شورتس",
        status: "ACTIVE",
      });
      categoryId = created.category.id;
    }

    const shorts = await fetchChannelShorts(
      channel.channelId,
      maxResults,
      user.merchantId!
    );
    const existing = await listVideos(user.merchantId!);
    const existingUrls = new Set(
      existing.map((v) => v.videoUrl).filter(Boolean) as string[]
    );
    const existingIds = new Set(
      existing
        .map((v) => {
          const m = v.videoUrl?.match(/shorts\/([a-zA-Z0-9_-]+)/);
          return m?.[1];
        })
        .filter(Boolean) as string[]
    );

    let imported = 0;
    let skipped = 0;

    for (const short of shorts) {
      if (existingIds.has(short.videoId) || existingUrls.has(short.videoUrl)) {
        skipped += 1;
        continue;
      }

      await createVideo(user.merchantId!, {
        title: short.title.slice(0, 120),
        videoUrl: short.videoUrl,
        thumbnailUrl: short.thumbnailUrl,
        categoryId,
        videoType,
        status: "ACTIVE",
      });
      imported += 1;
    }

    await markYoutubeChannelSynced(user.merchantId!);

    return NextResponse.json({
      ok: true,
      imported,
      skipped,
      total: shorts.length,
      categoryId,
      channel: toPublicChannel(channel),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
