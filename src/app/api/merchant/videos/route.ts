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

async function requireMerchant() {
  const user = await getSession();
  if (!user || user.role !== "MERCHANT" || !user.merchantId) return null;
  return user;
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

  const result = await createVideo(user.merchantId!, {
    title,
    titleAr: body?.titleAr ? String(body.titleAr) : undefined,
    videoUrl: body?.videoUrl ? String(body.videoUrl) : undefined,
    thumbnailUrl: body?.thumbnailUrl ? String(body.thumbnailUrl) : undefined,
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
    const result = await updateVideo(user.merchantId!, id, {
      title: body?.title !== undefined ? String(body.title) : undefined,
      titleAr: body?.titleAr !== undefined ? String(body.titleAr) : undefined,
      videoUrl: body?.videoUrl !== undefined ? String(body.videoUrl) : undefined,
      thumbnailUrl:
        body?.thumbnailUrl !== undefined ? String(body.thumbnailUrl) : undefined,
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
