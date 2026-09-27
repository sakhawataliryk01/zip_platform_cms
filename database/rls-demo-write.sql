-- Allow admin UI (anon/publishable key) to create merchants during development.
-- Run this in Supabase SQL Editor if create merchant fails with RLS.

DROP POLICY IF EXISTS "Demo insert users" ON users;
CREATE POLICY "Demo insert users" ON users
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Demo update users" ON users;
CREATE POLICY "Demo update users" ON users
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Demo delete users" ON users;
CREATE POLICY "Demo delete users" ON users
  FOR DELETE TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Demo insert merchants" ON merchants;
CREATE POLICY "Demo insert merchants" ON merchants
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Demo update merchants" ON merchants;
CREATE POLICY "Demo update merchants" ON merchants
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Demo delete merchants" ON merchants;
CREATE POLICY "Demo delete merchants" ON merchants
  FOR DELETE TO anon, authenticated
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
