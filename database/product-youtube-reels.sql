-- =============================================================================
-- Product ↔ YouTube Shorts/Reels links (merchant-scoped for Flutter apps)
-- Run in Supabase SQL Editor AFTER merchants / youtube tables exist
-- =============================================================================

CREATE TABLE IF NOT EXISTS product_youtube_reels (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id       UUID NOT NULL REFERENCES merchants (id) ON DELETE CASCADE,
  product_id        TEXT NOT NULL,              -- Zid product id
  product_name      TEXT,
  product_sku       TEXT,
  product_image_url TEXT,
  youtube_video_id  TEXT NOT NULL,
  title             TEXT NOT NULL,
  thumbnail         TEXT,
  url               TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'ACTIVE', -- ACTIVE | INACTIVE
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (merchant_id, product_id, youtube_video_id)
);

CREATE INDEX IF NOT EXISTS idx_product_youtube_reels_merchant
  ON product_youtube_reels (merchant_id);

CREATE INDEX IF NOT EXISTS idx_product_youtube_reels_product
  ON product_youtube_reels (merchant_id, product_id);

CREATE INDEX IF NOT EXISTS idx_product_youtube_reels_video
  ON product_youtube_reels (merchant_id, youtube_video_id);

ALTER TABLE product_youtube_reels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Demo read product_youtube_reels" ON product_youtube_reels;
CREATE POLICY "Demo read product_youtube_reels" ON product_youtube_reels
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Demo write product_youtube_reels" ON product_youtube_reels;
CREATE POLICY "Demo write product_youtube_reels" ON product_youtube_reels
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Ensure demo merchant Zid store row can hold real credentials
-- (Update access_token / store_id via app API or SQL after deploy)
UPDATE zid_stores
SET
  store_id = COALESCE(NULLIF(store_id, ''), '3075120'),
  connection_status = 'CONNECTED',
  updated_at = NOW()
WHERE merchant_id = '00000000-0000-0000-0000-000000000010';
