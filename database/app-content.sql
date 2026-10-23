-- =============================================================================
-- App content (merchant-scoped home top bars for Flutter)
-- Run in Supabase SQL Editor AFTER merchants table exists
-- =============================================================================

CREATE TABLE IF NOT EXISTS app_content (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id         UUID NOT NULL UNIQUE REFERENCES merchants (id) ON DELETE CASCADE,
  top_bar_1_text      TEXT NOT NULL DEFAULT '',
  top_bar_1_text_ar   TEXT NOT NULL DEFAULT '',
  top_bar_1_enabled   BOOLEAN NOT NULL DEFAULT TRUE,
  top_bar_2_text      TEXT NOT NULL DEFAULT '',
  top_bar_2_text_ar   TEXT NOT NULL DEFAULT '',
  top_bar_2_enabled   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_content_merchant
  ON app_content (merchant_id);

ALTER TABLE app_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Demo read app_content" ON app_content;
CREATE POLICY "Demo read app_content" ON app_content
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Demo write app_content" ON app_content;
CREATE POLICY "Demo write app_content" ON app_content
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Seed demo merchant with the two home top-bar lines
INSERT INTO app_content (
  merchant_id,
  top_bar_1_text,
  top_bar_1_text_ar,
  top_bar_2_text,
  top_bar_2_text_ar
)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  'Welcome to the official store in the Kingdom of Saudi Arabia.',
  'مرحباً بكم في المتجر الرسمي في المملكة العربية السعودية.',
  'Free shipping for orders above SR 500 all over the Kingdom.',
  'شحن مجاني للطلبات فوق 500 ر.س في جميع أنحاء المملكة.'
)
ON CONFLICT (merchant_id) DO NOTHING;
