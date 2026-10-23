import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  createIntroPoster,
  deleteIntroPoster,
  listIntroPosters,
  updateIntroPoster,
  uploadIntroPosterImage,
  MAX_INTRO_POSTERS,
  type ContentStatus,
} from "@/lib/data/intro-posters";

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

  const posters = await listIntroPosters(user.merchantId!);
  return NextResponse.json({ posters, max: MAX_INTRO_POSTERS });
}

export async function POST(request: NextRequest) {
  const user = await requireMerchant();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") || "";
  let title = "";
  let titleAr = "";
  let sortOrder = 0;
  let status: ContentStatus = "ACTIVE";
  let imageUrl = "";
  let file: File | null = null;

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    title = String(form.get("title") || "").trim();
    titleAr = String(form.get("titleAr") || "").trim();
    sortOrder = Number(form.get("sortOrder") || 0);
    status =
      (String(form.get("status") || "ACTIVE") as ContentStatus) || "ACTIVE";
    const uploaded = form.get("file");
    if (uploaded instanceof File && uploaded.size > 0) file = uploaded;
  } else {
    const body = await request.json().catch(() => null);
    title = String(body?.title || "").trim();
    titleAr = String(body?.titleAr || "").trim();
    sortOrder = Number(body?.sortOrder || 0);
    status = (body?.status as ContentStatus) || "ACTIVE";
    imageUrl = String(body?.imageUrl || "").trim();
  }

  const existing = await listIntroPosters(user.merchantId!);
  if (existing.length >= MAX_INTRO_POSTERS) {
    return NextResponse.json(
      {
        error: `Maximum ${MAX_INTRO_POSTERS} intro posters allowed. Delete one to add another.`,
      },
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
      imageUrl = await uploadIntroPosterImage(
        user.merchantId!,
        file,
        file.name || "poster.jpg"
      );
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Please choose an intro poster image to upload" },
        { status: 400 }
      );
    }

    const result = await createIntroPoster(user.merchantId!, {
      title: title || `Poster ${existing.length + 1}`,
      titleAr: titleAr || undefined,
      imageUrl,
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
  let sortOrder: number | undefined;
  let status: ContentStatus | undefined;
  let imageUrl: string | undefined;
  let file: File | null = null;

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    id = String(form.get("id") || "");
    if (form.has("title")) title = String(form.get("title") || "");
    if (form.has("titleAr")) titleAr = String(form.get("titleAr") || "");
    if (form.has("sortOrder")) sortOrder = Number(form.get("sortOrder") || 0);
    if (form.has("status"))
      status = String(form.get("status") || "ACTIVE") as ContentStatus;
    const uploaded = form.get("file");
    if (uploaded instanceof File && uploaded.size > 0) file = uploaded;
  } else {
    const body = await request.json().catch(() => null);
    id = String(body?.id || "");
    if (body?.title !== undefined) title = String(body.title);
    if (body?.titleAr !== undefined) titleAr = String(body.titleAr);
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
      imageUrl = await uploadIntroPosterImage(
        user.merchantId!,
        file,
        file.name || "poster.jpg"
      );
    }

    const result = await updateIntroPoster(user.merchantId!, id, {
      title,
      titleAr,
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

  const result = await deleteIntroPoster(user.merchantId!, id);
  return NextResponse.json(result);
}
