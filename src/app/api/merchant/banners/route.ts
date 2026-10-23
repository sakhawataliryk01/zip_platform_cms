import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  createBanner,
  deleteBanner,
  listBanners,
  updateBanner,
  uploadBannerImage,
  MAX_BANNERS,
  type ContentStatus,
} from "@/lib/data/banners";

async function requireMerchant() {
  const user = await getSession();
  if (!user || user.role !== "MERCHANT" || !user.merchantId) return null;
  return user;
}

export async function GET() {
  const user = await requireMerchant();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const banners = await listBanners(user.merchantId!);
  return NextResponse.json({ banners });
}

export async function POST(request: NextRequest) {
  const user = await requireMerchant();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") || "";
  let title = "";
  let titleAr = "";
  let linkUrl = "";
  let sortOrder = 0;
  let status: ContentStatus = "ACTIVE";
  let imageUrl = "";
  let file: File | null = null;

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    title = String(form.get("title") || "").trim();
    titleAr = String(form.get("titleAr") || "").trim();
    linkUrl = String(form.get("linkUrl") || "").trim();
    sortOrder = Number(form.get("sortOrder") || 0);
    status = (String(form.get("status") || "ACTIVE") as ContentStatus) || "ACTIVE";
    const uploaded = form.get("file");
    if (uploaded instanceof File && uploaded.size > 0) {
      file = uploaded;
    }
  } else {
    const body = await request.json().catch(() => null);
    title = String(body?.title || "").trim();
    titleAr = String(body?.titleAr || "").trim();
    linkUrl = String(body?.linkUrl || "").trim();
    sortOrder = Number(body?.sortOrder || 0);
    status = (body?.status as ContentStatus) || "ACTIVE";
    imageUrl = String(body?.imageUrl || "").trim();
  }

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const existing = await listBanners(user.merchantId!);
  if (existing.length >= MAX_BANNERS) {
    return NextResponse.json(
      { error: `Maximum ${MAX_BANNERS} banners allowed. Delete one to add another.` },
      { status: 400 }
    );
  }

  try {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Image must be 5MB or smaller" },
          { status: 400 }
        );
      }
      imageUrl = await uploadBannerImage(
        user.merchantId!,
        file,
        file.name || "banner.jpg"
      );
    }

    const result = await createBanner(user.merchantId!, {
      title,
      titleAr: titleAr || undefined,
      imageUrl: imageUrl || undefined,
      linkUrl: linkUrl || undefined,
      sortOrder,
      status,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  const user = await requireMerchant();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") || "";
  let id = "";
  let title: string | undefined;
  let titleAr: string | undefined;
  let linkUrl: string | undefined;
  let sortOrder: number | undefined;
  let status: ContentStatus | undefined;
  let imageUrl: string | undefined;
  let file: File | null = null;

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    id = String(form.get("id") || "");
    if (form.has("title")) title = String(form.get("title") || "");
    if (form.has("titleAr")) titleAr = String(form.get("titleAr") || "");
    if (form.has("linkUrl")) linkUrl = String(form.get("linkUrl") || "");
    if (form.has("sortOrder")) sortOrder = Number(form.get("sortOrder") || 0);
    if (form.has("status"))
      status = String(form.get("status") || "ACTIVE") as ContentStatus;
    const uploaded = form.get("file");
    if (uploaded instanceof File && uploaded.size > 0) {
      file = uploaded;
    }
  } else {
    const body = await request.json().catch(() => null);
    id = String(body?.id || "");
    if (body?.title !== undefined) title = String(body.title);
    if (body?.titleAr !== undefined) titleAr = String(body.titleAr);
    if (body?.linkUrl !== undefined) linkUrl = String(body.linkUrl);
    if (body?.sortOrder !== undefined) sortOrder = Number(body.sortOrder);
    if (body?.status !== undefined) status = body.status as ContentStatus;
    if (body?.imageUrl !== undefined) imageUrl = String(body.imageUrl);
  }

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  try {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Image must be 5MB or smaller" },
          { status: 400 }
        );
      }
      imageUrl = await uploadBannerImage(
        user.merchantId!,
        file,
        file.name || "banner.jpg"
      );
    }

    const result = await updateBanner(user.merchantId!, id, {
      title,
      titleAr,
      linkUrl,
      sortOrder,
      status,
      imageUrl,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
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

  const result = await deleteBanner(user.merchantId!, id);
  return NextResponse.json(result);
}
