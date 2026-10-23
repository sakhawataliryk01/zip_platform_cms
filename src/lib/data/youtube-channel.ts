import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { YoutubeChannelInfo } from "@/lib/youtube-channel-shared";

export type MerchantYoutubeChannel = YoutubeChannelInfo & {
  id: string;
  status: "CONNECTED" | "DISCONNECTED";
  authType?: "oauth" | "manual";
  googleAccountEmail?: string;
  lastSyncedAt?: string;
  createdAt: string;
  /** Present only in server-side secure reads — never sent to the browser */
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
};

export type YoutubeChannelPublic = Omit<
  MerchantYoutubeChannel,
  "accessToken" | "refreshToken" | "tokenExpiresAt"
>;

type LocalStore = Record<string, MerchantYoutubeChannel | null>;

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "merchant-youtube-channels.json");

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

function mapRow(
  row: Record<string, unknown>,
  includeSecrets = false
): MerchantYoutubeChannel {
  const base: MerchantYoutubeChannel = {
    id: String(row.id),
    channelUrl: String(row.channel_url),
    channelId: row.channel_id ? String(row.channel_id) : undefined,
    channelTitle: row.channel_title ? String(row.channel_title) : undefined,
    channelHandle: row.channel_handle ? String(row.channel_handle) : undefined,
    thumbnailUrl: row.thumbnail_url ? String(row.thumbnail_url) : undefined,
    status: (row.status as "CONNECTED" | "DISCONNECTED") || "CONNECTED",
    authType: (row.auth_type as "oauth" | "manual") || "manual",
    googleAccountEmail: row.google_account_email
      ? String(row.google_account_email)
      : undefined,
    lastSyncedAt: row.last_synced_at
      ? String(row.last_synced_at)
      : undefined,
    createdAt: String(row.created_at || new Date().toISOString()),
  };

  if (includeSecrets) {
    base.accessToken = row.access_token
      ? String(row.access_token)
      : undefined;
    base.refreshToken = row.refresh_token
      ? String(row.refresh_token)
      : undefined;
    base.tokenExpiresAt = row.token_expires_at
      ? String(row.token_expires_at)
      : undefined;
  }

  return base;
}

export function toPublicChannel(
  channel: MerchantYoutubeChannel | null
): YoutubeChannelPublic | null {
  if (!channel) return null;
  const {
    accessToken: _a,
    refreshToken: _r,
    tokenExpiresAt: _e,
    ...publicChannel
  } = channel;
  return publicChannel;
}

export async function getYoutubeChannel(
  merchantId: string,
  options?: { includeSecrets?: boolean }
): Promise<MerchantYoutubeChannel | null> {
  const includeSecrets = Boolean(options?.includeSecrets);

  try {
    const { data, error } = await sb()
      .from("youtube_channels")
      .select("*")
      .eq("merchant_id", merchantId)
      .maybeSingle();

    if (!error && data) return mapRow(data, includeSecrets);
  } catch {
    // fall through
  }

  const local = await readLocal();
  const channel = local[merchantId] || null;
  if (!channel) return null;
  return includeSecrets ? channel : { ...channel, accessToken: undefined, refreshToken: undefined, tokenExpiresAt: undefined };
}

export type ConnectYoutubeInput = YoutubeChannelInfo & {
  authType?: "oauth" | "manual";
  googleAccountEmail?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
};

export async function connectYoutubeChannel(
  merchantId: string,
  info: ConnectYoutubeInput
): Promise<{ channel: MerchantYoutubeChannel; source: "supabase" | "local" }> {
  const payload: Record<string, unknown> = {
    merchant_id: merchantId,
    channel_url: info.channelUrl,
    channel_id: info.channelId || null,
    channel_title: info.channelTitle || null,
    channel_handle: info.channelHandle || null,
    thumbnail_url: info.thumbnailUrl || null,
    status: "CONNECTED",
    auth_type: info.authType || "manual",
    google_account_email: info.googleAccountEmail || null,
  };

  if (info.accessToken !== undefined) {
    payload.access_token = info.accessToken || null;
  }
  if (info.refreshToken !== undefined) {
    payload.refresh_token = info.refreshToken || null;
  }
  if (info.tokenExpiresAt !== undefined) {
    payload.token_expires_at = info.tokenExpiresAt || null;
  }

  try {
    const existing = await sb()
      .from("youtube_channels")
      .select("id")
      .eq("merchant_id", merchantId)
      .maybeSingle();

    const query = existing.data?.id
      ? sb()
          .from("youtube_channels")
          .update(payload)
          .eq("merchant_id", merchantId)
      : sb().from("youtube_channels").insert(payload);

    const { data, error } = await query.select("*").single();

    if (!error && data) {
      return { channel: mapRow(data, false), source: "supabase" };
    }
  } catch {
    // fall through
  }

  const prev = (await readLocal())[merchantId];
  const channel: MerchantYoutubeChannel = {
    id: prev?.id || randomUUID(),
    channelUrl: info.channelUrl,
    channelId: info.channelId,
    channelTitle: info.channelTitle,
    channelHandle: info.channelHandle,
    thumbnailUrl: info.thumbnailUrl,
    status: "CONNECTED",
    authType: info.authType || "manual",
    googleAccountEmail: info.googleAccountEmail,
    accessToken: info.accessToken ?? prev?.accessToken,
    refreshToken: info.refreshToken ?? prev?.refreshToken,
    tokenExpiresAt: info.tokenExpiresAt ?? prev?.tokenExpiresAt,
    createdAt: prev?.createdAt || new Date().toISOString(),
  };
  const local = await readLocal();
  local[merchantId] = channel;
  await writeLocal(local);
  return { channel: toPublicChannel(channel)!, source: "local" };
}

export async function updateYoutubeTokens(
  merchantId: string,
  tokens: {
    accessToken: string;
    refreshToken?: string;
    tokenExpiresAt?: string;
  }
): Promise<void> {
  try {
    const patch: Record<string, unknown> = {
      access_token: tokens.accessToken,
      token_expires_at: tokens.tokenExpiresAt || null,
    };
    if (tokens.refreshToken) patch.refresh_token = tokens.refreshToken;

    const { error } = await sb()
      .from("youtube_channels")
      .update(patch)
      .eq("merchant_id", merchantId);

    if (!error) return;
  } catch {
    // fall through
  }

  const local = await readLocal();
  if (local[merchantId]) {
    local[merchantId] = {
      ...local[merchantId]!,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken || local[merchantId]!.refreshToken,
      tokenExpiresAt: tokens.tokenExpiresAt,
    };
    await writeLocal(local);
  }
}

export async function disconnectYoutubeChannel(
  merchantId: string
): Promise<{ source: "supabase" | "local" }> {
  try {
    const { error } = await sb()
      .from("youtube_channels")
      .delete()
      .eq("merchant_id", merchantId);

    if (!error) return { source: "supabase" };
  } catch {
    // fall through
  }

  const local = await readLocal();
  local[merchantId] = null;
  await writeLocal(local);
  return { source: "local" };
}

export async function markYoutubeChannelSynced(
  merchantId: string
): Promise<void> {
  const now = new Date().toISOString();
  try {
    await sb()
      .from("youtube_channels")
      .update({ last_synced_at: now })
      .eq("merchant_id", merchantId);
  } catch {
    // ignore
  }

  const local = await readLocal();
  if (local[merchantId]) {
    local[merchantId] = { ...local[merchantId]!, lastSyncedAt: now };
    await writeLocal(local);
  }
}
