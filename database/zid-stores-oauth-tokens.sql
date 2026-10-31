-- Run in Supabase SQL editor.
-- Separates Zid OAuth fields: Authorization Bearer vs Manager access_token vs refresh_token.

ALTER TABLE zid_stores
  ADD COLUMN IF NOT EXISTS authorization_token TEXT,
  ADD COLUMN IF NOT EXISTS oauth_refresh_token TEXT,
  ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ;

COMMENT ON COLUMN zid_stores.authorization_token IS
  'Zid OAuth "authorization" JWT — send as Authorization: Bearer';
COMMENT ON COLUMN zid_stores.access_token IS
  'Zid OAuth "access_token" / X-Manager-Token for the store';
COMMENT ON COLUMN zid_stores.oauth_refresh_token IS
  'Zid OAuth refresh_token — server-only; rotate on every refresh';
COMMENT ON COLUMN zid_stores.refresh_token IS
  'Legacy column; prefer authorization_token. Kept for older rows.';
COMMENT ON COLUMN zid_stores.token_expires_at IS
  'Expiry of authorization + access_token (now + expires_in from token response)';
