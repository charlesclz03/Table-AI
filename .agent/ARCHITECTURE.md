# Gustia Architecture

Last updated: 2026-04-05

## Product Shape

Gustia is a Next.js 15 App Router application for restaurant owners and their guests.

- Public marketing site: `/`
- Owner auth and billing entry: `/auth/*`, `/admin/*`
- Guest concierge flow: `/chat/[restaurantId]`
- Guest onboarding flow: `/chat/[restaurantId]/onboarding/*`

## Core Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Supabase Auth + Postgres
- Stripe Checkout + Billing Portal
- OpenAI chat + TTS
- Prisma remains present for legacy starter surfaces and should not be treated as the primary product data source

## Runtime Boundaries

### Public browser

- Reads only public-safe restaurant profile data through `/api/restaurants/[restaurantId]`
- Sends only `restaurantId` to `/api/chat`
- Uses `/api/tts` for synthesized concierge audio
- Never receives `soul_md` or `rules_md`

### Server routes

- Build concierge prompts from server-fetched restaurant records
- Persist anonymized conversation analytics
- Enforce rate limits, origin checks, and payload caps on sensitive endpoints
- Write audit logs for sensitive operations and abuse blocks

### Owner admin

- Authenticates through Supabase Auth
- Reads and updates owner-scoped restaurant records through Supabase
- Uses Stripe customer and subscription ids stored on `restaurants`

## Data Ownership

### Source of truth

Operational product data lives in Supabase tables and SQL migrations under `docs/reference/supabase-owner-auth-migration.sql`.

### Key tables

- `owners`
- `restaurants`
- `conversations`
- `conversation_analytics`
- `restaurant_owner_invites`
- `audit_logs`
- `stripe_webhook_events`
- `billing_ledger`

### Public-safe projection

- `restaurant_public_profiles` is the public projection for guest onboarding and guest chat bootstrap
- Internal prompt fields stay on `restaurants` and are fetched only server-side

## Auth Model

### Owner lifecycle

1. Owner signs up with Supabase Auth
2. Email verification or OAuth callback completes
3. `ensureOwnerAccountForUser()` syncs the owner record
4. Restaurant claiming is invite-based, not email-based
5. If there is no valid invite, a fresh owner-scoped restaurant can be created

### Legacy auth

- `app/api/auth/[...nextauth]` and related Prisma/NextAuth code are legacy starter surfaces
- They should not be extended for Gustia feature work without an explicit migration plan

## Billing Model

- Checkout creates activation + subscription sessions in Stripe
- Webhooks persist idempotent event records in `stripe_webhook_events`
- Restaurant billing state is synced onto `restaurants`
- Every persisted billing mutation writes an append-only row to `billing_ledger`
- Admin billing UI reads current Stripe state plus stored restaurant billing fields

## Sensitive Routes

- `/api/chat`
- `/api/tts`
- `/api/menu/parse`
- `/api/auth/signup`
- `/api/auth/login`
- `/api/auth/logout`
- `/api/stripe/checkout`
- `/api/admin/billing/portal`

These routes should keep rate limiting, trusted-origin checks, payload caps, and audit logging.

## Important Directories

- `app/`: routes, pages, API handlers, loading and error surfaces
- `components/`: owner admin UI, auth UI, shared UI atoms
- `lib/admin/`: owner auth/session/account orchestration
- `lib/billing/`: Stripe customer and subscription persistence
- `lib/security/`: request guards and rate limiting
- `lib/audit/`: audit log persistence
- `lib/supabase/`: server/browser client helpers
- `docs/`: operational truth and handoff docs
- `.agent/`: local agent workflows, skills, and repo guidance

## Verification Baseline

Use these as the minimum local gates after risky changes:

- `npm run lint`
- `npm run type-check`
- `npm run test -- --run`
- `npm run build`

Then run browser smoke checks against:

- `/`
- `/auth/login`
- `/chat/demo`
- `/api/health`

## Current Risks To Watch

- Legacy NextAuth starter code is still present
- Stripe and audit tables require the Supabase SQL to be applied in the target project
- Invite issuance UI is not yet productized, so invite records may need to be created operationally until an admin flow exists
