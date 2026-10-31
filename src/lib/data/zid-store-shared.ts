export type ZidProduct = {
  id: string;
  name: string;
  nameAr?: string;
  sku?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
};

export type ZidStoreCredentials = {
  merchantId: string;
  storeId: string;
  storeName?: string;
  storeUrl?: string;
  /** X-Manager-Token / Access-Token for the store */
  accessToken: string;
  /** Authorization: Bearer token from Zid OAuth */
  authorizationToken?: string;
  /** OAuth refresh_token (server-only) */
  refreshToken?: string;
  tokenExpiresAt?: string;
  connectionStatus: "CONNECTED" | "DISCONNECTED" | "ERROR";
  lastSyncedAt?: string;
  productsCount?: number;
};

/** Demo merchant used by merchant@example.com */
export const DEMO_MERCHANT_ID = "00000000-0000-0000-0000-000000000010";
