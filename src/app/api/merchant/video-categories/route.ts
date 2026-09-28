import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  createVideoCategory,
  deleteVideoCategory,
  listVideoCategories,
  updateVideoCategory,
  type ContentStatus,
} from "@/lib/data/videos";

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

  const categories = await listVideoCategories(user.merchantId!);
  return NextResponse.json({ categories });
}

export async function POST(request: NextRequest) {
  const user = await requireMerchant();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = String(body?.name || "").trim();
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const result = await createVideoCategory(user.merchantId!, {
    name,
    nameAr: body?.nameAr ? String(body.nameAr) : undefined,
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
    const result = await updateVideoCategory(user.merchantId!, id, {
      name: body?.name !== undefined ? String(body.name) : undefined,
      nameAr: body?.nameAr !== undefined ? String(body.nameAr) : undefined,
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

  const result = await deleteVideoCategory(user.merchantId!, id);
  return NextResponse.json(result);
}
