import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getAppContent, saveAppContent } from "@/lib/data/app-content";
import { toAppContentPayload } from "@/lib/data/app-content-shared";

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

  const content = await getAppContent(user.merchantId!);
  return NextResponse.json({
    content,
    flutter: toAppContentPayload(content),
  });
}

export async function PUT(request: NextRequest) {
  const user = await requireMerchant();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = await saveAppContent(user.merchantId!, {
    topBar1Text: String(body.topBar1Text ?? ""),
    topBar1TextAr: String(body.topBar1TextAr ?? ""),
    topBar1Enabled: body.topBar1Enabled !== false,
    topBar2Text: String(body.topBar2Text ?? ""),
    topBar2TextAr: String(body.topBar2TextAr ?? ""),
    topBar2Enabled: body.topBar2Enabled !== false,
  });

  return NextResponse.json({
    ok: true,
    source: result.source,
    content: result.content,
    flutter: toAppContentPayload(result.content),
  });
}
