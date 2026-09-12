# Security Analysis — Biswas PVC Cards

## Authentication
- Admin session: signed HMAC cookie (`expiry.hmac`), 12h expiry, httpOnly
- Login rate limit: 5/min/IP
- CSRF: Origin host check on mutating admin APIs

## Data integrity
- Order prices recomputed from `card_types` on server
- Business settings only from DB
- Non-sequential order numbers (`PVC-YYYY-XXXXXXXX`)
- Reject requires reason; blocked for REJECTED/CANCELLED/COMPLETED

## Storage
- Order PDFs in private bucket; admin-only download

## Headers
- X-Frame-Options DENY, nosniff, strict-origin-when-cross-origin

## Env
Never expose SUPABASE_SERVICE_ROLE_KEY or ADMIN_PASSWORD to the browser.
