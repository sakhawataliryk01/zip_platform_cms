-- =============================================================================
-- Merchant YouTube channel connection (OAuth 2.0)
-- Run in Supabase SQL Editor (safe to re-run)
-- =============================================================================

CREATE TABLE IF NOT EXISTS youtube_channels (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id       UUID NOT NULL UNIQUE REFERENCES merchants (id) ON DELETE CASCADE,
  channel_url       TEXT NOT NULL,
  channel_id        TEXT,
  channel_title     TEXT,
  channel_handle    TEXT,
  thumbnail_url     TEXT,
  status            TEXT NOT NULL DEFAULT 'CONNECTED', -- CONNECTED | DISCONNECTED
  last_synced_at    TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- OAuth fields (tokens are server-only — never expose to the browser)
ALTER TABLE youtube_channels
  ADD COLUMN IF NOT EXISTS google_account_email TEXT,
  ADD COLUMN IF NOT EXISTS access_token TEXT,
  ADD COLUMN IF NOT EXISTS refresh_token TEXT,
  ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS auth_type TEXT NOT NULL DEFAULT 'oauth'; -- oauth | manual

CREATE INDEX IF NOT EXISTS idx_youtube_channels_merchant
  ON youtube_channels (merchant_id);

ALTER TABLE youtube_channels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Demo read youtube_channels" ON youtube_channels;
CREATE POLICY "Demo read youtube_channels" ON youtube_channels
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Demo write youtube_channels" ON youtube_channels;
CREATE POLICY "Demo write youtube_channels" ON youtube_channels
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
