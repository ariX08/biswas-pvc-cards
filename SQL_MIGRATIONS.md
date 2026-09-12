# Optional SQL (run once in Supabase SQL editor)

```sql
ALTER TABLE business_settings
  ADD COLUMN IF NOT EXISTS free_delivery_min_quantity integer DEFAULT 10;

UPDATE business_settings
SET advance_percentage = 100
WHERE advance_percentage IS NULL OR advance_percentage = 50;

-- Ensure rejection_reason exists
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS rejection_reason text;
```

Vercel env for email (required for notifications to arrive):

```
EMAIL_USER=your-sending-gmail@gmail.com
EMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_TO=biswascybercafe0615@gmail.com
ADMIN_PASSWORD=...
```

Use a Gmail App Password (Google Account → Security → 2FA → App passwords), not the normal login password.
