export const ZID_OAUTH_STATE_COOKIE = "zid_oauth_state";

export function zidAppBaseUrl(originFallback: string) {
  return (process.env.NEXT_PUBLIC_APP_URL || originFallback).replace(/\/$/, "");
}

export function zidCallbackUrl(originFallback: string) {
  return `${zidAppBaseUrl(originFallback)}/api/zid/callback`;
}

export function zidAuthUrl(originFallback: string) {
  return `${zidAppBaseUrl(originFallback)}/api/zid/auth`;
}
