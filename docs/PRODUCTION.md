# Production launch checklist

Code-side launch safeguards are included, but the following environment and account
work must be completed by the store owner before accepting real orders.

## Vercel storefront

- Set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS domain.
- Set `API_ORIGIN` to the HTTPS backend origin.
- Connect the public Blob store and set a newly rotated `BLOB_READ_WRITE_TOKEN`.
- Fill every `NEXT_PUBLIC_COMPANY_*` field and `NEXT_PUBLIC_SUPPORT_EMAIL` with legal values.
- Keep `CATALOG_FALLBACK_ENABLED=false` so production never shows demo products.

## Backend

- Use a managed PostgreSQL database with SSL and backups.
- Generate a unique high-entropy `JWT_SECRET`; never reuse the example value.
- Set `CORS_ALLOWED_ORIGINS` to only the canonical storefront origin.
- Set `COOKIE_SECURE=true`, `COOKIE_SAME_SITE=Lax` and the canonical `STOREFRONT_URL`.
- Configure shipping fees and reservation duration for the business.
- Verify a sending domain in Resend; then set `RESEND_API_KEY` and `EMAIL_FROM`.

## External/manual checks

- Have the privacy notice, terms, distance-sales agreement and returns text reviewed
  against the real company details and business process.
- Run a real-device checkout, admin fulfillment, e-mail and mobile layout acceptance test.
- Add iyzico credentials only when implementing the verified Checkout Form callback/retrieve
  adapter. Until then the UI creates a pending order but cannot collect money.
- Configure uptime/error monitoring and database-backup alerts in the hosting accounts.
