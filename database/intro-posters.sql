-- =============================================================================
-- Intro posters (merchant onboarding / splash carousel for Flutter)
-- Run in Supabase SQL Editor AFTER merchants table exists
-- =============================================================================

CREATE TABLE IF NOT EXISTS intro_posters (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id     UUID NOT NULL REFERENCES merchants (id) ON DELETE CASCADE,
  title           TEXT NOT NULL DEFAULT '',
  title_ar        TEXT,
  image_url       TEXT NOT NULL,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'ACTIVE', -- ACTIVE | INACTIVE
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_intro_posters_merchant
  ON intro_posters (merchant_id);

CREATE INDEX IF NOT EXISTS idx_intro_posters_merchant_sort
  ON intro_posters (merchant_id, sort_order);

ALTER TABLE intro_posters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Demo read intro_posters" ON intro_posters;
CREATE POLICY "Demo read intro_posters" ON intro_posters
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Demo write intro_posters" ON intro_posters;
CREATE POLICY "Demo write intro_posters" ON intro_posters
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
