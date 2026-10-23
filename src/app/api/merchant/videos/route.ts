import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  createVideo,
  deleteVideo,
  listVideoCategories,
  listVideos,
  updateVideo,
  type ContentStatus,
  type VideoType,
} from "@/lib/data/videos";
import { validateYoutubeReelUrl } from "@/lib/youtube";

async function requireMerchant() {
  const user = await getSession();
  if (!user || user.role !== "MERCHANT" || !user.merchantId) return null;
  return user;
}

function resolveReelFields(input: {
  videoUrl?: string;
  thumbnailUrl?: string;
  requireUrl?: boolean;
}) {
  if (input.videoUrl === undefined) {
    return { videoUrl: undefined as string | undefined, thumbnailUrl: input.thumbnailUrl };
  }

  const trimmed = input.videoUrl.trim();
  if (!trimmed) {
    if (input.requireUrl) {
      return { error: "YouTube Shorts / Reel URL is required" };
    }
    return { videoUrl: "", thumbnailUrl: input.thumbnailUrl ?? "" };
  }

  const parsed = validateYoutubeReelUrl(trimmed);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  return {
    videoUrl: parsed.normalized,
    thumbnailUrl: input.thumbnailUrl?.trim() || parsed.thumbnailUrl,
  };
}

export async function GET(request: NextRequest) {
  const user = await requireMerchant();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const typeParam = request.nextUrl.searchParams.get("type");
  const videoType =
    typeParam === "EXPLORE" || typeParam === "EXPERIENCE"
      ? (typeParam as VideoType)
      : undefined;

  const [videos, categories] = await Promise.all([
    listVideos(user.merchantId!, videoType),
    listVideoCategories(user.merchantId!),
  ]);

  return NextResponse.json({ videos, categories });
}

export async function POST(request: NextRequest) {
  const user = await requireMerchant();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const title = String(body?.title || "").trim();
  const videoType = body?.videoType as VideoType;

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (videoType !== "EXPLORE" && videoType !== "EXPERIENCE") {
    return NextResponse.json(
      { error: "videoType must be EXPLORE or EXPERIENCE" },
      { status: 400 }
    );
  }

  const resolved = resolveReelFields({
    videoUrl: body?.videoUrl !== undefined ? String(body.videoUrl) : "",
    thumbnailUrl:
      body?.thumbnailUrl !== undefined ? String(body.thumbnailUrl) : undefined,
    requireUrl: true,
  });

  if ("error" in resolved && resolved.error) {
    return NextResponse.json({ error: resolved.error }, { status: 400 });
  }

  const result = await createVideo(user.merchantId!, {
    title,
    titleAr: body?.titleAr ? String(body.titleAr) : undefined,
    videoUrl: resolved.videoUrl,
    thumbnailUrl: resolved.thumbnailUrl,
    categoryId: body?.categoryId ? String(body.categoryId) : undefined,
    videoType,
    status: (body?.status as ContentStatus) || "ACTIVE",
  });

  return NextResponse.json(result, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const user = await requireMerchant();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const id = String(body?.id || "");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  try {
    let videoUrl: string | undefined;
    let thumbnailUrl: string | undefined;

    if (body?.videoUrl !== undefined) {
      const resolved = resolveReelFields({
        videoUrl: String(body.videoUrl),
        thumbnailUrl:
          body?.thumbnailUrl !== undefined
            ? String(body.thumbnailUrl)
            : undefined,
      });
      if ("error" in resolved && resolved.error) {
        return NextResponse.json({ error: resolved.error }, { status: 400 });
      }
      videoUrl = resolved.videoUrl;
      thumbnailUrl = resolved.thumbnailUrl;
    } else if (body?.thumbnailUrl !== undefined) {
      thumbnailUrl = String(body.thumbnailUrl);
    }

    const result = await updateVideo(user.merchantId!, id, {
      title: body?.title !== undefined ? String(body.title) : undefined,
      titleAr: body?.titleAr !== undefined ? String(body.titleAr) : undefined,
      videoUrl,
      thumbnailUrl,
      categoryId:
        body?.categoryId !== undefined
          ? body.categoryId
            ? String(body.categoryId)
            : null
          : undefined,
      status: body?.status as ContentStatus | undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = await requireMerchant();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const result = await deleteVideo(user.merchantId!, id);
  return NextResponse.json(result);
}
