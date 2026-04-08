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

- 2026-04-08

Related docs:

- `docs/README.md`
- `docs/reference/PATCH_NOTES.md`
- `docs/next-steps.md`
- `docs/session-log.md`

## Current Baseline

- Next.js 15 App Router shell with `/`, `/dashboard`, auth routes, and health endpoint
- the shared visual system now uses one fixed azulejos background layer plus glassmorphism panels, controls, and tinted CTA surfaces across the core public and guest-facing flows
- typed env access and helpers for Prisma, NextAuth, Supabase, and Stripe
- onboarding suggestion flow with optional InsForge-backed recommendations
- reusable UI primitives, Vitest coverage, and Playwright smoke coverage
- documentation operating system starter set installed under `docs/`
- canonical release tracking now lives in `docs/reference/PATCH_NOTES.md`, alongside `docs/progress-log.md` for baseline truth and `docs/session-log.md` for chronology
- Gustia owner admin area shipped under `/admin`, including menu editing, onboarding quiz editing, QR poster generation, and billing overview pages backed by Supabase + Stripe helpers
- Gustia owner Google login now auto-provisions a placeholder Supabase `restaurants` row, and the public landing page now presents a mobile-first parallax owner tutorial with demo and legal/contact entry points
- Gustia public legal pages now include product-specific privacy and terms copy with shared premium styling, pricing details, and the canonical `contact@gustia.wine` contact path for restaurant owners
- Gustia billing now includes a hosted Stripe Checkout setup CTA, success/cancel states, and dedicated result pages for the founding-offer flow
- Gustia customer chat now routes GPT-4o mini calls through a server API with restaurant context and automatic demo fallback on failures
- Gustia guest chat now uses cached PreText measurement plus a lightweight windowed message list so chat bubbles can reserve height and scroll more smoothly without DOM reflow on every message
- Gustia concierge voice replies now use an OpenAI TTS server route with browser speech fallback for smoother audio playback on guest devices, and production `/api/tts` has been re-verified successfully after the OpenAI billing update
- Gustia onboarding theme selection now uses a swipeable orbital selector with rotating theme spheres, localized AI voice previews, separate confirmation, and text-only fallback when preview audio is unavailable
- Gustia owner menu management now supports AI-assisted menu photo import, including multilingual OpenAI parsing, review-before-save, multi-file upload, and deduped save-back into `restaurants.menu_json`
- Gustia owner admin now includes a dedicated changelog page and navigation badge so restaurant owners can track shipped releases from inside `/admin`
- Gustia owner admin now includes a dedicated analytics page with live conversation counts, top questions, peak usage windows, language mix, and recommendation tracking powered by anonymized chat metadata
- Gustia owner admin now includes `/admin/onboarding`, a Google Maps-powered concierge training flow that imports place details, scans available photos for menu clues, and generates editable `soul.md` plus `rules.md` drafts before save
- Gustia owner admin auth now uses Supabase Auth for email/password and Google OAuth, with owner bootstrap tied to `owners.id = auth.users.id` and `restaurants.owner_id`
- Gustia owner access now includes admin-generated invite links on `/admin/invite` and public ownership claiming on `/invite/[code]`
- Gustia public pricing now requires owner auth before Stripe Checkout, using plan-aware `/auth/login` and `/auth/checkout` routes for the monthly and annual paths
- Gustia guest chat now enforces a free-tier cap of `50` queries per restaurant per calendar month through `usage_logs`, warning at `80%` and blocking at the cap with an upgrade route to `/admin/billing`
- Gustia owner-facing admin reads and writes now target owner-scoped Supabase access, while guest restaurant profile reads are served through an app route so strict restaurant RLS can stay in place
- Gustia is now live on the public production domain `https://www.gustia.wine`
- live production email confirmation now returns to Gustia instead of localhost, live Stripe Checkout opens again from the authenticated owner flow, `/admin/menu` parsing has been smoke-tested with a real upload, and `/chat/demo` no longer throws the older demo-mode `404`
- Gustia now includes a direct Supabase SQL schema document and a Vercel deploy checklist covering env vars and Stripe webhook setup
- Gustia deploy guidance now requires explicit synchronization of patch notes, handoff, progress/session logs, and other affected canonical docs before release
- Gustia `/deploy` now explicitly reviews the release diff and requires every impacted doc, including `README.md` and `docs/README.md` when relevant, to be updated or confirmed current before release
- Gustia no longer requires repo-level reply-memory logging before final responses; sessions now end with a direct completion report
- Gustia final reports are now summary-first by default, and `/deploy` reports documentation-sync status instead of a file-by-file artifact list
- Gustia now includes a repo-specific `/deploy` workflow adapted from the Freestyla release process for GitHub push, Vercel deploy, rollback, and verification discipline
- Gustia `/deploy` now favors a fast release path: update the session docs, push `main`, and let GitHub Actions perform the Vercel production deploy for that commit, with manual Vercel CLI deploy kept as fallback only
- Gustia security hardening now includes server-only chat prompt context, invite-based restaurant claiming, shared API abuse protection, audit logging hooks, and persisted Stripe webhook plus billing-ledger state
- Gustia now includes app-level `error.tsx` and `global-error.tsx` boundaries plus route-level loading states for admin, auth, chat, and chat onboarding flows
- Gustia verification assets now target real product routes instead of the older starter copy, including refreshed Playwright smoke coverage and a refreshed production launch audit script
- Gustia now has canonical architecture, API, onboarding, pricing, deploy, changelog, and documentation-audit references under `docs/`, and older root planning notes now point back to those sources instead of preserving stale operating assumptions
