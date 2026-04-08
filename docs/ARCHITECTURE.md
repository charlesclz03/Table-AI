# Gustia Architecture

Purpose:

- describe the real runtime architecture of the Gustia app

Audience:

- maintainers
- coding agents

Status:

- active

Source of truth scope:

- current product runtime, trust boundaries, and major service flows

Last updated:

- 2026-04-05

Related docs:

- `docs/API.md`
- `docs/SPEC.md`
- `SUPABASE_SCHEMA.md`
- `docs/integrations/stripe.md`

## Stack

- Next.js 15 App Router
- React 18
- TypeScript
- Tailwind CSS
- Supabase Auth and Postgres
- Stripe
- OpenAI chat and TTS

## Product Surfaces

- public marketing and pricing: `/`
- owner auth and checkout gate: `/auth/login`, `/auth/checkout`, `/auth/callback`
- owner admin: `/admin/*`
- guest chat: `/chat/[restaurantId]`
- guest onboarding: `/chat/[restaurantId]/onboarding/*`
- owner invite claim: `/invite/[code]`

## Auth Model

### Live Product Path

- Gustia owner auth is powered by Supabase Auth
- server-side session refresh runs through the project `middleware.ts`
- owner session cookies are read in server components and route handlers
- owner identity is mirrored into `public.owners`
- restaurant ownership is enforced through `restaurants.owner_id`

### Legacy Repo Surface

- the repo still contains a generic NextAuth route and Prisma auth schema
- that surface is no longer the primary owner-admin product path
- treat it as legacy starter scaffolding until it is intentionally removed

## Data Model

### Product Tables

- `owners`
- `restaurants`
- `conversations`
- `conversation_analytics`
- `restaurant_owner_invites`
- `audit_logs`
- `stripe_webhook_events`
- `billing_ledger`

### Public Projection

- guests do not read the full `restaurants` row directly
- `/api/restaurants/[restaurantId]` reads from `restaurant_public_profiles`
- this keeps the guest bootstrap payload small and avoids relaxing owner RLS on the main table

## Chat Flow

1. Guest opens `/chat/[restaurantId]`.
2. Guest onboarding stores language and theme in `sessionStorage`.
3. The client fetches the guest-safe restaurant payload from `/api/restaurants/[restaurantId]`.
4. The client sends only `restaurantId`, `messages`, `language`, and `tableNumber` to `/api/chat`.
5. `/api/chat` loads prompt context from Supabase on the server.
6. OpenAI `gpt-4o-mini` generates the reply.
7. The route stores the full conversation snapshot and anonymized analytics metadata.
8. The client plays reply audio through `/api/tts`, with browser fallback if needed.

## Owner Admin Flow

1. Owner signs in through Supabase Auth.
2. The app ensures an `owners` row exists for the signed-in Supabase user.
3. The app loads the restaurant linked by `restaurants.owner_id`.
4. Admin pages read and write owner-scoped data through Supabase.
5. Invite claiming uses `restaurant_owner_invites` to link new co-owners safely.

## Billing Flow

1. Owner chooses a plan on `/`.
2. Owner signs in or signs up on `/auth/login`.
3. `/auth/checkout` starts Stripe Checkout.
4. `/api/stripe/checkout` creates an activation-plus-subscription session.
5. Stripe sends webhooks to `/api/stripe/webhook`.
6. Webhook handlers update restaurant billing state and append billing ledger rows.
7. Owners manage invoices and payment methods from `/admin/billing` through `/api/admin/billing/portal`.

## Analytics Flow

- `/api/chat` writes guest conversation snapshots into `conversations`
- `/api/chat` also writes anonymized question metadata into `conversation_analytics`
- `/api/admin/analytics` aggregates those rows for owner dashboards
- the owner analytics surface intentionally avoids storing guest identities

## Security Boundaries

- request guards apply trusted-origin checks to sensitive mutation routes
- per-route payload caps reduce abuse and accidental oversized requests
- per-IP in-memory rate limits guard auth, billing, chat, TTS, and parsing routes
- audit-log hooks record sensitive ownership and abuse events
- owner-facing reads depend on Supabase RLS and `owner_id` linkage

## Known External Blocker

- Google OAuth code exists and is wired through Supabase Auth
- live production Google sign-in still depends on enabling the Google provider and setting valid client credentials in Supabase Auth

