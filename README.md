# Biswas PVC Cards

E-commerce site for PVC card printing (Kolkata / West Bengal).

**Live:** https://biswaspvccards.vercel.app  
**Repo:** https://github.com/ariX08/biswas-pvc-cards

## Stack

- Next.js 16 App Router + TypeScript
- Tailwind CSS v4
- Supabase Postgres + Storage
- IndexedDB cart (guest checkout)
- Nodemailer (Gmail) for order emails

## Setup

1. Copy `.env.example` → `.env.local` and fill values
2. `npm install && npm run dev`
3. Run SQL in `SQL_MIGRATIONS.md` on Supabase if columns are missing

## Key features

- Guest checkout (no account required)
- Prices from DB only; full payment default (admin-configurable %)
- Free delivery when order qty ≥ threshold (default 10)
- Admin can reject any non-terminal order with reason + timeline timestamps
- Signed HMAC admin session (12h), rate-limited login, CSRF Origin check

See `PROJECT_CONTEXT.txt` and `SECURITY_ANALYSIS.md` for full details.
