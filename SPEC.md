# Gustia Product Spec

Last updated: 2026-04-05

## What It Is

Gustia is a mobile-first AI concierge for restaurants.

Guests scan a table QR code, choose language and theme, and talk to a restaurant-specific assistant that answers from the restaurant's own menu and training data.

Owners authenticate into an admin console where they can manage menu data, concierge training, QR posters, billing, analytics, invites, and release visibility.

## Live Product Surface

### Guest Side

- `/chat/[restaurantId]`
- `/chat/[restaurantId]/onboarding/language`
- `/chat/[restaurantId]/onboarding/theme`
- voice plus text chat
- OpenAI TTS voice output with browser fallback
- subtitles
- demo fallback mode
- demo CTA after three guest messages

### Owner Side

- `/auth/login`
- `/auth/checkout`
- `/admin`
- `/admin/menu`
- `/admin/onboarding`
- `/admin/quiz`
- `/admin/qr`
- `/admin/billing`
- `/admin/analytics`
- `/admin/invite`
- `/admin/changelog`

## Current Commercial Offer

- activation: EUR 99
- monthly: EUR 49/month
- annual: EUR 470/year
- guarantee: 14-day retraction rights

## Runtime Model

- owner auth uses Supabase Auth
- owner identity is mirrored into `public.owners`
- owner restaurant access is linked through `restaurants.owner_id`
- guest bootstrap data is served through `/api/restaurants/[restaurantId]`
- guest chat prompt context is fetched on the server inside `/api/chat`
- Stripe billing state is synced through webhook persistence and a billing ledger

## Core Product Data

### `restaurants`

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

### Supporting Product Tables

- `owners`
- `conversations`
- `conversation_analytics`
- `restaurant_owner_invites`
- `audit_logs`
- `stripe_webhook_events`
- `billing_ledger`
- `restaurant_public_profiles` view

## Current Boundaries

- waiter handoff and POS forwarding are still future work
- Google OAuth code exists, but live production still depends on configuring the Google provider in Supabase Auth
- the repo still carries legacy NextAuth and Prisma starter surfaces, but Gustia's live owner-admin path is Supabase-first

