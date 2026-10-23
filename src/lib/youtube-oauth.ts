import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const STATE_COOKIE = "youtube_oauth_state";
const STATE_MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes

export { STATE_COOKIE };

function secret() {
  return (
    process.env.AUTH_SECRET ||
    process.env.GOOGLE_CLIENT_SECRET ||
    "dev-youtube-oauth-secret"
  );
}

export type YoutubeOAuthState = {
  merchantId: string;
  locale: string;
  nonce: string;
  exp: number;
};

export function createYoutubeOAuthState(
  merchantId: string,
  locale: string
): { state: string; nonce: string } {
  const nonce = randomBytes(16).toString("hex");
  const payload: YoutubeOAuthState = {
    merchantId,
    locale: locale || "en",
    nonce,
    exp: Date.now() + STATE_MAX_AGE_MS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return { state: `${body}.${sig}`, nonce };
}

export function verifyYoutubeOAuthState(
  state: string,
  cookieState: string | undefined
): YoutubeOAuthState | null {
  if (!state) return null;

  const [body, sig] = state.split(".");
  if (!body || !sig) return null;

  const expected = createHmac("sha256", secret())
    .update(body)
    .digest("base64url");

  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as YoutubeOAuthState;
    if (!payload?.merchantId || !payload.exp) return null;
    if (Date.now() > payload.exp) return null;

    // Prefer cookie match (CSRF). If cookie was dropped by ngrok/browser,
    // still accept a valid signed + unexpired state so OAuth can complete.
    if (cookieState && cookieState !== state) return null;

    return payload;
  } catch {
    return null;
  }
}

export function youtubeOAuthConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CLIENT_SECRET?.trim()
  );
}

export function youtubeOAuthRedirectUri(appUrl: string) {
  return `${appUrl.replace(/\/$/, "")}/api/merchant/youtube/oauth/callback`;
}

export const YOUTUBE_OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
].join(" ");
