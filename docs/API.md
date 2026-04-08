# Gustia API Reference

Purpose:

- document the live HTTP routes that power the Gustia product

Audience:

- maintainers
- coding agents

Status:

- active

Source of truth scope:

- application route handlers under `app/api/`

Last updated:

- 2026-04-05

Related docs:

- `docs/ARCHITECTURE.md`
- `docs/SPEC.md`
- `docs/ONBOARDING.md`
- `docs/integrations/stripe.md`

## Public and Guest Routes

### `POST /api/chat`

- purpose: generate a concierge reply for a guest conversation
- input:
  - `restaurantId`
  - `messages`
  - `language`
  - `conversationId` optional
  - `tableNumber` optional
- behavior:
  - validates and trims guest messages
  - loads `name`, `soul_md`, `rules_md`, and `menu_json` for the restaurant on the server
  - calls OpenAI `gpt-4o-mini`
  - persists the conversation snapshot in `conversations`
  - inserts anonymized analytics metadata into `conversation_analytics`
- protection:
  - trusted-origin check
  - payload cap
  - per-IP rate limit

### `POST /api/tts`

- purpose: synthesize concierge voice replies and onboarding previews
- input:
  - `text`
  - `voice` optional
- behavior:
  - calls OpenAI `tts-1-hd`
  - returns `audio/mpeg`
- protection:
  - trusted-origin check
  - payload cap
  - per-IP rate limit

### `GET /api/restaurants/[restaurantId]`

- purpose: return the public-safe guest bootstrap payload for a restaurant
- behavior:
  - validates the UUID route param
  - reads from `restaurant_public_profiles`
  - returns only `id`, `name`, `menu_json`, and `subscription_status`
- note:
  - guests do not read directly from the full `restaurants` row

### `GET /api/health`

- purpose: return runtime integration status for the project
- behavior:
  - returns integration status for auth, database, Supabase, Stripe, InsForge, and auth-secret readiness

## Owner Auth Routes

### `POST /api/auth/login`

- purpose: sign an owner in with email/password or Google OAuth through Supabase Auth
- input:
  - `email` and `password`, or
  - `provider: "google"`
  - `next` optional
- behavior:
  - password path signs in through Supabase Auth
  - Google path returns the OAuth redirect URL
  - successful auth ensures an `owners` row exists and attempts owner bootstrap
- protection:
  - trusted-origin check
  - payload cap
  - per-IP rate limit

### `POST /api/auth/signup`

- purpose: create an owner account through Supabase Auth
- input:
  - `email`
  - `password`
  - `name` optional
  - `provider: "google"` optional
  - `next` optional
- behavior:
  - password path signs the owner up through Supabase Auth
  - Google path returns the OAuth redirect URL
  - writes audit-log metadata for signups
- protection:
  - trusted-origin check
  - payload cap
  - per-IP rate limit

### `POST /api/auth/logout`

- purpose: sign the current owner out of Supabase Auth
- protection:
  - trusted-origin check
  - payload cap
  - per-IP rate limit

### `GET|POST /api/auth/[...nextauth]`

- purpose: legacy NextAuth surface still present in the repo
- note:
  - this is no longer the primary Gustia owner-admin auth path

## Owner Admin Routes

### `PUT /api/admin/menu`

- purpose: save the owner restaurant menu into `restaurants.menu_json`
- behavior:
  - requires an authenticated owner restaurant context
  - validates and normalizes menu items before save

### `POST /api/menu/parse`

- purpose: parse uploaded menu images or PDFs with OpenAI
- input:
  - multipart upload under `file`, `files`, or `files[]`
- behavior:
  - supports PDF, JPG, PNG, and WebP
  - extracts dishes, prices, categories, descriptions, and allergens
  - returns deduped draft items plus parser notes
- protection:
  - trusted-origin check
  - payload cap
  - per-IP rate limit

### `PUT /api/admin/quiz`

- purpose: save the seven owner quiz answers
- behavior:
  - writes to `restaurants.quiz_answers`

### `PUT /api/admin/onboarding`

- purpose: save the concierge training workspace
- behavior:
  - accepts restaurant identity, Google Maps metadata, FAQs, recommendations, menu items, voice, and theme settings
  - regenerates `soul_md` and `rules_md`
  - writes top-level restaurant fields plus `quiz_answers.concierge_training`

### `POST /api/admin/onboarding/import`

- purpose: import a restaurant draft from a Google Maps URL
- behavior:
  - resolves the place
  - scrapes details, hours, reviews, and photos
  - optionally scans Google Maps photos for menu clues with OpenAI
  - returns an editable concierge training draft plus generated markdown

### `GET /api/admin/analytics`

- purpose: return owner analytics for the current restaurant
- query:
  - `range=7|30|all`
- behavior:
  - returns totals, usage-by-day, top questions, engagement metrics, peak usage, language mix, and popular dishes

### `POST /api/admin/billing/portal`

- purpose: create a Stripe billing portal session for the current owner restaurant
- protection:
  - trusted-origin check
  - payload cap
  - per-IP rate limit

### `GET /api/changelog`

- purpose: return the owner-facing changelog feed
- behavior:
  - mirrors `lib/changelog.ts`

## Billing Routes

### `POST /api/stripe/subscribe?plan=monthly|annual`

- purpose: create the authenticated owner Stripe Checkout session
- behavior:
  - requires the owner restaurant context
  - charges the EUR 99 activation amount today
  - starts the monthly or annual subscription after the activation delay
  - persists the Stripe customer id on the restaurant
- protection:
  - trusted-origin check
  - payload cap
  - per-IP rate limit

### `POST /api/stripe/checkout?plan=monthly|annual`

- purpose: compatibility alias for the authenticated owner Stripe Checkout session

### `POST /api/stripe/webhook`

- purpose: receive Stripe webhook events
- behavior:
  - verifies the raw signature
  - records idempotent webhook event rows in `stripe_webhook_events`
  - updates restaurant billing state
  - appends billing ledger rows in `billing_ledger`

## Internal Helper Routes

### `POST /api/onboarding/suggestions`

- purpose: generate onboarding suggestions from workspace docs and optional field inputs
- behavior:
  - uses heuristics first
  - enriches with InsForge when configured
