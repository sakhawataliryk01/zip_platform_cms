import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createDesignRequestNotification } from "@/lib/data/admin-notifications";
import type { DesignSummary } from "@/lib/data/admin-notifications-shared";
import type { AppPreviewConfig } from "@/lib/app-preview-config";
import type { AppStylePresetKey } from "@/lib/app-style-presets";

function toSummary(
  presetKey: string,
  preview: AppPreviewConfig
): DesignSummary {
  return {
    presetKey,
    readyTheme: preview.readyTheme || "",
    primaryColor: preview.primaryColor || "",
    secondaryColor: preview.secondaryColor || "",
    typeface: preview.typeface || "",
    headerStyle: preview.headerStyle || "",
    bottomBarStyle: preview.bottomBarStyle || "",
    bannerLayoutId: Number(preview.bannerLayoutId) || 1,
    productCardLayoutId: Number(preview.productCardLayoutId) || 1,
    categoryLayoutId: Number(preview.categoryLayoutId) || 1,
    storeNameEn: preview.storeNameEn || "",
    storeNameAr: preview.storeNameAr || "",
  };
}

/** POST — merchant saves app design; creates/updates admin design notification */
export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== "MERCHANT" || !user.merchantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const presetKey = String(body?.presetKey || "amazon") as AppStylePresetKey;
  const preview = body?.preview as AppPreviewConfig | undefined;
  const changeNote = String(body?.changeNote || "").trim();
  const changeHints = Array.isArray(body?.changeHints)
    ? body.changeHints.map((h: unknown) => String(h)).filter(Boolean)
    : [];

  if (!preview || typeof preview !== "object") {
    return NextResponse.json({ error: "preview required" }, { status: 400 });
  }

  const designSummary = toSummary(presetKey, preview);
  const notification = await createDesignRequestNotification({
    merchantId: user.merchantId,
    merchantName: user.name,
    businessName: user.businessName || preview.storeNameEn || "Merchant store",
    designSummary,
    presetKey,
    preview,
    changeNote,
    changeHints,
  });

  return NextResponse.json({
    ok: true,
    notificationId: notification.id,
    designSummary,
  });
}
