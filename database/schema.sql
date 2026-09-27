-- =============================================================================
-- SaaS Merchant & Mobile App Management Platform
-- Complete PostgreSQL / Supabase Schema
-- =============================================================================
-- Run this file in the Supabase SQL Editor (or any PostgreSQL client) to create
-- the full database. Safe to run on a fresh project.
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE user_role AS ENUM ('ADMIN', 'MERCHANT');

CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED');

CREATE TYPE merchant_status AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED', 'INACTIVE');

CREATE TYPE zid_connection_status AS ENUM (
  'CONNECTED',
  'DISCONNECTED',
  'CONNECTION_ERROR',
  'SYNCING'
);

CREATE TYPE app_platform AS ENUM ('ANDROID', 'IOS', 'ANDROID_IOS');

CREATE TYPE application_status AS ENUM (
  'NOT_STARTED',
  'IN_DEVELOPMENT',
  'TESTING',
  'REVISION_REQUIRED',
  'READY_TO_PUBLISH',
  'PUBLISHED',
  'REJECTED'
);

CREATE TYPE payment_status AS ENUM ('PAID', 'PENDING', 'FAILED', 'REFUNDED');

CREATE TYPE development_status AS ENUM (
  'PAYMENT_PENDING',
  'PAID',
  'CONFIRMED',
  'REQUIREMENTS_PENDING',
  'IN_DEVELOPMENT',
  'TESTING',
  'READY_TO_PUBLISH',
  'PUBLISHED',
  'CANCELLED',
  'REVISION'
);

CREATE TYPE subscription_status AS ENUM (
  'ACTIVE',
  'CANCELLED',
  'EXPIRED',
  'TRIAL',
  'PAST_DUE'
);

CREATE TYPE billing_period AS ENUM ('MONTHLY', 'YEARLY');

CREATE TYPE plan_status AS ENUM ('ACTIVE', 'INACTIVE');

CREATE TYPE notification_type AS ENUM (
  'INFO',
  'SUCCESS',
  'WARNING',
  'ERROR',
  'APP_ORDER',
  'PAYMENT',
  'SYNC',
  'SYSTEM'
);

CREATE TYPE currency_code AS ENUM ('SAR', 'USD', 'AED', 'EGP');

-- =============================================================================
-- USERS (extends / mirrors auth; app-level profile)
-- =============================================================================
-- If using Supabase Auth, link id to auth.users(id).
-- For standalone auth, id is generated here.

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id    UUID UNIQUE, -- optional link to auth.users
  name            TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT, -- null when using Supabase Auth only
  role            user_role NOT NULL DEFAULT 'MERCHANT',
  status          user_status NOT NULL DEFAULT 'PENDING',
  avatar_url      TEXT,
  last_login_at   TIMESTAMPTZ,
  remember_token  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_status ON users (status);

-- =============================================================================
-- SUBSCRIPTION PLANS
-- =============================================================================

CREATE TABLE subscription_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL UNIQUE, -- Basic, Professional, Enterprise
  name_ar         TEXT,
  description     TEXT,
  description_ar  TEXT,
  price           NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency        currency_code NOT NULL DEFAULT 'SAR',
  billing_period  billing_period NOT NULL DEFAULT 'MONTHLY',
  features        JSONB NOT NULL DEFAULT '[]'::jsonb,
  status          plan_status NOT NULL DEFAULT 'ACTIVE',
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- MERCHANTS
-- =============================================================================

CREATE TABLE merchants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
  business_name   TEXT NOT NULL,
  category        TEXT,
  phone           TEXT,
  country         TEXT DEFAULT 'Saudi Arabia',
  city            TEXT,
  address         TEXT,
  status          merchant_status NOT NULL DEFAULT 'PENDING',
  plan_id         UUID REFERENCES subscription_plans (id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_merchants_user_id ON merchants (user_id);
CREATE INDEX idx_merchants_status ON merchants (status);
CREATE INDEX idx_merchants_business_name ON merchants (business_name);

-- =============================================================================
-- ZID STORES
-- Tokens must NEVER be exposed to the client.
-- =============================================================================

CREATE TABLE zid_stores (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id         UUID NOT NULL UNIQUE REFERENCES merchants (id) ON DELETE CASCADE,
  store_id            TEXT,
  store_name          TEXT,
  store_url           TEXT,
  access_token        TEXT, -- server-only; encrypt at rest in production
  refresh_token       TEXT, -- server-only
  connection_status   zid_connection_status NOT NULL DEFAULT 'DISCONNECTED',
  last_synced_at      TIMESTAMPTZ,
  products_count      INTEGER NOT NULL DEFAULT 0,
  orders_count        INTEGER NOT NULL DEFAULT 0,
  customers_count     INTEGER NOT NULL DEFAULT 0,
  metadata            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_zid_stores_merchant_id ON zid_stores (merchant_id);
CREATE INDEX idx_zid_stores_store_id ON zid_stores (store_id);

-- =============================================================================
-- APPLICATIONS (mobile apps)
-- =============================================================================

CREATE TABLE applications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id     UUID NOT NULL REFERENCES merchants (id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  platform        app_platform NOT NULL DEFAULT 'ANDROID_IOS',
  version         TEXT DEFAULT '0.0.0',
  status          application_status NOT NULL DEFAULT 'NOT_STARTED',
  apk_url         TEXT,
  play_store_url  TEXT,
  app_store_url   TEXT,
  logo_url        TEXT,
  icon_url        TEXT,
  primary_color   TEXT,
  secondary_color TEXT,
  splash_url      TEXT,
  published_at    TIMESTAMPTZ,
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_applications_merchant_id ON applications (merchant_id);
CREATE INDEX idx_applications_status ON applications (status);

-- =============================================================================
-- APP ORDERS
-- =============================================================================

CREATE TABLE app_orders (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number          TEXT NOT NULL UNIQUE, -- e.g. APP-1024
  merchant_id           UUID NOT NULL REFERENCES merchants (id) ON DELETE CASCADE,
  application_id        UUID REFERENCES applications (id) ON DELETE SET NULL,
  platform              app_platform NOT NULL,
  features              JSONB NOT NULL DEFAULT '[]'::jsonb,
  branding              JSONB NOT NULL DEFAULT '{}'::jsonb,
  business_info         JSONB NOT NULL DEFAULT '{}'::jsonb,
  price                 NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency              currency_code NOT NULL DEFAULT 'SAR',
  payment_status        payment_status NOT NULL DEFAULT 'PENDING',
  development_status    development_status NOT NULL DEFAULT 'PAYMENT_PENDING',
  development_step      INTEGER NOT NULL DEFAULT 1, -- 1-9 timeline
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_app_orders_merchant_id ON app_orders (merchant_id);
CREATE INDEX idx_app_orders_status ON app_orders (development_status);
CREATE INDEX idx_app_orders_payment ON app_orders (payment_status);
CREATE INDEX idx_app_orders_created ON app_orders (created_at DESC);

-- =============================================================================
-- APP ORDER TIMELINE EVENTS
-- =============================================================================

CREATE TABLE app_order_timeline (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_order_id    UUID NOT NULL REFERENCES app_orders (id) ON DELETE CASCADE,
  step            INTEGER NOT NULL, -- 1..9
  title           TEXT NOT NULL,
  title_ar        TEXT,
  description     TEXT,
  completed       BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_app_order_timeline_order ON app_order_timeline (app_order_id);

-- =============================================================================
-- SUBSCRIPTIONS
-- =============================================================================

CREATE TABLE subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id     UUID NOT NULL REFERENCES merchants (id) ON DELETE CASCADE,
  plan_id         UUID NOT NULL REFERENCES subscription_plans (id) ON DELETE RESTRICT,
  status          subscription_status NOT NULL DEFAULT 'ACTIVE',
  start_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  renewal_date    DATE,
  cancelled_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_merchant_id ON subscriptions (merchant_id);
CREATE INDEX idx_subscriptions_status ON subscriptions (status);

-- =============================================================================
-- PAYMENTS
-- =============================================================================

CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_number  TEXT NOT NULL UNIQUE, -- e.g. PAY-1001
  merchant_id     UUID NOT NULL REFERENCES merchants (id) ON DELETE CASCADE,
  app_order_id    UUID REFERENCES app_orders (id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES subscriptions (id) ON DELETE SET NULL,
  invoice_number  TEXT,
  amount          NUMERIC(12, 2) NOT NULL,
  currency        currency_code NOT NULL DEFAULT 'SAR',
  payment_method  TEXT, -- card, bank_transfer, etc.
  status          payment_status NOT NULL DEFAULT 'PENDING',
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_merchant_id ON payments (merchant_id);
CREATE INDEX idx_payments_status ON payments (status);
CREATE INDEX idx_payments_created ON payments (created_at DESC);

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================

CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id     UUID REFERENCES merchants (id) ON DELETE CASCADE, -- null = all / admin
  user_id         UUID REFERENCES users (id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  title_ar        TEXT,
  message         TEXT NOT NULL,
  message_ar      TEXT,
  type            notification_type NOT NULL DEFAULT 'INFO',
  read            BOOLEAN NOT NULL DEFAULT FALSE,
  scheduled_at    TIMESTAMPTZ,
  sent_at         TIMESTAMPTZ,
  created_by      UUID REFERENCES users (id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_merchant_id ON notifications (merchant_id);
CREATE INDEX idx_notifications_user_id ON notifications (user_id);
CREATE INDEX idx_notifications_read ON notifications (read);
CREATE INDEX idx_notifications_created ON notifications (created_at DESC);

-- =============================================================================
-- PLATFORM SETTINGS
-- =============================================================================

CREATE TABLE platform_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key             TEXT NOT NULL UNIQUE,
  value           JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- PASSWORD RESET TOKENS
-- =============================================================================

CREATE TABLE password_reset_tokens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token           TEXT NOT NULL UNIQUE,
  expires_at      TIMESTAMPTZ NOT NULL,
  used_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens (token);

-- =============================================================================
-- UPDATED_AT TRIGGER
-- =============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_merchants_updated_at
  BEFORE UPDATE ON merchants
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_zid_stores_updated_at
  BEFORE UPDATE ON zid_stores
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_app_orders_updated_at
  BEFORE UPDATE ON app_orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY (Supabase)
-- =============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE zid_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Helper: current app user id from JWT claim (set via custom auth) or auth.uid()
-- Policies below assume service role for server actions; tighten for direct client access.

-- Service role bypasses RLS. For authenticated users via Supabase Auth:

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users u
    WHERE (u.auth_user_id = auth.uid() OR u.id = auth.uid())
      AND u.role = 'ADMIN'
      AND u.status = 'ACTIVE'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.current_merchant_id()
RETURNS UUID AS $$
  SELECT m.id FROM merchants m
  JOIN users u ON u.id = m.user_id
  WHERE u.auth_user_id = auth.uid() OR u.id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Plans: readable by authenticated users
CREATE POLICY "Plans are readable by authenticated"
  ON subscription_plans FOR SELECT
  TO authenticated
  USING (true);

-- Users: admin all; users read/update self
CREATE POLICY "Users admin full access"
  ON users FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Users read self"
  ON users FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid() OR id = auth.uid());

CREATE POLICY "Users update self"
  ON users FOR UPDATE TO authenticated
  USING (auth_user_id = auth.uid() OR id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid() OR id = auth.uid());

-- Merchants: admin all; merchant own row
CREATE POLICY "Merchants admin full access"
  ON merchants FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Merchants read own"
  ON merchants FOR SELECT TO authenticated
  USING (id = public.current_merchant_id());

CREATE POLICY "Merchants update own"
  ON merchants FOR UPDATE TO authenticated
  USING (id = public.current_merchant_id())
  WITH CHECK (id = public.current_merchant_id());

-- Merchant-scoped tables
CREATE POLICY "Zid stores admin"
  ON zid_stores FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Zid stores own merchant"
  ON zid_stores FOR ALL TO authenticated
  USING (merchant_id = public.current_merchant_id())
  WITH CHECK (merchant_id = public.current_merchant_id());

CREATE POLICY "Applications admin"
  ON applications FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Applications own merchant"
  ON applications FOR ALL TO authenticated
  USING (merchant_id = public.current_merchant_id())
  WITH CHECK (merchant_id = public.current_merchant_id());

CREATE POLICY "App orders admin"
  ON app_orders FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "App orders own merchant"
  ON app_orders FOR ALL TO authenticated
  USING (merchant_id = public.current_merchant_id())
  WITH CHECK (merchant_id = public.current_merchant_id());

CREATE POLICY "Subscriptions admin"
  ON subscriptions FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Subscriptions own merchant"
  ON subscriptions FOR SELECT TO authenticated
  USING (merchant_id = public.current_merchant_id());

CREATE POLICY "Payments admin"
  ON payments FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Payments own merchant"
  ON payments FOR SELECT TO authenticated
  USING (merchant_id = public.current_merchant_id());

CREATE POLICY "Notifications admin"
  ON notifications FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Notifications own merchant"
  ON notifications FOR SELECT TO authenticated
  USING (
    merchant_id = public.current_merchant_id()
    OR user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid() OR id = auth.uid())
  );

CREATE POLICY "Notifications mark read own"
  ON notifications FOR UPDATE TO authenticated
  USING (
    merchant_id = public.current_merchant_id()
    OR user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid() OR id = auth.uid())
  );

CREATE POLICY "Settings admin only"
  ON platform_settings FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============================================================================
-- SEED DATA (optional demo)
-- Password for both demo users: Password123!
-- Hash is bcrypt of "Password123!" — replace when using Supabase Auth.
-- =============================================================================

INSERT INTO subscription_plans (name, name_ar, description, description_ar, price, currency, billing_period, features, sort_order)
VALUES
  (
    'Basic',
    'أساسي',
    'Essential tools for small stores',
    'أدوات أساسية للمتاجر الصغيرة',
    199.00,
    'SAR',
    'MONTHLY',
    '["products","orders","basic_support"]'::jsonb,
    1
  ),
  (
    'Professional',
    'احترافي',
    'Advanced features and priority support',
    'ميزات متقدمة ودعم أولوية',
    499.00,
    'SAR',
    'MONTHLY',
    '["products","orders","customers","app_ordering","priority_support"]'::jsonb,
    2
  ),
  (
    'Enterprise',
    'مؤسسي',
    'Full platform access and dedicated support',
    'وصول كامل للمنصة ودعم مخصص',
    1299.00,
    'SAR',
    'MONTHLY',
    '["all_features","custom_branding","dedicated_support","sla"]'::jsonb,
    3
  );

-- Demo admin (password_hash placeholder — set via app seed or Supabase Auth)
INSERT INTO users (id, name, email, password_hash, role, status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Platform Admin',
  'admin@zidplatform.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- Password123!
  'ADMIN',
  'ACTIVE'
);

INSERT INTO users (id, name, email, password_hash, role, status)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Ahmed Merchant',
  'merchant@example.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- Password123!
  'MERCHANT',
  'ACTIVE'
);

INSERT INTO merchants (id, user_id, business_name, category, phone, country, city, address, status, plan_id)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000002',
  'ABC Store',
  'Fashion',
  '+966500000001',
  'Saudi Arabia',
  'Riyadh',
  'King Fahd Road',
  'ACTIVE',
  (SELECT id FROM subscription_plans WHERE name = 'Professional' LIMIT 1)
);

INSERT INTO zid_stores (merchant_id, store_id, store_name, store_url, connection_status, last_synced_at, products_count, orders_count, customers_count)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  'zid-demo-1001',
  'ABC Store on Zid',
  'https://abc-store.zid.store',
  'CONNECTED',
  NOW() - INTERVAL '2 hours',
  356,
  1245,
  842
);

INSERT INTO platform_settings (key, value)
VALUES
  ('app_name', '"Zid App Platform"'::jsonb),
  ('default_currency', '"SAR"'::jsonb),
  ('support_email', '"support@zidplatform.com"'::jsonb);

-- =============================================================================
-- VIEWS (helpful for dashboards)
-- =============================================================================

CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM merchants) AS total_merchants,
  (SELECT COUNT(*) FROM merchants WHERE status = 'ACTIVE') AS active_merchants,
  (SELECT COUNT(*) FROM merchants WHERE status = 'PENDING') AS pending_merchants,
  (SELECT COUNT(*) FROM app_orders) AS total_app_orders,
  (SELECT COUNT(*) FROM applications WHERE status = 'IN_DEVELOPMENT') AS apps_in_development,
  (SELECT COUNT(*) FROM applications WHERE status = 'PUBLISHED') AS published_apps,
  (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'PAID') AS total_revenue;

COMMENT ON TABLE users IS 'Platform users (ADMIN / MERCHANT)';
COMMENT ON TABLE zid_stores IS 'Zid store connections; tokens are server-only';
COMMENT ON COLUMN zid_stores.access_token IS 'NEVER expose to client';
COMMENT ON COLUMN zid_stores.refresh_token IS 'NEVER expose to client';
