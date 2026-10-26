import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  createNotice,
  deleteNotice,
  listNotices,
  updateNotice,
  MAX_NOTICES,
  type ContentStatus,
} from "@/lib/data/notices";

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

  const notices = await listNotices(user.merchantId!);
  return NextResponse.json({ notices, max: MAX_NOTICES });
}

export async function POST(request: NextRequest) {
  const user = await requireMerchant();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const title = String(body?.title || "").trim();
  const titleAr = String(body?.titleAr || "").trim();
  const message = String(body?.message || "").trim();
  const messageAr = String(body?.messageAr || "").trim();
  const status = (body?.status as ContentStatus) || "ACTIVE";

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (!message || message.length < 3) {
    return NextResponse.json(
      { error: "Message must be at least 3 characters" },
      { status: 400 }
    );
  }

  const existing = await listNotices(user.merchantId!);
  if (existing.length >= MAX_NOTICES) {
    return NextResponse.json(
      { error: `Maximum ${MAX_NOTICES} notices allowed` },
      { status: 400 }
    );
  }

  try {
    const result = await createNotice(user.merchantId!, {
      title,
      titleAr: titleAr || undefined,
      message,
      messageAr: messageAr || undefined,
      status,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  const user = await requireMerchant();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const id = String(body?.id || "").trim();
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  try {
    const result = await updateNotice(user.merchantId!, id, {
      title: body?.title !== undefined ? String(body.title) : undefined,
      titleAr: body?.titleAr !== undefined ? String(body.titleAr) : undefined,
      message: body?.message !== undefined ? String(body.message) : undefined,
      messageAr:
        body?.messageAr !== undefined ? String(body.messageAr) : undefined,
      status: body?.status as ContentStatus | undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: msg }, { status: 400 });
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

  const result = await deleteNotice(user.merchantId!, id);
  return NextResponse.json(result);
}
