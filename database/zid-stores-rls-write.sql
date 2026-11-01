-- Ensure anon/publishable key can insert/update zid_stores (OAuth callback uses it).
-- Run in Supabase SQL Editor if Activate succeeds but table stays empty.

DROP POLICY IF EXISTS "Public read zid_stores demo" ON zid_stores;
CREATE POLICY "Public read zid_stores demo" ON zid_stores
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Demo insert zid_stores" ON zid_stores;
CREATE POLICY "Demo insert zid_stores" ON zid_stores
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Demo update zid_stores" ON zid_stores;
CREATE POLICY "Demo update zid_stores" ON zid_stores
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Demo merchant must exist (FK). Re-create if missing:
INSERT INTO merchants (id, user_id, business_name, category, phone, country, city, status)
SELECT
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000002',
  'ABC Store',
  'Fashion',
  '+966500000001',
  'Saudi Arabia',
  'Riyadh',
  'ACTIVE'
WHERE EXISTS (
  SELECT 1 FROM users WHERE id = '00000000-0000-0000-0000-000000000002'
)
AND NOT EXISTS (
  SELECT 1 FROM merchants WHERE id = '00000000-0000-0000-0000-000000000010'
);
