-- =============================================================================
-- Per-merchant Google OAuth app credentials (Client ID + Secret)
-- Each merchant creates their own Google Cloud OAuth client and saves it here.
-- Run in Supabase SQL Editor
-- =============================================================================

CREATE TABLE IF NOT EXISTS merchant_youtube_apps (
  merchant_id           UUID PRIMARY KEY REFERENCES merchants (id) ON DELETE CASCADE,
  google_client_id      TEXT NOT NULL,
  google_client_secret  TEXT NOT NULL, -- server-only; never expose to browser
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE merchant_youtube_apps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Demo read merchant_youtube_apps" ON merchant_youtube_apps;
CREATE POLICY "Demo read merchant_youtube_apps" ON merchant_youtube_apps
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Demo write merchant_youtube_apps" ON merchant_youtube_apps;
CREATE POLICY "Demo write merchant_youtube_apps" ON merchant_youtube_apps
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
