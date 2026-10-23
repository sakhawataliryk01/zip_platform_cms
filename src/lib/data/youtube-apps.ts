import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import path from "path";

export type MerchantYoutubeApp = {
  merchantId: string;
  googleClientId: string;
  googleClientSecret: string;
  updatedAt: string;
};

export type MerchantYoutubeAppPublic = {
  configured: boolean;
  googleClientId: string;
  /** Masked secret for UI — never the real value */
  googleClientSecretMasked: string;
  hasSecret: boolean;
  updatedAt?: string;
};

type LocalStore = Record<string, MerchantYoutubeApp>;

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "merchant-youtube-apps.json");

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

async function readLocal(): Promise<LocalStore> {
  try {
    return JSON.parse(await fs.readFile(STORE_FILE, "utf8")) as LocalStore;
  } catch {
    return {};
  }
}

async function writeLocal(store: LocalStore) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
}

export function maskSecret(secret: string): string {
  if (!secret) return "";
  if (secret.length <= 8) return "••••••••";
  return `${secret.slice(0, 6)}••••••••${secret.slice(-4)}`;
}

export function toPublicYoutubeApp(
  app: MerchantYoutubeApp | null
): MerchantYoutubeAppPublic {
  if (!app?.googleClientId || !app?.googleClientSecret) {
    return {
      configured: false,
      googleClientId: "",
      googleClientSecretMasked: "",
      hasSecret: false,
    };
  }
  return {
    configured: true,
    googleClientId: app.googleClientId,
    googleClientSecretMasked: maskSecret(app.googleClientSecret),
    hasSecret: true,
    updatedAt: app.updatedAt,
  };
}

export async function getMerchantYoutubeApp(
  merchantId: string
): Promise<MerchantYoutubeApp | null> {
  try {
    const { data, error } = await sb()
      .from("merchant_youtube_apps")
      .select("*")
      .eq("merchant_id", merchantId)
      .maybeSingle();

    if (!error && data) {
      return {
        merchantId,
        googleClientId: String(data.google_client_id || ""),
        googleClientSecret: String(data.google_client_secret || ""),
        updatedAt: String(data.updated_at || new Date().toISOString()),
      };
    }
  } catch {
    // fall through
  }

  const local = await readLocal();
  return local[merchantId] || null;
}

/** Resolve merchant credentials first, then platform env fallback */
export async function resolveYoutubeOAuthCredentials(
  merchantId: string
): Promise<{ clientId: string; clientSecret: string; source: "merchant" | "env" } | null> {
  const app = await getMerchantYoutubeApp(merchantId);
  if (app?.googleClientId?.trim() && app?.googleClientSecret?.trim()) {
    return {
      clientId: app.googleClientId.trim(),
      clientSecret: app.googleClientSecret.trim(),
      source: "merchant",
    };
  }

  const envId = process.env.GOOGLE_CLIENT_ID?.trim();
  const envSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (envId && envSecret) {
    return { clientId: envId, clientSecret: envSecret, source: "env" };
  }

  return null;
}

export async function saveMerchantYoutubeApp(
  merchantId: string,
  input: { googleClientId: string; googleClientSecret?: string }
): Promise<{ app: MerchantYoutubeAppPublic; source: "supabase" | "local" }> {
  const clientId = input.googleClientId.trim();
  if (!clientId) {
    throw new Error("Google Client ID is required");
  }

  const existing = await getMerchantYoutubeApp(merchantId);
  let secret = input.googleClientSecret?.trim() || "";

  // If UI sent masked value or empty, keep existing secret
  if (
    !secret ||
    secret.includes("••••") ||
    (existing && secret === maskSecret(existing.googleClientSecret))
  ) {
    secret = existing?.googleClientSecret || "";
  }

  if (!secret) {
    throw new Error("Google Client Secret is required");
  }

  const updatedAt = new Date().toISOString();
  const payload = {
    merchant_id: merchantId,
    google_client_id: clientId,
    google_client_secret: secret,
    updated_at: updatedAt,
  };

  try {
    const { error } = await sb()
      .from("merchant_youtube_apps")
      .upsert(payload, { onConflict: "merchant_id" });

    if (!error) {
      return {
        source: "supabase",
        app: toPublicYoutubeApp({
          merchantId,
          googleClientId: clientId,
          googleClientSecret: secret,
          updatedAt,
        }),
      };
    }
  } catch {
    // fall through
  }

  const local = await readLocal();
  local[merchantId] = {
    merchantId,
    googleClientId: clientId,
    googleClientSecret: secret,
    updatedAt,
  };
  await writeLocal(local);

  return {
    source: "local",
    app: toPublicYoutubeApp(local[merchantId]),
  };
}

export async function deleteMerchantYoutubeApp(
  merchantId: string
): Promise<{ source: "supabase" | "local" }> {
  try {
    const { error } = await sb()
      .from("merchant_youtube_apps")
      .delete()
      .eq("merchant_id", merchantId);
    if (!error) return { source: "supabase" };
  } catch {
    // fall through
  }

  const local = await readLocal();
  delete local[merchantId];
  await writeLocal(local);
  return { source: "local" };
}
