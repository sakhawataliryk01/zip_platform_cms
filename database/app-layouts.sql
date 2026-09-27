-- =============================================================================
-- App layout designs (merchant selects UI structure for mobile app)
-- Run in Supabase SQL Editor after cleanup-and-themes.sql
-- =============================================================================

CREATE TABLE IF NOT EXISTS app_layouts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layout_key      TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  name_ar         TEXT NOT NULL,
  description     TEXT,
  description_ar  TEXT,
  preview_style   TEXT NOT NULL DEFAULT 'classic', -- classic | grid | banner | tabs | cards | split
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE merchants
  ADD COLUMN IF NOT EXISTS app_layout_key TEXT DEFAULT 'classic';

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS layout_key TEXT DEFAULT 'classic';

INSERT INTO app_layouts (layout_key, name, name_ar, description, description_ar, preview_style, sort_order)
VALUES
  (
    'classic',
    'Classic Stack',
    'تخطيط كلاسيكي',
    'Header on top, sections stacked vertically — simple and clear.',
    'رأس الصفحة ثم الأقسام بشكل عمودي — بسيط وواضح.',
    'classic',
    1
  ),
  (
    'grid',
    'Category Grid',
    'شبكة التصنيفات',
    'Home shows categories in a 2-column grid for fast browsing.',
    'تعرض الرئيسية التصنيفات في شبكة عمودين للتصفح السريع.',
    'grid',
    2
  ),
  (
    'banner',
    'Banner First',
    'البانر أولاً',
    'Large promo banner first, then offers and categories below.',
    'بانر ترويجي كبير أولاً ثم العروض والتصنيفات.',
    'banner',
    3
  ),
  (
    'tabs',
    'Bottom Tabs',
    'تبويبات سفلية',
    'Modern bottom tab bar: Home, Offers, Cart, Account.',
    'شريط تبويب سفلي حديث: الرئيسية، العروض، السلة، الحساب.',
    'tabs',
    4
  ),
  (
    'cards',
    'Spotlight Cards',
    'بطاقات مميزة',
    'Large content cards for offers and featured products.',
    'بطاقات كبيرة للعروض والمنتجات المميزة.',
    'cards',
    5
  ),
  (
    'split',
    'Split Browse',
    'تصفح مقسّم',
    'Categories on one side, products list on the other.',
    'التصنيفات في جانب وقائمة المنتجات في الجانب الآخر.',
    'split',
    6
  )
ON CONFLICT (layout_key) DO UPDATE SET
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  description = EXCLUDED.description,
  description_ar = EXCLUDED.description_ar,
  preview_style = EXCLUDED.preview_style,
  sort_order = EXCLUDED.sort_order;

UPDATE merchants
SET app_layout_key = COALESCE(NULLIF(app_layout_key, ''), 'classic')
WHERE id = '00000000-0000-0000-0000-000000000010';

UPDATE applications
SET layout_key = COALESCE(NULLIF(layout_key, ''), 'classic')
WHERE merchant_id = '00000000-0000-0000-0000-000000000010';

ALTER TABLE app_layouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read app_layouts" ON app_layouts;
CREATE POLICY "Public read app_layouts" ON app_layouts
  FOR SELECT TO anon, authenticated USING (true);
