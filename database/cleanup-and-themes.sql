-- =============================================================================
-- Cleanup unwanted tables + add app themes
-- Run in Supabase SQL Editor after schema.sql / merchant-app-cms.sql
-- =============================================================================

-- Remove old Zid mirror tables (not used by the CMS merchant dashboard)
DROP TABLE IF EXISTS store_orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- Enum only used by store_orders
DO $$ BEGIN
  DROP TYPE IF EXISTS store_order_status;
EXCEPTION WHEN dependent_objects_still_exist THEN
  RAISE NOTICE 'store_order_status still in use — skipped';
END $$;

-- =============================================================================
-- App themes catalog
-- =============================================================================

CREATE TABLE IF NOT EXISTS app_themes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_key       TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  name_ar         TEXT NOT NULL,
  description     TEXT,
  description_ar  TEXT,
  primary_color   TEXT NOT NULL,
  secondary_color TEXT NOT NULL,
  accent_color    TEXT NOT NULL DEFAULT '#FFFFFF',
  background_color TEXT NOT NULL DEFAULT '#F8FAFC',
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Merchant selected theme for their mobile app
ALTER TABLE merchants
  ADD COLUMN IF NOT EXISTS app_theme_key TEXT DEFAULT 'teal';

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS theme_key TEXT DEFAULT 'teal';

-- Seed themes
INSERT INTO app_themes (theme_key, name, name_ar, description, description_ar, primary_color, secondary_color, accent_color, background_color, sort_order)
VALUES
  ('teal', 'Teal Modern', 'تركواز عصري', 'Clean teal brand look', 'مظهر تركوازي نظيف', '#0F766E', '#134E4A', '#CCFBF1', '#F8FAFC', 1),
  ('royal', 'Royal Blue', 'أزرق ملكي', 'Trust and finance style', 'أسلوب الثقة والمالية', '#1D4ED8', '#1E3A8A', '#DBEAFE', '#F8FAFC', 2),
  ('sand', 'Desert Sand', 'رمل الصحراء', 'Warm Saudi-inspired tones', 'ألوان دافئة مستوحاة من السعودية', '#B45309', '#92400E', '#FFEDD5', '#FFFBEB', 3),
  ('rose', 'Rose Soft', 'وردي ناعم', 'Soft lifestyle / beauty stores', 'مناسب لمتاجر الجمال ونمط الحياة', '#BE185D', '#9D174D', '#FCE7F3', '#FFF1F2', 4),
  ('forest', 'Forest Green', 'أخضر الغابة', 'Natural and calm', 'طبيعي وهادئ', '#166534', '#14532D', '#DCFCE7', '#F0FDF4', 5),
  ('night', 'Night Dark', 'ليلي داكن', 'Dark premium mobile look', 'مظهر داكن فاخر للتطبيق', '#0F172A', '#1E293B', '#38BDF8', '#020617', 6)
ON CONFLICT (theme_key) DO UPDATE SET
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  primary_color = EXCLUDED.primary_color,
  secondary_color = EXCLUDED.secondary_color,
  accent_color = EXCLUDED.accent_color,
  background_color = EXCLUDED.background_color,
  sort_order = EXCLUDED.sort_order;

-- Link demo merchant to teal theme
UPDATE merchants
SET app_theme_key = 'teal'
WHERE id = '00000000-0000-0000-0000-000000000010'
  AND (app_theme_key IS NULL OR app_theme_key = '');

UPDATE applications
SET theme_key = 'teal'
WHERE merchant_id = '00000000-0000-0000-0000-000000000010'
  AND (theme_key IS NULL OR theme_key = '');

-- RLS for themes (public read)
ALTER TABLE app_themes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read app_themes" ON app_themes;
CREATE POLICY "Public read app_themes" ON app_themes
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Demo update merchants theme" ON merchants;
-- merchants update already covered by demo write policies if applied
