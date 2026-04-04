# Gustia

Mobile-first restaurant AI concierge for QR-based table conversations.

Customers scan a QR code, choose language and theme, and talk to a restaurant-specific AI that can explain dishes, recommend wine, and answer menu questions using that restaurant's own data.

## Current Status

The repo now contains:

- owner-facing Lisbon-style landing page on `/`
- customer chat flow under `/chat/[restaurantId]`
- language and wine-theme onboarding
- dark glassmorphism mobile UI
- owner admin dashboard under `/admin`
- Google admin login through `/admin/login`
- first-login restaurant auto-provisioning through Supabase when Google auth is configured
- menu editor
- onboarding quiz editor
- QR poster studio
- billing overview with Stripe portal entry
- owner changelog feed in the admin dashboard
- public privacy, terms, and contact pages
- live production site on `https://www.gustia.wine`

The app currently builds successfully.

## Product Summary

Gustia is designed as a concierge layer for restaurants:

- customer scans QR at table
- AI answers questions about menu, wine, allergens, and recommendations
- owner manages menu, quiz answers, QR posters, and billing
- live marketing site and demo now publish on `https://www.gustia.wine`

Commercial model:

- founding offer: EUR 299 setup including first month
- after month one: EUR 49/month

## Confirmed Stack

- Next.js 15 App Router
- React 18
- TypeScript
- Tailwind CSS
- NextAuth
- Prisma
- Supabase
- Stripe
- OpenAI TTS with browser fallback

## Main App Areas

### Customer experience

- `/chat/[restaurantId]`
  Voice/text concierge with subtitles and restaurant-specific context.
- `/chat/[restaurantId]/onboarding/language`
  Language selector.
- `/chat/[restaurantId]/onboarding/theme`
  Theme selector.

### Owner dashboard

- `/admin`
  Dashboard home with conversation summary, top questions, and quick actions.
- `/admin/menu`
  Menu CRUD editor for `menu_json`.
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

- admin auth still uses the repo's existing NextAuth flow instead of Supabase Auth
- strict RLS owner isolation is not yet the primary enforcement path
- menu photo upload and AI parsing are still pending
- live owner analytics are still limited
- local Google login verification still depends on valid Google OAuth env vars and Supabase service-role access

## Recommended Next Steps

1. Migrate owner auth to Supabase Auth if product-spec parity is required.
2. Add strict RLS for `restaurants`, `conversations`, and analytics tables.
3. Build menu photo upload and parsing.
4. Expand analytics and owner insight surfaces.
