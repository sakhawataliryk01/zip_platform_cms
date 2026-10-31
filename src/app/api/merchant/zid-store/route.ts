import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  DEMO_MERCHANT_ID,
  getZidStoreCredentials,
  saveZidStoreCredentials,
} from "@/lib/data/zid-store";

async function requireMerchant() {
  const user = await getSession();
  if (!user || user.role !== "MERCHANT" || !user.merchantId) return null;
  return user;
}

/** Mask token for UI — never return full secret to client after save unless needed for edit */
function publicCredentials(creds: Awaited<ReturnType<typeof getZidStoreCredentials>>) {
  if (!creds) return null;
  const token = creds.accessToken;
  const masked =
    token.length > 16
      ? `${token.slice(0, 8)}…${token.slice(-6)}`
      : "••••••••";
  return {
    merchantId: creds.merchantId,
    storeId: creds.storeId,
    storeName: creds.storeName,
    storeUrl: creds.storeUrl,
    connectionStatus: creds.connectionStatus,
    lastSyncedAt: creds.lastSyncedAt,
    productsCount: creds.productsCount,
    accessTokenMasked: masked,
    hasAccessToken: Boolean(creds.accessToken),
    hasAuthorizationToken: Boolean(creds.authorizationToken),
    tokenExpiresAt: creds.tokenExpiresAt,
  };
}

export async function GET() {
  const user = await requireMerchant();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let creds = await getZidStoreCredentials(user.merchantId!);

  // Auto-seed demo merchant from env on first load
  if (
    !creds &&
    user.merchantId === DEMO_MERCHANT_ID &&
    process.env.ZID_STORE_ID &&
    process.env.ZID_ACCESS_TOKEN
  ) {
    const saved = await saveZidStoreCredentials(user.merchantId!, {
      storeId: process.env.ZID_STORE_ID,
      accessToken: process.env.ZID_ACCESS_TOKEN,
      authorizationToken: process.env.ZID_AUTHORIZATION_TOKEN,
      storeName: process.env.ZID_STORE_NAME || "Zid Store",
    });
    creds = saved.credentials;
  }

  return NextResponse.json({ store: publicCredentials(creds) });
}

export async function POST(request: NextRequest) {
  const user = await requireMerchant();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const storeId = String(body?.storeId || "").trim();
  let accessToken = String(body?.accessToken || "").trim();
  const keepExistingToken = Boolean(body?.keepExistingToken);
  const authorizationToken = body?.authorizationToken
    ? String(body.authorizationToken).trim()
    : undefined;
  const storeName = body?.storeName
    ? String(body.storeName).trim()
    : undefined;
  const storeUrl = body?.storeUrl ? String(body.storeUrl).trim() : undefined;

  if (!storeId) {
    return NextResponse.json({ error: "Store ID is required" }, { status: 400 });
  }

  const existing = await getZidStoreCredentials(user.merchantId!);

  if (
    !accessToken ||
    accessToken === "__KEEP_EXISTING__" ||
    keepExistingToken
  ) {
    if (!existing?.accessToken) {
      return NextResponse.json(
        { error: "Access Token is required" },
        { status: 400 }
      );
    }
    accessToken = existing.accessToken;
  }

  const result = await saveZidStoreCredentials(user.merchantId!, {
    storeId,
    accessToken,
    authorizationToken:
      authorizationToken || existing?.authorizationToken || undefined,
    refreshToken: existing?.refreshToken,
    tokenExpiresAt: existing?.tokenExpiresAt,
    storeName,
    storeUrl,
  });

  return NextResponse.json({
    ok: true,
    source: result.source,
    store: publicCredentials(result.credentials),
  });
}
