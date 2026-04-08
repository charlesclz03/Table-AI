# Gustia Onboarding

Purpose:

- document the live owner onboarding and guest onboarding flows

Audience:

- maintainers
- coding agents

Status:

- active

Source of truth scope:

- guest language/theme onboarding and owner setup/training flow

Last updated:

- 2026-04-05

Related docs:

- `docs/UX_FLOW.md`
- `docs/SPEC.md`
- `docs/API.md`

## Guest Onboarding

The guest flow is:

1. scan the table QR code
2. open `/chat/[restaurantId]?table=Tn`
3. choose language
4. choose theme
5. enter chat

Implementation notes:

- language is stored in `sessionStorage` under `gustia-lang`
- theme is stored in `sessionStorage` under `gustia-theme`
- the guest onboarding is rendered by:
  - `/chat/[restaurantId]/onboarding/language`
  - `/chat/[restaurantId]/onboarding/theme`
- the active selector currently exposes four guest themes:
  - red
  - white
  - rose
  - green
- concierge voice previews use `/api/tts`
- if preview audio fails, the flow falls back to text-only preview

## Owner Onboarding

The owner setup path is now split across a few owner surfaces:

- `/auth/login`
  - pricing-aware sign-in or sign-up before checkout
- `/auth/checkout`
  - authenticated Stripe handoff
- `/admin/onboarding`
  - Google Maps import plus concierge training editor
- `/admin/menu`
  - manual menu editing and AI menu import
- `/admin/quiz`
  - seven-question owner voice and FAQ tuning
- `/admin/qr`
  - QR poster generation and download

## Concierge Training Workspace

`/admin/onboarding` lets the owner:

- paste a Google Maps URL
- import place metadata, hours, reviews, and photos
- review or edit restaurant identity fields
- review or edit recommendations, FAQs, signature dishes, and menu knowledge
- choose the default voice and theme
- generate and save `soul_md` and `rules_md`

The import helper is:

- `POST /api/admin/onboarding/import`

The save helper is:

- `PUT /api/admin/onboarding`

## Menu Setup

Menu setup can happen through either path:

- manual CRUD in `/admin/menu`
- AI-assisted photo/PDF parsing through `/api/menu/parse`

## Ownership Claiming

Owner onboarding is now invite-based for shared ownership:

- an existing owner creates a link from `/admin/invite`
- the invitee signs in with the exact invited email
- the invitee claims the restaurant from `/invite/[code]`

