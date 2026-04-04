# Local Development Runbook

Purpose:

- explain how to boot the starter locally

Audience:

- maintainers
- coding agents

Status:

- active

Source of truth scope:

- local setup and day-to-day development workflow

Last updated:

- 2026-04-04

Related docs:

- `docs/reference/env-vars.md`
- `docs/reference/commands.md`

## Setup

1. Run `npm install`
2. Copy `.env.example` to `.env.local`
3. Fill only the integrations you actually want enabled
4. Run `npm run dev`

## Notes

- optional integrations stay inert until their required env vars are present
- use `npm run onboarding:suggest` to preview onboarding recommendations locally
- to test owner email/password login locally, configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`, then apply `docs/reference/supabase-owner-auth-migration.sql`
- to test owner Google login locally, configure the same Supabase env vars and enable the Google provider in the Supabase dashboard with `http://localhost:3000/auth/callback` in the redirect allowlist
- to test the fast concierge-training import locally, also configure `GOOGLE_PLACES_API_KEY`; `OPENAI_API_KEY` is recommended if you want Google Maps photos to be scanned for menu items and richer draft copy
- the repo still supports generic NextAuth-based starter flows, but Gustia owner admin no longer uses the NextAuth route
