-- =============================================================================
-- Merchant Mobile App CMS tables
-- Run in Supabase SQL Editor AFTER or AFTER seed (safe to re-run with IF NOT EXISTS)
-- =============================================================================

CREATE TYPE content_status AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT');

CREATE TYPE video_type AS ENUM ('EXPLORE', 'EXPERIENCE');

-- Main app sections (e.g. Home, Offers, Categories tiles inside the mobile app)
CREATE TABLE IF NOT EXISTS app_sections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id     UUID NOT NULL REFERENCES merchants (id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  title_ar        TEXT,
  description     TEXT,
  icon_url        TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  status          content_status NOT NULL DEFAULT 'ACTIVE',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_sections_merchant ON app_sections (merchant_id);

-- Product / content categories shown in the mobile app
CREATE TABLE IF NOT EXISTS app_categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id     UUID NOT NULL REFERENCES merchants (id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  name_ar         TEXT,
  image_url       TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  status          content_status NOT NULL DEFAULT 'ACTIVE',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_categories_merchant ON app_categories (merchant_id);

-- Home / promo banners
CREATE TABLE IF NOT EXISTS banners (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id     UUID NOT NULL REFERENCES merchants (id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  title_ar        TEXT,
  image_url       TEXT,
  link_url        TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  status          content_status NOT NULL DEFAULT 'ACTIVE',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_banners_merchant ON banners (merchant_id);

-- Supervisors / content managers for the merchant app
CREATE TABLE IF NOT EXISTS supervisors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id     UUID NOT NULL REFERENCES merchants (id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  email           TEXT,
  phone           TEXT,
  role_label      TEXT DEFAULT 'Supervisor',
  status          content_status NOT NULL DEFAULT 'ACTIVE',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supervisors_merchant ON supervisors (merchant_id);

-- Video categories
CREATE TABLE IF NOT EXISTS video_categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id     UUID NOT NULL REFERENCES merchants (id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  name_ar         TEXT,
  status          content_status NOT NULL DEFAULT 'INACTIVE',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_video_categories_merchant ON video_categories (merchant_id);

-- Videos (Explore / Customer Experiences)
CREATE TABLE IF NOT EXISTS videos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id     UUID NOT NULL REFERENCES merchants (id) ON DELETE CASCADE,
  category_id     UUID REFERENCES video_categories (id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  title_ar        TEXT,
  video_url       TEXT,
  thumbnail_url   TEXT,
  video_type      video_type NOT NULL DEFAULT 'EXPLORE',
  status          content_status NOT NULL DEFAULT 'INACTIVE',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_videos_merchant ON videos (merchant_id);
CREATE INDEX IF NOT EXISTS idx_videos_type ON videos (video_type);

-- Daily app visit analytics
CREATE TABLE IF NOT EXISTS app_visits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id     UUID NOT NULL REFERENCES merchants (id) ON DELETE CASCADE,
  visit_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  visit_count     INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (merchant_id, visit_date)
);

CREATE INDEX IF NOT EXISTS idx_app_visits_merchant_date ON app_visits (merchant_id, visit_date DESC);

-- General notices (merchant-managed, shown in app)
CREATE TABLE IF NOT EXISTS app_notices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id     UUID NOT NULL REFERENCES merchants (id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  title_ar        TEXT,
  message         TEXT NOT NULL,
  message_ar      TEXT,
  status          content_status NOT NULL DEFAULT 'ACTIVE',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_notices_merchant ON app_notices (merchant_id);

-- updated_at triggers
DO $$ BEGIN
  CREATE TRIGGER trg_app_sections_updated_at BEFORE UPDATE ON app_sections
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_app_categories_updated_at BEFORE UPDATE ON app_categories
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_banners_updated_at BEFORE UPDATE ON banners
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_supervisors_updated_at BEFORE UPDATE ON supervisors
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_video_categories_updated_at BEFORE UPDATE ON video_categories
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_videos_updated_at BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_app_notices_updated_at BEFORE UPDATE ON app_notices
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- RLS
ALTER TABLE app_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE supervisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_notices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Demo read app_sections" ON app_sections;
CREATE POLICY "Demo read app_sections" ON app_sections FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Demo write app_sections" ON app_sections;
CREATE POLICY "Demo write app_sections" ON app_sections FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Demo read app_categories" ON app_categories;
CREATE POLICY "Demo read app_categories" ON app_categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Demo write app_categories" ON app_categories;
CREATE POLICY "Demo write app_categories" ON app_categories FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Demo read banners" ON banners;
CREATE POLICY "Demo read banners" ON banners FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Demo write banners" ON banners;
CREATE POLICY "Demo write banners" ON banners FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Demo read supervisors" ON supervisors;
CREATE POLICY "Demo read supervisors" ON supervisors FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Demo write supervisors" ON supervisors;
CREATE POLICY "Demo write supervisors" ON supervisors FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Demo read video_categories" ON video_categories;
CREATE POLICY "Demo read video_categories" ON video_categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Demo write video_categories" ON video_categories;
CREATE POLICY "Demo write video_categories" ON video_categories FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Demo read videos" ON videos;
CREATE POLICY "Demo read videos" ON videos FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Demo write videos" ON videos;
CREATE POLICY "Demo write videos" ON videos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Demo read app_visits" ON app_visits;
CREATE POLICY "Demo read app_visits" ON app_visits FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Demo write app_visits" ON app_visits;
CREATE POLICY "Demo write app_visits" ON app_visits FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Demo read app_notices" ON app_notices;
CREATE POLICY "Demo read app_notices" ON app_notices FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Demo write app_notices" ON app_notices;
CREATE POLICY "Demo write app_notices" ON app_notices FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Seed for demo merchant ABC Store
DO $$
DECLARE
  mid UUID := '00000000-0000-0000-0000-000000000010';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM merchants WHERE id = mid) THEN
    RETURN;
  END IF;

  DELETE FROM app_visits WHERE merchant_id = mid;
  DELETE FROM videos WHERE merchant_id = mid;
  DELETE FROM video_categories WHERE merchant_id = mid;
  DELETE FROM app_notices WHERE merchant_id = mid;
  DELETE FROM supervisors WHERE merchant_id = mid;
  DELETE FROM banners WHERE merchant_id = mid;
  DELETE FROM app_categories WHERE merchant_id = mid;
  DELETE FROM app_sections WHERE merchant_id = mid;

  INSERT INTO app_sections (merchant_id, title, title_ar, sort_order) VALUES
    (mid, 'Home', 'الرئيسية', 1),
    (mid, 'Offers', 'العروض', 2),
    (mid, 'Categories', 'التصنيفات', 3);

  INSERT INTO app_categories (merchant_id, name, name_ar, sort_order) VALUES
    (mid, 'Fashion', 'أزياء', 1),
    (mid, 'Electronics', 'إلكترونيات', 2),
    (mid, 'Beauty', 'جمال', 3),
    (mid, 'Home', 'منزل', 4),
    (mid, 'Sports', 'رياضة', 5);

  INSERT INTO banners (merchant_id, title, title_ar, sort_order) VALUES
    (mid, 'Summer Sale', 'تخفيضات الصيف', 1),
    (mid, 'New Arrivals', 'وصل حديثاً', 2),
    (mid, 'Free Shipping', 'شحن مجاني', 3),
    (mid, 'Flash Deal', 'عرض خاطف', 4),
    (mid, 'Ramadan Offer', 'عرض رمضان', 5),
    (mid, 'Weekend Special', 'عرض نهاية الأسبوع', 6);

  INSERT INTO supervisors (merchant_id, name, email, phone, role_label) VALUES
    (mid, 'Sara Content', 'sara.content@abc.sa', '+966511000001', 'Supervisor'),
    (mid, 'Omar Media', 'omar.media@abc.sa', '+966511000002', 'Supervisor');

  INSERT INTO video_categories (merchant_id, name, name_ar, status) VALUES
    (mid, 'Explore', 'اكتشف', 'INACTIVE'),
    (mid, 'Experiences', 'تجارب العملاء', 'INACTIVE');

  INSERT INTO app_notices (merchant_id, title, title_ar, message, message_ar) VALUES
    (mid, 'Welcome', 'مرحباً', 'Welcome to ABC Store app.', 'مرحباً بك في تطبيق ABC Store.'),
    (mid, 'Update Available', 'يتوفر تحديث', 'A new app version is ready.', 'يتوفر إصدار جديد من التطبيق.'),
    (mid, 'Holiday Hours', 'ساعات العطل', 'Store hours change this week.', 'تتغير ساعات المتجر هذا الأسبوع.');

  INSERT INTO app_visits (merchant_id, visit_date, visit_count) VALUES
    (mid, CURRENT_DATE - 6, 40),
    (mid, CURRENT_DATE - 5, 45),
    (mid, CURRENT_DATE - 4, 50),
    (mid, CURRENT_DATE - 3, 55),
    (mid, CURRENT_DATE - 2, 3),
    (mid, CURRENT_DATE - 1, 3),
    (mid, CURRENT_DATE, 34);
END $$;
