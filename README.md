# Table IA

Mobile-first restaurant AI concierge for QR-based table conversations.

Customers scan a QR code, choose language and theme, and talk to a restaurant-specific AI that can explain dishes, recommend wine, and answer menu questions using that restaurant's own data.

## Current Status

The repo now contains:

- customer chat flow under `/chat/[restaurantId]`
- language and wine-theme onboarding
- dark glassmorphism mobile UI
- owner admin dashboard under `/admin`
- menu editor
- onboarding quiz editor
- QR poster studio
- billing overview with Stripe portal entry

The app currently builds successfully.

## Product Summary

Table IA is designed as a concierge layer for restaurants:

- customer scans QR at table
- AI answers questions about menu, wine, allergens, and recommendations
- owner manages menu, quiz answers, QR posters, and billing

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
- Web Speech API

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

See:

- `docs/reference/env-vars.md`
- `docs/runbooks/local-development.md`
- `docs/reference/commands.md`

## Important Docs

- `SPEC.md`
- `docs/SPEC.md`
- `docs/UI_DESIGN.md`
- `docs/UX_FLOW.md`
- `docs/V1_LIVE_INTERACTION.md`
- `docs/FEATURE_ASSESSMENT.md`
- `PRICING_DECISION.md`
- `PROJECT_STATUS.md`
- `SESSION_SUMMARY.md`

## Current Known Gaps

- admin auth still uses the repo's existing NextAuth flow instead of Supabase Auth
- strict RLS owner isolation is not yet the primary enforcement path
- menu photo upload and AI parsing are still pending
- live owner analytics are still limited
- one existing React hook warning remains in `app/chat/[restaurantId]/page.tsx`

## Recommended Next Steps

1. Migrate owner auth to Supabase Auth if product-spec parity is required.
2. Add strict RLS for `restaurants`, `conversations`, and analytics tables.
3. Build menu photo upload and parsing.
4. Expand analytics and owner insight surfaces.
5. Resolve the remaining chat lint warning.
