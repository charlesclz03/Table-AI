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
- to test owner Google login locally, configure `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET`
- to test first-login restaurant creation, also configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`
