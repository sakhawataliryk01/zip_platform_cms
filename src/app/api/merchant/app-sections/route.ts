import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  getMerchantLayoutKey,
  getMerchantThemeKey,
  listLayouts,
  listMerchantSections,
  listThemes,
  setMerchantLayoutKey,
  setMerchantThemeKey,
} from "@/lib/data/app-sections";

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

  const [themes, layouts, selectedThemeKey, selectedLayoutKey, sections] =
    await Promise.all([
      listThemes(),
      listLayouts(),
      getMerchantThemeKey(user.merchantId!),
      getMerchantLayoutKey(user.merchantId!),
      listMerchantSections(user.merchantId!),
    ]);

  return NextResponse.json({
    themes,
    layouts,
    selectedThemeKey,
    selectedLayoutKey,
    sections,
  });
}

export async function PATCH(request: NextRequest) {
  const user = await requireMerchant();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const themeKey = body?.themeKey ? String(body.themeKey) : "";
  const layoutKey = body?.layoutKey ? String(body.layoutKey) : "";

  if (!themeKey && !layoutKey) {
    return NextResponse.json(
      { error: "themeKey or layoutKey required" },
      { status: 400 }
    );
  }

  try {
    if (layoutKey) {
      const result = await setMerchantLayoutKey(user.merchantId!, layoutKey);
      return NextResponse.json({ ok: true, layoutKey, ...result });
    }

    const result = await setMerchantThemeKey(user.merchantId!, themeKey);
    return NextResponse.json({ ok: true, themeKey, ...result });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to save preference";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
