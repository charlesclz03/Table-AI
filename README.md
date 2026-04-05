# Gustia

Mobile-first restaurant AI concierge for QR-based table conversations.

Customers scan a QR code, choose language and theme, and talk to a restaurant-specific AI that can explain dishes, recommend wine, and answer menu questions using that restaurant's own data.

## Current Status

The repo now contains:

- owner-facing Lisbon-style landing page on `/`
- public pricing auth flow through `/auth/login` and `/auth/checkout` before Stripe Checkout
- customer chat flow under `/chat/[restaurantId]`
- language and orbital wine-theme onboarding
- azulejos-only background layer with glassmorphism UI surfaces and tinted CTAs
- owner admin dashboard under `/admin`
- Supabase owner auth through `/admin/login` with email/password and Google OAuth
- public plan selection now signs the owner in before Stripe so Checkout stays tied to the right account email
- first-login owner and restaurant auto-provisioning through Supabase when the owner SQL migration and service-role env are configured
- menu editor with AI menu photo import
- concierge training workspace with Google Maps import and generated markdown
- onboarding quiz editor
- QR poster studio
- billing overview with Stripe portal entry
- owner changelog feed in the admin dashboard
- owner analytics dashboard in the admin area
- owner invite management on `/admin/invite` with public claim links on `/invite/[code]`
- server-fetched guest chat context so concierge prompts are no longer client-controlled
- invite-based owner restaurant claiming with audit-log support for sensitive account changes
- shared API abuse protection for auth, chat, TTS, menu parsing, and billing routes
- persisted Stripe webhook state plus a billing ledger for reliable checkout and subscription syncing
- public privacy, terms, and contact pages
- live production site on `https://www.gustia.wine`

The app currently builds successfully.

## Product Summary

Gustia is designed as a concierge layer for restaurants:

- customer scans QR at table
- AI answers questions about menu, wine, allergens, and recommendations
- owner manages menu, quiz answers, QR posters, and billing
- owner can bootstrap a demo by importing Google Maps data and generating `soul.md` plus `rules.md`
- live marketing site and demo now publish on `https://www.gustia.wine`

Commercial model:

- activation: EUR 99
- then EUR 49/month or EUR 470/year
- payment flow: choose plan, sign in, then continue to Stripe Checkout

## Confirmed Stack

- Next.js 15 App Router
- React 18
- TypeScript
- Tailwind CSS
- Prisma
- Supabase
- Stripe
- OpenAI TTS with browser fallback

Active runtime auth and restaurant data now rely on Supabase. Legacy NextAuth starter code is still present in the repo, but it is no longer the primary product auth path.

## Main App Areas

### Customer experience

- `/chat/[restaurantId]`
  Voice/text concierge with subtitles and restaurant-specific context.
- `/chat/[restaurantId]/onboarding/language`
  Language selector.
- `/chat/[restaurantId]/onboarding/theme`
  Orbital theme selector with swipe, directional sphere motion, and voice preview.

### Owner dashboard

- `/admin`
  Dashboard home with conversation summary, top questions, and quick actions.
- `/admin/menu`
  Menu CRUD editor for `menu_json`.
- `/admin/onboarding`
  Google Maps import, concierge training editor, and markdown generation for fast demos.
- `/admin/quiz`
  Quiz editor for owner answers and FAQs.
- `/admin/qr`
  QR preview, download, share, and print flow.
- `/admin/billing`
  Billing status, invoices, and Stripe portal access.
- `/admin/changelog`
  Owner-facing release feed with versioned features, fixes, and improvements.

## How To Run

Install dependencies:

```bash
npm install
```

Start local development:

```bash
npm run dev
```

Run type-check:

```bash
npm run type-check
```

Run lint:

```bash
npm run lint
```

Run tests:

```bash
npm run test
```

Run Playwright tests:

```bash
npm run test:e2e
```

Build production:

```bash
npm run build
```

## Key Environment Areas

You will typically need configuration for:

- NextAuth
- Supabase
- Stripe
- Prisma / Postgres
- production site URL (`https://www.gustia.wine`)

See:

- `docs/README.md`
- `docs/reference/PATCH_NOTES.md`
- `docs/progress-log.md`
- `docs/session-log.md`
- `docs/next-session-handoff.md`
- `docs/reference/env-vars.md`
- `docs/runbooks/local-development.md`
- `docs/runbooks/release.md`
- `docs/reference/commands.md`

## Release Discipline

Before `/deploy`, review the release diff and update every impacted doc in the same session.

The minimum release-tracking set to review is:

- `README.md`
- `docs/README.md`
- `lib/changelog.ts`
- `docs/reference/PATCH_NOTES.md`
- `docs/progress-log.md`
- `docs/session-log.md`
- `docs/next-session-handoff.md`

If commands, env requirements, verification steps, product behavior, or workflow contracts changed, update the matching docs before release instead of leaving them stale.

## Important Docs

- `docs/README.md`
- `docs/reference/PATCH_NOTES.md`
- `docs/next-session-handoff.md`
- `docs/progress-log.md`
- `docs/session-log.md`
- `docs/SPEC.md`
- `docs/UI_DESIGN.md`
- `docs/UX_FLOW.md`
- `docs/V1_LIVE_INTERACTION.md`
- `docs/FEATURE_ASSESSMENT.md`

## Current Known Gaps

- Google OAuth is still disabled in live Supabase Auth because production does not yet have a Google client ID and client secret configured
- the Stripe checkout flow now opens again in production, but one full test-card payment and redirect-to-success pass still needs to be completed
- live production verification of the orbital onboarding swipe flow still needs a real-device pass
- live owner analytics and Google Maps onboarding still need broader authenticated production smoke coverage beyond the focused launch checks

## Recommended Next Steps

1. Add the missing Google OAuth credentials to live Supabase Auth and re-test the Google owner login flow end to end.
2. Complete one full live test-card payment in Stripe Checkout and confirm the redirect to the admin success state.
3. Live-smoke the guest onboarding theme selector and voice previews on a real mobile device.
4. Live-smoke the owner onboarding and analytics routes with a real restaurant account in production.
5. Remove or downgrade any leftover NextAuth-only starter references once the broader starter no longer needs them.
