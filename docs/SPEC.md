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

- 2026-04-08

Related docs:

- `SPEC.md`
- `SUPABASE_SCHEMA.md`
- `QUIZ_SPEC.md`
- `docs/UX_FLOW.md`

## Runtime Shape

- public guest chat reads a guest-safe restaurant payload through `/api/restaurants/[restaurantId]`, backed by the `restaurant_public_profiles` projection
- owner admin pages live under `/admin/*`
- owner admin auth now uses Supabase Auth sessions, with both email/password and Google OAuth supported
- public pricing now routes owners through `/auth/login` and `/auth/checkout` before Stripe Checkout opens, so the selected plan and authenticated email stay aligned
- first-time owner auth automatically creates or claims an `owners` row plus a Supabase `restaurants` row linked through `restaurants.owner_id`
- owner onboarding now includes `/admin/onboarding`, which can import Google Maps place data, generate editable concierge training fields, and write fresh `soul_md` plus `rules_md`
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
- `quiz_answers.concierge_training` stores Google Maps-derived bootstrap metadata such as address, phone, hours, recommendations, FAQs, photo URLs, theme, and voice defaults
- `stripe_customer_id`
- `stripe_subscription_id`
- `subscription_status`
- `plan_name`
- `setup_paid_at`
- `billing_starts_at`
- `qr_code_url`
- `created_at`

## Subscriptions Table

The `public.subscriptions` table tracks Stripe subscription state per restaurant:

- `id` (uuid, PK)
- `restaurant_id` (uuid, FK → restaurants)
- `user_id` (uuid, FK → owners)
- `stripe_customer_id` (text)
- `stripe_subscription_id` (text, unique)
- `plan` (text check: 'monthly' | 'annual' | 'free')
- `status` (text check: 'active' | 'past_due' | 'cancelled' | 'trialing' | 'incomplete')
- `current_period_start` (timestamptz)
- `current_period_end` (timestamptz)
- `cancel_at_period_end` (boolean)
- `created_at` / `updated_at` (timestamptz)

RLS: owners can select/update their own subscriptions; service_role has full access.

Webhook handlers in `lib/billing/subscriptions.ts` keep this table in sync with Stripe events.

## Admin Pages

- `/admin`: weekly conversation count, top questions, subscription status, recent conversations
- `/admin/analytics`: owner analytics dashboard with 7d / 30d / all-time filters, usage trends, top questions, language mix, and recommendation traction
- `/admin/onboarding`: Google Maps import plus editable concierge-training workspace for restaurant identity, greeting, personality, languages, recommendations, FAQs, markdown previews, and save-back
- `/admin/menu`: CRUD editor for `menu_json.items`
- `/admin/quiz`: edit the 7 onboarding answers stored in `quiz_answers`
- `/admin/qr`: QR preview and download/share/print tools for `/chat/{restaurantId}?table=T{n}`
- `/admin/billing`: plan, dates, payment method preview, Stripe portal entry, latest invoices
- public pricing entry: `/` -> `/auth/login?plan=monthly|annual` -> `/auth/checkout?plan=monthly|annual` -> Stripe Checkout -> `/admin/dashboard` -> `/admin`

## Current Boundaries

- owner auth protection is implemented with Supabase Auth cookies plus SSR middleware refresh
- owner data isolation is expected to be enforced through Supabase RLS on `owners`, `restaurants`, `conversations`, `conversation_analytics`, and related owner tables where present
- guest-safe restaurant reads are intentionally routed through the app server so restaurant tables do not need public `select` policies
- guest chat analytics storage should remain anonymized by design and only persist sanitized question text, response preview, language, timestamps, and conversation linkage
