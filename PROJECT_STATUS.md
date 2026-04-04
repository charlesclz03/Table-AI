# Table IA Project Status

Last updated: 2026-04-03

## Overview

Table IA is a mobile-first restaurant AI concierge built for QR-to-chat table experiences.
Customers scan a QR code, choose language and theme, then talk to a restaurant-specific AI that answers from that restaurant's menu and owner-provided context.

The project now includes:

- a customer chat flow under `/chat/[restaurantId]`
- onboarding gates for language and wine-theme selection
- a restaurant owner admin area under `/admin`
- Supabase-backed restaurant data access
- Stripe-backed billing helpers and customer portal entry

## What Was Built

### Customer-facing app

- `app/chat/[restaurantId]/page.tsx`
  Real-time guest chat interface with voice/text interaction, subtitles, demo fallback, and CTA.
- `app/chat/[restaurantId]/onboarding/_layout.tsx`
  Shared mobile onboarding shell, wine sphere visuals, restaurant profile fetch, and theme/language helpers.
- `app/chat/[restaurantId]/onboarding/language/page.tsx`
  Language selection screen.
- `app/chat/[restaurantId]/onboarding/theme/page.tsx`
  Theme selection screen.

### Owner admin dashboard

- `app/admin/layout.tsx`
  Shared admin layout and shell.
- `app/admin/login/page.tsx`
  Owner login page using the current NextAuth Google flow.
- `app/admin/page.tsx`
  Dashboard home with quick stats, quick actions, and recent conversation preview.
- `app/admin/menu/page.tsx`
  Menu editor page.
- `app/admin/quiz/page.tsx`
  Onboarding quiz editor page.
- `app/admin/qr/page.tsx`
  QR poster studio page.
- `app/admin/billing/page.tsx`
  Billing and subscription page.

### Admin UI components

- `components/admin/AdminChrome.tsx`
- `components/admin/AdminPageShell.tsx`
- `components/admin/AdminSignInButton.tsx`
- `components/admin/AdminSignOutButton.tsx`
- `components/admin/EmptyRestaurantState.tsx`
- `components/admin/MenuEditor.tsx`
- `components/admin/QuizEditor.tsx`
- `components/admin/QrStudio.tsx`
- `components/admin/BillingPortalButton.tsx`

### Admin server/data layer

- `lib/admin/types.ts`
  Shared types for restaurants, menu items, quiz answers, conversations, dashboard stats, and billing.
- `lib/admin/server.ts`
  Server-side owner resolution, Supabase restaurant reads/writes, dashboard stat aggregation, and Stripe billing reads.

### API routes

- `app/api/admin/menu/route.ts`
  Saves `menu_json`.
- `app/api/admin/quiz/route.ts`
  Saves `quiz_answers`.
- `app/api/admin/billing/portal/route.ts`
  Creates Stripe customer portal sessions.
- `app/api/auth/[...nextauth]/route.ts`
  NextAuth entrypoint.
- `app/api/stripe/webhook/route.ts`
  Stripe webhook entrypoint.
- `app/api/onboarding/suggestions/route.ts`
  Existing onboarding suggestion endpoint.

### Project/spec docs already in repo

- `SPEC.md`
- `docs/SPEC.md`
- `docs/UI_DESIGN.md`
- `docs/UX_FLOW.md`
- `docs/V1_LIVE_INTERACTION.md`
- `docs/FEATURE_ASSESSMENT.md`
- `PRICING_DECISION.md`
- `docs/DESIGN_SKILLS_REFERENCE.md`

## Working vs Pending

### Working now

- guest QR-to-chat flow exists
- language selection exists
- theme selection exists
- mobile dark glassmorphism UI exists
- restaurant profile fetch from Supabase exists
- owner admin pages exist
- menu CRUD UI exists
- quiz editing UI exists
- QR poster preview, PNG download, print/PDF flow, and WhatsApp share exist
- billing overview page exists
- Stripe billing portal route exists
- production build passes

### Working with configured backend data

- owner dashboard stats when `restaurants` and `conversations` data exist in Supabase
- billing details and invoice history when Stripe customer data exists
- owner dashboard access when the signed-in Google email matches `restaurants.email`

### Pending or partial

- product-spec parity for Supabase Auth on `/admin/*`
- true RLS-enforced owner isolation as the primary protection model
- menu photo upload and AI parsing
- waiter handoff / order forwarding
- live owner dashboard or live replay
- richer analytics beyond current conversation-derived summaries
- first-party QR generation if the external QR service should be removed
- resolution of the existing React hook warning in `app/chat/[restaurantId]/page.tsx`

## Verification Status

Verified successfully:

- `npm run type-check`
- targeted eslint on `app/admin`, `app/api/admin`, `components/admin`, and `lib/admin`
- `npm run build`

Current known warning:

- `app/chat/[restaurantId]/page.tsx`
  `react-hooks/exhaustive-deps` warning for `submitMessage`

## Tech Stack Confirmed

- Next.js 15 App Router
- React 18
- TypeScript
- Tailwind CSS
- NextAuth
- Prisma
- Supabase SSR helpers and Supabase REST usage
- Stripe
- Web Speech API for voice input/output
- Vercel-oriented deployment setup

## Project Folder Structure

```text
Table IA/
├─ app/
│  ├─ admin/
│  │  ├─ billing/page.tsx
│  │  ├─ layout.tsx
│  │  ├─ login/page.tsx
│  │  ├─ menu/page.tsx
│  │  ├─ page.tsx
│  │  ├─ qr/page.tsx
│  │  └─ quiz/page.tsx
│  ├─ api/
│  │  ├─ admin/
│  │  │  ├─ billing/portal/route.ts
│  │  │  ├─ menu/route.ts
│  │  │  └─ quiz/route.ts
│  │  ├─ auth/[...nextauth]/route.ts
│  │  ├─ onboarding/suggestions/route.ts
│  │  └─ stripe/webhook/route.ts
│  ├─ chat/
│  │  └─ [restaurantId]/
│  │     ├─ onboarding/
│  │     │  ├─ _layout.tsx
│  │     │  ├─ language/page.tsx
│  │     │  └─ theme/page.tsx
│  │     └─ page.tsx
│  ├─ dashboard/page.tsx
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
├─ components/
│  ├─ admin/
│  ├─ atoms/
│  └─ ui/
├─ docs/
│  ├─ architecture/
│  ├─ integrations/
│  ├─ reference/
│  ├─ runbooks/
│  ├─ SPEC.md
│  ├─ UI_DESIGN.md
│  ├─ UX_FLOW.md
│  ├─ V1_LIVE_INTERACTION.md
│  └─ FEATURE_ASSESSMENT.md
├─ lib/
│  ├─ admin/
│  ├─ billing/
│  ├─ onboarding/
│  ├─ supabase/
│  ├─ stripe/
│  ├─ auth.ts
│  ├─ env.ts
│  └─ prisma.ts
├─ prisma/
│  └─ schema.prisma
├─ SPEC.md
├─ PRICING_DECISION.md
├─ README.md
└─ SESSION_SUMMARY.md
```

## Current Implementation Notes

- The product docs describe Supabase Auth + RLS as the target admin security model.
- The current implementation uses the existing repo auth system: NextAuth with Google.
- Owner lookup is done by matching `session.user.email` to `restaurants.email`.
- This is functional for now, but it is a known architecture gap versus the intended product spec.
