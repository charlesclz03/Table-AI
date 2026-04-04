# Table IA Technical Spec

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
- owner lookup currently maps the signed-in NextAuth Google email to `restaurants.email`
- restaurant content is stored in Supabase, not in the starter Prisma models

## Restaurant Record

Expected fields in `restaurants`:

- `id`
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
- `/admin/menu`: CRUD editor for `menu_json.items`
- `/admin/quiz`: edit the 7 onboarding answers stored in `quiz_answers`
- `/admin/qr`: QR preview and download/share/print tools for `/chat/{restaurantId}?table=T{n}`
- `/admin/billing`: plan, dates, payment method preview, Stripe portal entry, latest invoices

## Current Boundaries

- auth protection is implemented with the current NextAuth session layer
- data isolation is enforced in the app layer by restaurant email matching
- Supabase Auth + strict RLS parity with the product spec is still a follow-up step
