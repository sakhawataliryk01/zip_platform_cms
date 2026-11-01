import {
  DEMO_MERCHANT_ID,
  fetchZidManagerProfile,
  findMerchantIdByStoreId,
  saveZidStoreCredentials,
} from "@/lib/data/zid-store";
import { zidCallbackUrl } from "@/lib/zid-oauth";

export type ZidTokenExchangeResult =
  | {
      ok: true;
      merchantId: string;
      storeId: string;
      storeName?: string;
      source: "supabase" | "local";
    }
  | { ok: false; error: string; detail?: string };

type TokenResponse = {
  authorization?: string;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
  message?: string;
};

/**
 * Exchange Zid authorization code and persist tokens for a merchant.
 * `oauthRedirectUri` must be byte-identical to the redirect_uri used in /oauth/authorize.
 */
export async function exchangeZidAuthorizationCode(input: {
  code: string;
  originFallback: string;
  /** Exact redirect_uri used when starting authorize */
  oauthRedirectUri?: string;
  preferredMerchantId?: string | null;
  sessionMerchantId?: string | null;
}): Promise<ZidTokenExchangeResult> {
  const clientId = process.env.ZID_CLIENT_ID?.trim();
  const clientSecret = process.env.ZID_CLIENT_SECRET?.trim();
  const callbackUrl =
    input.oauthRedirectUri || zidCallbackUrl(input.originFallback);

  if (!clientId || !clientSecret) {
    return {
      ok: false,
      error: "missing_client_credentials",
      detail:
        "ZID_CLIENT_ID / ZID_CLIENT_SECRET missing on the server (check Vercel env).",
    };
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: callbackUrl,
    code: input.code,
  });

  const tokenRes = await fetch("https://oauth.zid.sa/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
    cache: "no-store",
  });

  const tokenData = (await tokenRes.json().catch(() => null)) as TokenResponse | null;

  if (!tokenRes.ok || !tokenData) {
    console.error("Zid token exchange failed:", tokenData);
    return {
      ok: false,
      error: "token_exchange_failed",
      detail: JSON.stringify(tokenData || { status: tokenRes.status }).slice(
        0,
        300
      ),
    };
  }

  const authorization = String(tokenData.authorization || "").trim();
  const accessToken = String(tokenData.access_token || "").trim();
  const refreshToken = String(tokenData.refresh_token || "").trim();
  const expiresIn = Number(tokenData.expires_in || 0);

  if (!authorization || !accessToken) {
    return {
      ok: false,
      error: "token_incomplete",
      detail: `keys=${Object.keys(tokenData).join(",")}`,
    };
  }

  const tokenExpiresAt =
    expiresIn > 0
      ? new Date(Date.now() + expiresIn * 1000).toISOString()
      : undefined;

  let profile;
  try {
    profile = await fetchZidManagerProfile({ authorization, accessToken });
  } catch (err) {
    return {
      ok: false,
      error: "profile_failed",
      detail: err instanceof Error ? err.message : "profile_failed",
    };
  }

  const byStore = await findMerchantIdByStoreId(profile.storeId);
  const merchantId =
    input.preferredMerchantId ||
    input.sessionMerchantId ||
    byStore ||
    DEMO_MERCHANT_ID;

  try {
    const saved = await saveZidStoreCredentials(merchantId, {
      storeId: profile.storeId,
      accessToken,
      authorizationToken: authorization,
      refreshToken: refreshToken || undefined,
      tokenExpiresAt,
      storeName: profile.storeName,
      storeUrl: profile.storeUrl,
    });

    return {
      ok: true,
      merchantId,
      storeId: profile.storeId,
      storeName: profile.storeName,
      source: saved.source,
    };
  } catch (err) {
    return {
      ok: false,
      error: "supabase_save_failed",
      detail: err instanceof Error ? err.message : "save_failed",
    };
  }
}
