# Gustia Technical Spec

Purpose:

- capture the implementation-facing details for the restaurant concierge product

Audience:

- maintainers
- coding agents

Status:

- active

Source of truth scope:

- admin dashboard data model
- owner auth assumptions
- restaurant storage fields

Last updated:

- 2026-04-03

Related docs:

- `SPEC.md`
- `SUPABASE_SCHEMA.md`
- `QUIZ_SPEC.md`
- `docs/UX_FLOW.md`

## Runtime Shape

- public guest chat reads restaurant data from Supabase `restaurants`
- owner admin pages live under `/admin/*`
- owner admin auth now uses Supabase Auth sessions, with both email/password and Google OAuth supported
- first-time owner auth automatically creates or claims an `owners` row plus a Supabase `restaurants` row linked through `restaurants.owner_id`
- restaurant content is stored in Supabase, not in the starter Prisma models
- public guest chat fetches a server-curated restaurant payload instead of relying on direct anon table reads

## Restaurant Record

Expected fields in `restaurants`:

- `id`
- `owner_id`
- `email`
- `name`
- `logo_url`
- `soul_md`
- `rules_md`
- `menu_json`
- `quiz_answers`
- `stripe_customer_id`
- `stripe_subscription_id`
- `subscription_status`
- `plan_name`
- `setup_paid_at`
- `billing_starts_at`
- `qr_code_url`
- `created_at`

## Admin Pages

- `/admin`: weekly conversation count, top questions, subscription status, recent conversations
- `/admin/analytics`: owner analytics dashboard with 7d / 30d / all-time filters, usage trends, top questions, language mix, and recommendation traction
- `/admin/menu`: CRUD editor for `menu_json.items`
- `/admin/quiz`: edit the 7 onboarding answers stored in `quiz_answers`
- `/admin/qr`: QR preview and download/share/print tools for `/chat/{restaurantId}?table=T{n}`
- `/admin/billing`: plan, dates, payment method preview, Stripe portal entry, latest invoices

## Current Boundaries

- owner auth protection is implemented with Supabase Auth cookies plus SSR middleware refresh
- owner data isolation is expected to be enforced through Supabase RLS on `owners`, `restaurants`, `conversations`, and `analytics` where present
- guest-safe restaurant reads are intentionally routed through the app server so restaurant tables do not need public `select` policies
- guest chat analytics storage should remain anonymized by design and only persist sanitized question text, response preview, language, timestamps, and conversation linkage
