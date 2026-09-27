# Zid App Platform

SaaS Merchant & Mobile App Management Platform built with Next.js.

## Features

- Admin & Merchant dashboards
- English (LTR) + Arabic (RTL) via `next-intl`
- Session-based authentication with RBAC
- Mock Zid integration layer (ready for real API)
- Supabase-ready PostgreSQL schema

## Getting started

```bash
npm install
cp .env.example .env.local
# Fill Supabase keys in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts

| Role     | Email                   | Password      |
|----------|-------------------------|---------------|
| Admin    | admin@zidplatform.com   | Password123!  |
| Merchant | merchant@example.com    | Password123!  |

## Database

Run the full schema in Supabase SQL Editor:

```text
database/schema.sql
```

After the schema is applied, set `NEXT_PUBLIC_USE_MOCK_DATA=false` when you wire live queries.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- next-intl (EN/AR + RTL)
- Supabase
- React Hook Form / Zod (forms)
- Recharts
- Lucide icons

## Architecture

```text
YOUR PLATFORM
     │
ADMIN PANEL ─── MERCHANT PANEL
     │
YOUR BACKEND
     │
Zid API Layer (src/lib/zid/zidService.ts)
     │
    ZID
```
