-- =============================================================================
-- Merchant support tickets
-- Run in Supabase SQL Editor AFTER merchants / users exist
-- =============================================================================

CREATE TABLE IF NOT EXISTS support_tickets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id     UUID REFERENCES merchants (id) ON DELETE SET NULL,
  user_id         UUID REFERENCES users (id) ON DELETE SET NULL,
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  subject         TEXT NOT NULL,
  category        TEXT NOT NULL DEFAULT 'GENERAL',
  message         TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'OPEN', -- OPEN | IN_PROGRESS | RESOLVED | CLOSED
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_merchant
  ON support_tickets (merchant_id);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status
  ON support_tickets (status);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Demo read support_tickets" ON support_tickets;
CREATE POLICY "Demo read support_tickets" ON support_tickets
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Demo write support_tickets" ON support_tickets;
CREATE POLICY "Demo write support_tickets" ON support_tickets
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
