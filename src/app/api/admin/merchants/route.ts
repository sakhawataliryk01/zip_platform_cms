import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  createMerchant,
  deleteMerchant,
  listMerchants,
  updateMerchantStatus,
} from "@/lib/data/merchants";
import type { MerchantStatus } from "@/types";

async function requireAdmin() {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") {
    return null;
  }
  return user;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await listMerchants();
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const required = ["name", "email", "phone", "password", "businessName", "category"];
  for (const key of required) {
    if (!body[key] || String(body[key]).trim() === "") {
      return NextResponse.json(
        { error: `Missing field: ${key}` },
        { status: 400 }
      );
    }
  }

  try {
    const result = await createMerchant({
      name: String(body.name).trim(),
      email: String(body.email).trim(),
      phone: String(body.phone).trim(),
      password: String(body.password),
      businessName: String(body.businessName).trim(),
      category: String(body.category).trim(),
      country: body.country ? String(body.country) : undefined,
      city: body.city ? String(body.city) : undefined,
      address: body.address ? String(body.address) : undefined,
      zidStoreUrl: body.zidStoreUrl ? String(body.zidStoreUrl) : undefined,
      zidStoreId: body.zidStoreId ? String(body.zidStoreId) : undefined,
      plan: body.plan ? String(body.plan) : "Professional",
      status: (body.status as MerchantStatus) || "ACTIVE",
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create merchant";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.id || !body?.status) {
    return NextResponse.json({ error: "id and status required" }, { status: 400 });
  }

  await updateMerchantStatus(String(body.id), body.status as MerchantStatus);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  await deleteMerchant(id);
  return NextResponse.json({ ok: true });
}
