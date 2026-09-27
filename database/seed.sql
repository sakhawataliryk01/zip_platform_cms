-- =============================================================================
-- Seed data for Zid App Platform (run AFTER schema.sql in Supabase SQL Editor)
-- Service role / SQL Editor bypasses RLS, so inserts succeed here.
-- =============================================================================

-- Clear existing seed rows (safe for demo resets)
TRUNCATE TABLE
  app_order_timeline,
  notifications,
  payments,
  subscriptions,
  app_orders,
  applications,
  zid_stores,
  merchants,
  password_reset_tokens,
  users,
  subscription_plans,
  platform_settings
RESTART IDENTITY CASCADE;

INSERT INTO subscription_plans (id, name, name_ar, description, description_ar, price, currency, billing_period, features, sort_order)
VALUES
  ('11111111-1111-1111-1111-111111111001', 'Basic', 'أساسي', 'Essential tools for small stores', 'أدوات أساسية للمتاجر الصغيرة', 199.00, 'SAR', 'MONTHLY', '["products","orders"]'::jsonb, 1),
  ('11111111-1111-1111-1111-111111111002', 'Professional', 'احترافي', 'Advanced features', 'ميزات متقدمة', 499.00, 'SAR', 'MONTHLY', '["products","orders","customers","app_ordering"]'::jsonb, 2),
  ('11111111-1111-1111-1111-111111111003', 'Enterprise', 'مؤسسي', 'Full platform access', 'وصول كامل', 1299.00, 'SAR', 'MONTHLY', '["all_features"]'::jsonb, 3);

INSERT INTO users (id, name, email, password_hash, role, status, last_login_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Platform Admin', 'admin@zidplatform.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', 'ACTIVE', NOW()),
  ('00000000-0000-0000-0000-000000000002', 'Ahmed Merchant', 'merchant@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'MERCHANT', 'ACTIVE', NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000003', 'Sara Al Qahtani', 'sara@beautyco.sa', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'MERCHANT', 'ACTIVE', NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000004', 'Omar Hassan', 'omar@techmart.sa', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'MERCHANT', 'PENDING', NULL),
  ('00000000-0000-0000-0000-000000000005', 'Layla Faris', 'layla@homestyle.sa', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'MERCHANT', 'SUSPENDED', NOW() - INTERVAL '10 days'),
  ('00000000-0000-0000-0000-000000000006', 'Khalid Nasser', 'khalid@sportzone.sa', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'MERCHANT', 'ACTIVE', NOW() - INTERVAL '3 days');

INSERT INTO merchants (id, user_id, business_name, category, phone, country, city, address, status, plan_id, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000002', 'ABC Store', 'Fashion', '+966500000001', 'Saudi Arabia', 'Riyadh', 'King Fahd Road', 'ACTIVE', '11111111-1111-1111-1111-111111111002', NOW() - INTERVAL '120 days'),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000003', 'Beauty Co', 'Beauty', '+966500000002', 'Saudi Arabia', 'Jeddah', 'Tahlia Street', 'ACTIVE', '11111111-1111-1111-1111-111111111003', NOW() - INTERVAL '90 days'),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000004', 'Tech Mart', 'Electronics', '+966500000003', 'Saudi Arabia', 'Dammam', 'Corniche Road', 'PENDING', '11111111-1111-1111-1111-111111111001', NOW() - INTERVAL '20 days'),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000005', 'Home Style', 'Home', '+966500000004', 'Saudi Arabia', 'Riyadh', 'Olaya District', 'SUSPENDED', '11111111-1111-1111-1111-111111111002', NOW() - INTERVAL '180 days'),
  ('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000006', 'Sport Zone', 'Sports', '+966500000005', 'Saudi Arabia', 'Khobar', 'Prince Turki Street', 'ACTIVE', '11111111-1111-1111-1111-111111111001', NOW() - INTERVAL '60 days');

INSERT INTO zid_stores (merchant_id, store_id, store_name, store_url, connection_status, last_synced_at, products_count, orders_count, customers_count)
VALUES
  ('00000000-0000-0000-0000-000000000010', 'zid-demo-1001', 'ABC Store on Zid', 'https://abc-store.zid.store', 'CONNECTED', NOW() - INTERVAL '2 hours', 356, 1245, 842),
  ('00000000-0000-0000-0000-000000000011', 'zid-demo-1002', 'Beauty Co', 'https://beautyco.zid.store', 'CONNECTED', NOW() - INTERVAL '5 hours', 210, 640, 390),
  ('00000000-0000-0000-0000-000000000014', 'zid-demo-1005', 'Sport Zone', 'https://sportzone.zid.store', 'CONNECTED', NOW() - INTERVAL '1 day', 180, 420, 260);

INSERT INTO applications (id, merchant_id, name, platform, version, status, published_at, last_updated_at)
VALUES
  ('22222222-2222-2222-2222-222222222001', '00000000-0000-0000-0000-000000000010', 'ABC Store', 'ANDROID_IOS', '1.2.0', 'PUBLISHED', NOW() - INTERVAL '70 days', NOW() - INTERVAL '20 days'),
  ('22222222-2222-2222-2222-222222222002', '00000000-0000-0000-0000-000000000011', 'Beauty Co', 'ANDROID_IOS', '0.9.0', 'IN_DEVELOPMENT', NULL, NOW() - INTERVAL '2 days'),
  ('22222222-2222-2222-2222-222222222003', '00000000-0000-0000-0000-000000000014', 'Sport Zone', 'ANDROID', '1.0.0', 'READY_TO_PUBLISH', NULL, NOW() - INTERVAL '5 days');

INSERT INTO app_orders (id, order_number, merchant_id, application_id, platform, features, branding, price, currency, payment_status, development_status, development_step, created_at)
VALUES
  ('33333333-3333-3333-3333-333333333001', 'APP-1024', '00000000-0000-0000-0000-000000000010', '22222222-2222-2222-2222-222222222001', 'ANDROID_IOS',
   '["products","categories","search","cart","checkout","orders","push"]'::jsonb,
   '{"primaryColor":"#0F766E","secondaryColor":"#134E4A"}'::jsonb,
   8500, 'SAR', 'PAID', 'PUBLISHED', 9, NOW() - INTERVAL '100 days'),
  ('33333333-3333-3333-3333-333333333002', 'APP-1025', '00000000-0000-0000-0000-000000000011', '22222222-2222-2222-2222-222222222002', 'ANDROID_IOS',
   '["products","categories","search","cart","checkout","orders"]'::jsonb,
   '{"primaryColor":"#BE185D","secondaryColor":"#9D174D"}'::jsonb,
   7200, 'SAR', 'PAID', 'IN_DEVELOPMENT', 4, NOW() - INTERVAL '40 days'),
  ('33333333-3333-3333-3333-333333333003', 'APP-1026', '00000000-0000-0000-0000-000000000014', '22222222-2222-2222-2222-222222222003', 'ANDROID',
   '["products","cart","checkout","orders"]'::jsonb,
   '{"primaryColor":"#1D4ED8","secondaryColor":"#1E3A8A"}'::jsonb,
   5500, 'SAR', 'PAID', 'READY_TO_PUBLISH', 8, NOW() - INTERVAL '50 days'),
  ('33333333-3333-3333-3333-333333333004', 'APP-1027', '00000000-0000-0000-0000-000000000013', NULL, 'IOS',
   '["products","categories","cart","wishlist"]'::jsonb,
   '{"primaryColor":"#B45309","secondaryColor":"#92400E"}'::jsonb,
   6000, 'SAR', 'PENDING', 'PAYMENT_PENDING', 1, NOW() - INTERVAL '10 days');

INSERT INTO payments (payment_number, merchant_id, app_order_id, invoice_number, amount, currency, payment_method, status, created_at)
VALUES
  ('PAY-1001', '00000000-0000-0000-0000-000000000010', '33333333-3333-3333-3333-333333333001', 'INV-2041', 8500, 'SAR', 'Card', 'PAID', NOW() - INTERVAL '99 days'),
  ('PAY-1002', '00000000-0000-0000-0000-000000000011', '33333333-3333-3333-3333-333333333002', 'INV-2042', 7200, 'SAR', 'Bank Transfer', 'PAID', NOW() - INTERVAL '39 days'),
  ('PAY-1003', '00000000-0000-0000-0000-000000000013', '33333333-3333-3333-3333-333333333004', 'INV-2043', 6000, 'SAR', 'Card', 'PENDING', NOW() - INTERVAL '10 days'),
  ('PAY-1004', '00000000-0000-0000-0000-000000000014', NULL, 'INV-2044', 499, 'SAR', 'Card', 'FAILED', NOW() - INTERVAL '12 days'),
  ('PAY-1005', '00000000-0000-0000-0000-000000000014', '33333333-3333-3333-3333-333333333003', 'INV-2045', 5500, 'SAR', 'Card', 'PAID', NOW() - INTERVAL '49 days');

INSERT INTO subscriptions (merchant_id, plan_id, status, start_date, renewal_date)
VALUES
  ('00000000-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111002', 'ACTIVE', CURRENT_DATE - 120, CURRENT_DATE + 10),
  ('00000000-0000-0000-0000-000000000011', '11111111-1111-1111-1111-111111111003', 'ACTIVE', CURRENT_DATE - 90, CURRENT_DATE + 20),
  ('00000000-0000-0000-0000-000000000014', '11111111-1111-1111-1111-111111111001', 'ACTIVE', CURRENT_DATE - 60, CURRENT_DATE + 5);

INSERT INTO notifications (merchant_id, user_id, title, title_ar, message, message_ar, type, read, sent_at)
VALUES
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000002',
   'Your application has been published', 'تم نشر تطبيقك',
   'ABC Store app is now live on Google Play and App Store.', 'تطبيق ABC Store متاح الآن على المتاجر.',
   'APP_ORDER', false, NOW() - INTERVAL '70 days'),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000002',
   'Your Zid store has been synchronized', 'تمت مزامنة متجر زد',
   '356 products and 1,245 orders were synced successfully.', 'تمت مزامنة 356 منتجاً و 1245 طلباً.',
   'SYNC', false, NOW() - INTERVAL '2 hours');

INSERT INTO platform_settings (key, value)
VALUES
  ('app_name', '"Zid App Platform"'::jsonb),
  ('default_currency', '"SAR"'::jsonb),
  ('support_email', '"support@zidplatform.com"'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Allow anon/authenticated read for dashboard demo (tighten later for production)
DROP POLICY IF EXISTS "Public read plans" ON subscription_plans;
CREATE POLICY "Public read plans" ON subscription_plans FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read merchants demo" ON merchants;
CREATE POLICY "Public read merchants demo" ON merchants FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read users demo" ON users;
CREATE POLICY "Public read users demo" ON users FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read app_orders demo" ON app_orders;
CREATE POLICY "Public read app_orders demo" ON app_orders FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read applications demo" ON applications;
CREATE POLICY "Public read applications demo" ON applications FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read payments demo" ON payments;
CREATE POLICY "Public read payments demo" ON payments FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read zid_stores demo" ON zid_stores;
CREATE POLICY "Public read zid_stores demo" ON zid_stores FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read notifications demo" ON notifications;
CREATE POLICY "Public read notifications demo" ON notifications FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read subscriptions demo" ON subscriptions;
CREATE POLICY "Public read subscriptions demo" ON subscriptions FOR SELECT TO anon, authenticated USING (true);

-- Demo write policies so Admin UI can create merchants with the publishable key
DROP POLICY IF EXISTS "Demo insert users" ON users;
CREATE POLICY "Demo insert users" ON users FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Demo update users" ON users;
CREATE POLICY "Demo update users" ON users FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Demo delete users" ON users;
CREATE POLICY "Demo delete users" ON users FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Demo insert merchants" ON merchants;
CREATE POLICY "Demo insert merchants" ON merchants FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Demo update merchants" ON merchants;
CREATE POLICY "Demo update merchants" ON merchants FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Demo delete merchants" ON merchants;
CREATE POLICY "Demo delete merchants" ON merchants FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Demo insert zid_stores" ON zid_stores;
CREATE POLICY "Demo insert zid_stores" ON zid_stores FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Demo update zid_stores" ON zid_stores;
CREATE POLICY "Demo update zid_stores" ON zid_stores FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
