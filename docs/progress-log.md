# Master Project Progress Log

Purpose:

- record what the starter already ships

Audience:

- maintainers
- coding agents

Status:

- active

Source of truth scope:

- shipped baseline only

Last updated:

- 2026-04-04

Related docs:

- `docs/README.md`
- `docs/reference/PATCH_NOTES.md`
- `docs/next-steps.md`
- `docs/session-log.md`

## Current Baseline

- Next.js 15 App Router shell with `/`, `/dashboard`, auth routes, and health endpoint
- typed env access and helpers for Prisma, NextAuth, Supabase, and Stripe
- onboarding suggestion flow with optional InsForge-backed recommendations
- reusable UI primitives, Vitest coverage, and Playwright smoke coverage
- documentation operating system starter set installed under `docs/`
- canonical release tracking now lives in `docs/reference/PATCH_NOTES.md`, alongside `docs/progress-log.md` for baseline truth and `docs/session-log.md` for chronology
- Table IA owner admin area shipped under `/admin`, including menu editing, onboarding quiz editing, QR poster generation, and billing overview pages backed by Supabase + Stripe helpers
- Table IA owner Google login now auto-provisions a placeholder Supabase `restaurants` row, and the public landing page now speaks directly to restaurant owners with demo and legal/contact entry points
- Table IA public legal pages now include product-specific privacy and terms copy with shared premium styling, pricing details, and a support contact path for restaurant owners
- Table IA billing now includes a hosted Stripe Checkout setup CTA, success/cancel states, and dedicated result pages for the founding-offer flow
- Table IA customer chat now routes GPT-4o mini calls through a server API with restaurant context and automatic demo fallback on failures
- Table IA now includes a direct Supabase SQL schema document and a Vercel deploy checklist covering env vars and Stripe webhook setup
- Table IA deploy guidance now requires explicit synchronization of patch notes, handoff, progress/session logs, and other affected canonical docs before release
- Table IA no longer requires repo-level reply-memory logging before final responses; sessions now end with a direct completion report
- Table IA final reports are now summary-first by default, and `/deploy` reports documentation-sync status instead of a file-by-file artifact list
- Table IA now includes a repo-specific `/deploy` workflow adapted from the Freestyla release process for GitHub push, Vercel deploy, rollback, and verification discipline
