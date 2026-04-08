# Gustia Project Status

Last updated: 2026-04-05

## Overview

Gustia is a live restaurant AI concierge product built on Next.js, Supabase, Stripe, and OpenAI.

The shipped app now includes:

- public landing and pricing flow
- Supabase owner auth
- authenticated Stripe checkout handoff
- guest chat onboarding and chat
- owner admin for onboarding, menu, quiz, QR, billing, analytics, invites, and changelog

## Working Now

- `/`
- `/auth/login`
- `/auth/checkout`
- `/admin`
- `/admin/onboarding`
- `/admin/menu`
- `/admin/quiz`
- `/admin/qr`
- `/admin/billing`
- `/admin/analytics`
- `/admin/invite`
- `/admin/changelog`
- `/chat/[restaurantId]`
- `/chat/[restaurantId]/onboarding/language`
- `/chat/[restaurantId]/onboarding/theme`
- `/invite/[code]`
- `/api/chat`
- `/api/tts`
- `/api/stripe/checkout`
- `/api/stripe/webhook`
- `/api/menu/parse`

## Current Architecture Truth

- owner auth is Supabase-first
- owner restaurant access is linked through `restaurants.owner_id`
- invite-based claiming is live
- guest-safe restaurant bootstrap reads through `/api/restaurants/[restaurantId]`
- billing state is persisted through Stripe webhook records plus a billing ledger
- the repo still contains legacy NextAuth and Prisma starter surfaces

## Remaining Known Blockers

- live Google OAuth still depends on enabling the Google provider and setting credentials in Supabase Auth

## Remaining Product Gaps

- waiter handoff
- POS integration
- order forwarding
- first-party QR generation instead of the external QR image service

