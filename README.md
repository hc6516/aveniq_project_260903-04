# AVENIQ launch page

Rebuilt Next.js 16.3.4 / React 19.2.8 landing page. Not a CU-affiliated store. Product artwork is a concept. No checkout, coupon issuance or messaging provider is implemented.

## Run

Use Node.js 22+ and pnpm 11.19.0. Run `pnpm install --frozen-lockfile`, `pnpm test`, `pnpm build`, then `pnpm start`.

## Privacy-first launch gate

By default **no personal data is accepted**. Inputs are disabled and POST /api/signup returns 503 before parsing the body or contacting Supabase. This is intentional because operator name, contact and retention period are unconfirmed.

Before opening collection, complete and review /privacy, /marketing and /terms, verify cross-border processing details and legal basis, choose a retention/deletion workflow, implement production-grade abuse/rate limiting, and test withdrawal procedures. Current basic validation/origin checks/honeypot are not a complete anti-abuse system. The public INSERT policy permits omitted name/email; email consent requires an email address. Review direct Data API abuse prevention before launch.

Set environment variables from .env.example in Vercel only after review. PRIVACY_REVIEWED=true is an explicit operator approval, not a guarantee of legal compliance. SIGNUPS_ENABLED=true additionally requires operator/contact/retention and Supabase configuration. SITE_URL must be the exact trusted production origin. Do not expose keys in NEXT_PUBLIC_* variables. Use a publishable key; never a service_role key for this endpoint.

Supabase target: existing `public.launch_signups`. The API writes only existing fields and preserves INSERT-only RLS. The INSERT policy was updated for optional email and no name collection; existing rows and columns are preserved. Default metadata prevents indexing while launch preparation is incomplete.

## Verification

`pnpm test` covers gate behavior, input validation, consent records, origin/body limits and DB error sanitization. DB success is mocked: no fake leads are written during tests. Confirm a real, authorized test separately before opening collection.
