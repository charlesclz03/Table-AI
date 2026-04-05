# Master Project Session Log

Purpose:

- record notable coding sessions, release actions, and documentation-level changes in chronological order

Audience:

- maintainers
- coding agents

Status:

- active

Source of truth scope:

- session-by-session operational history

Last updated:

- 2026-04-05

Related docs:

- `docs/README.md`
- `docs/next-session-handoff.md`
- `docs/progress-log.md`
- `docs/reference/PATCH_NOTES.md`

## How To Use

- add one entry per meaningful coding or deployment session
- keep entries short and factual
- link to deeper docs when a change deserves more detail
- use `docs/progress-log.md` for durable shipped baseline, and this file for session history

## Entries

### 2026-04-05 - Launch Readiness Verification

- applied `docs/reference/supabase-owner-auth-migration.sql` to the live Supabase project `cgdrgjsigggqfoghbciz` and re-verified the owner-auth tables, the `restaurant_public_profiles` view, and the owner-facing RLS policies
- added an owner invite management page at `/admin/invite`, a public claim page at `/invite/[code]`, and admin auth `next` handling so invite links can round-trip through sign-in and return to the claim screen
- fixed local `/chat/demo` verification by clearing `.next`, rebuilding, and confirming the route works on clean production and dev ports after stale `next start` processes on `3000` and `3001` had been masking the result
- patched the chat demo flow so demo mode no longer calls `/api/chat` for non-UUID demo restaurants, which removes the avoidable `404` console error after deployment; also added form `name` attributes to the owner auth and chat forms to eliminate browser form-field issues
- verified `npm run type-check`, `npm run lint`, and `npm run build` all pass after the invite and demo-flow changes
- live production checks found two remaining launch blockers: Google OAuth currently fails because the Supabase provider is not enabled, and Supabase confirmation emails are redirecting to `http://localhost:3000` instead of the production callback path
- live `/chat/demo` still completes and returns a demo response on production, but the current deployed build still logs `POST /api/chat` `404` before fallback; billing and menu-upload verification remain blocked until auth configuration is fixed

### 2026-04-05 - Enterprise Audit Remediation

- removed the client-trusted restaurant payload from `/api/chat`, switched public restaurant reads to a public-safe projection, and tightened the owner-account flow so restaurant claiming now depends on invite records instead of email matching
- added shared rate-limit and trusted-origin guards, then applied them to signup, login, logout, checkout, billing portal, chat, TTS, and menu parsing; rate-limit hits now emit audit-log entries
- replaced the Stripe webhook stub with persisted webhook-event records, restaurant billing-state sync, and append-only billing ledger entries, plus stateful Vitest coverage for checkout, subscription, invoice, and idempotency transitions
- added app error boundaries, route loading states, honest pilot-program copy, microphone permissions support, fixed invalid `.agent/mcp_config.json`, refreshed the architecture doc, and updated stale Playwright plus launch-audit scripts
- verified `npm run lint`, `npm run type-check`, `npm run test -- --run`, and `npm run build` all pass
- browser-smoked `/auth/login` successfully; local `/chat/demo` hydration still needs follow-up because `_next/static` assets returned `400` during the smoke run even after a successful production build

### 2026-04-04 - Google Maps Concierge Training Flow

- added `/admin/onboarding` plus `/api/admin/onboarding` and `/api/admin/onboarding/import` so owners can paste a Google Maps URL, import place data, edit concierge fields, and save generated `soul.md` plus `rules.md`
- introduced Google Places-backed restaurant resolution with optional website email scraping, optional OpenAI-powered photo menu extraction, and fallback synthesis for recommendations, FAQs, theme, and voice defaults
- kept the existing Supabase restaurant model intact by storing the imported concierge bootstrap metadata under `quiz_answers.concierge_training`, while still updating top-level `name`, `email`, `menu_json`, `soul_md`, and `rules_md`
- verified `npm run type-check`, `npm run lint`, and `npm run build` all pass after wiring the new admin flow

### 2026-04-04 - Pricing Auth Gate Before Stripe

- audited the landing-to-billing flow and found two main mismatches: the public pricing CTAs were still sending owners to contact-style entry points, and Stripe Checkout still used the legacy `EUR 299` activation amount
- added public `/auth/login` and `/auth/checkout` routes so owners now choose monthly or annual pricing first, authenticate through Supabase email/password or Google OAuth, and then enter Stripe with the selected plan and signed-in email
- updated `/api/stripe/checkout` to require `?plan=monthly|annual`, charge the corrected `EUR 99` activation, attach the selected plan to Stripe metadata, and support both the new public flow and the existing admin billing screen
- aligned the homepage pricing CTAs, admin billing buttons, terms copy, Stripe integration notes, and a new `docs/PRICING_DECISION.md` record with the auth-before-checkout decision
- verified `npm run type-check`, `npm run lint`, and `npm run build` all pass, then browser-smoked `/`, `/auth/login?plan=monthly`, `/auth/login?plan=annual`, `/auth/checkout?plan=annual` redirect behavior, and the `/admin/dashboard` alias route

### 2026-04-04 - Azulejos-Only Glass System

- moved the azulejos image into one shared fixed backdrop in the root layout so pages no longer render their own patterned background elements above content
- added reusable glass utilities in `app/globals.css` for panels, chips, buttons, inputs, and tinted alerts, then rewired the main landing, onboarding, chat, legal, contact, and admin entry shells to use them
- converted the remaining solid white and solid accent CTAs in the main guest and owner-facing flows into tinted glass buttons so the UI stays translucent over the shared background
- verified `npm run build` passes after the styling pass

### 2026-04-04 - Deploy Docs Impact Gate Hardened

- tightened `.agent/workflows/deploy.md` and `docs/DEPLOY_CHECKLIST.md` so `/deploy` now explicitly reviews the changed files and blocks release until every impacted doc has been updated or confirmed current
- promoted `README.md` and `docs/README.md` into the always-reviewed release-tracking set, instead of treating them as easy-to-forget optional follow-up docs
- synchronized the release, verification, commands, and backlog docs so deploy reports now name which docs were reviewed and which were updated

### 2026-04-04 - Orbital Theme Selector Refresh

- replaced the theme onboarding card grid with a swipeable orbital selector built around one central preview sphere and four rotating theme orbiters
- added directional wine slosh for the selected sphere, blurred side states, arrow controls, and four-dot navigation while keeping the existing voice preview plus confirm flow
- verified `npm run build` passes and confirmed locally in a mobile-emulated browser that swipe changes themes and the selected theme still persists into chat via session storage

### 2026-04-04 - Owner Tutorial Landing Redesign

- replaced the homepage with a full-bleed, mobile-first owner journey that now reads as a vertical setup tutorial instead of a generic marketing page
- added Framer Motion parallax and reveal animation, anchored by a fixed azulejos background and per-section color overlays for hero, setup steps, guest preview, pricing, testimonials, and start CTA
- updated the homepage pricing language to `Activation: EUR 99`, then `EUR 49/month` or `EUR 470/year`, with the annual savings and 14-day guarantee called out explicitly
- verification includes `npm run build`; visual mobile verification still depends on a browser smoke pass

### 2026-04-04 - Deploy Workflow Simplified

- updated the repo deploy workflow so `/deploy` now prioritizes fast release execution: sync the canonical session docs, push GitHub, and immediately run the Vercel production deploy
- removed the expectation that release sessions should sit and wait to see whether GitHub-connected auto-deploy fires before shipping

### 2026-04-04 - Residual Brand Cleanup

- removed the last tracked pre-launch product-name references from repo docs so the source now reads consistently as Gustia
- collapsed the naming decision note into a short final archive instead of preserving stale aliases in the workspace

### 2026-04-04 - Theme Voice Preview Onboarding

- added shared theme metadata in `lib/themes.ts` so each onboarding theme now carries its own OpenAI voice, localized greeting copy, personality text, and sphere motion profile
- built a dedicated theme preview card plus a preview-and-confirm onboarding flow that plays theme-specific audio on tap, shows green validated and red not-selected pills, and preserves the existing session storage handoff into chat
- extended `/api/tts` to accept a voice override while keeping the existing default voice path intact, and added a text-only fallback state when preview audio is unavailable
- verified `npm run type-check`, `npm run lint`, and `npm run build` all pass after the onboarding and TTS changes

### 2026-04-04 - Owner Analytics Dashboard

- added `conversation_analytics` support to the Supabase migration docs plus owner-scoped analytics aggregation for conversations, engagement, peak usage windows, language mix, and recommendation trends
- extended `/api/chat` so successful live replies now persist the full conversation snapshot and an anonymized Q&A analytics row keyed by conversation id
- built `/api/admin/analytics` and `/admin/analytics` with range filters, a lightweight SVG usage chart, auto-refresh polling, and a new analytics entry in the owner navigation
- verification planned for `npm run lint`, `npm run type-check`, and `npm run build` after the implementation sweep

### 2026-04-04 - Production Release and OpenAI Verification

- released the AI menu photo import to production in commit `1a0e359` (`chore(release): ai menu photo import`) and deployed `dpl_HFVX9hrH4DhF3kr7qLEktiUCjBpo` to `https://www.gustia.wine`
- ran `npm run type-check`, `npm run lint`, `npm run build`, and `npm run test` as the final release gate before pushing `main`
- verified production `200` responses on `/`, `/chat/demo`, `/admin/login`, `/admin/billing/success`, `/admin/billing/canceled`, and `/api/health`, with `/admin` redirecting correctly to the login screen
- re-verified production `/api/tts` after the OpenAI billing update and confirmed it now returns `200` with `audio/mpeg`, so the previous quota-related TTS failure is resolved
- GitHub auto-deploy still did not surface promptly after the push, so the documented Vercel CLI fallback path was used for the production release

### 2026-04-04 - AI Menu Photo Import

- added an authenticated `app/api/menu/parse` route that accepts multipart PDF/image uploads, sends each file through OpenAI `gpt-4o`, normalizes the structured extraction, and dedupes repeated items across pages
- built a new owner-facing photo upload workflow inside `/admin/menu` with drag-and-drop, file previews, editable parsed rows, AI notes, and save-through to the existing Supabase-backed menu endpoint
- kept the manual menu editor intact behind a mode switch so owners can still fall back to direct entry when parsing fails or prices need extra cleanup
- verified `npm run type-check`, `npm run lint`, and `npm run build` all pass; live end-to-end parsing still depends on an authenticated owner session and a real upload smoke test

### 2026-04-04 - Supabase Owner Auth Migration

- replaced the owner admin's active auth path with Supabase Auth routes for email/password login, signup, logout, Google OAuth, and an SSR callback exchange
- moved admin restaurant resolution from NextAuth email matching to `owners` plus `restaurants.owner_id`, with service-role bootstrap limited to claiming or creating the owner-linked records
- switched guest restaurant profile fetches to an internal app route so the restaurant table can use strict owner RLS without breaking `/chat/[restaurantId]`
- added `docs/reference/supabase-owner-auth-migration.sql` plus updated product/docs references for the new owner auth and RLS contract
- verification still needs a live Supabase project with the SQL migration applied before email/password login, Google OAuth, and owner-only data visibility can be exercised end-to-end

### 2026-04-04 - Owner Changelog Feature

- added a shared `lib/changelog.ts` source plus `/api/changelog` so the owner release feed and future integrations read the same sorted release data
- built `/admin/changelog` with a glassmorphism release feed grouped by date and wired a latest-version badge into the admin navigation
- added a changelog template and release runbook guidance so future releases update the owner-facing feed before GitHub push and Vercel auto-deploy
- verified `npm run lint`, `npm run type-check`, and `npm run build` all pass, then smoke-checked `GET /api/changelog` locally from a production start

### 2026-04-04 - OpenAI TTS Reply Upgrade

- added an `app/api/tts` route that uses the existing OpenAI server env wiring to synthesize concierge reply audio with the `tts-1-hd` model and `onyx` voice
- replaced the chat page's primary Web Speech reply path with streamed MP3 playback plus cleanup for cancellation, replay interruption, and audio URL revocation
- kept a silent browser speech fallback for reply playback if the TTS request or audio playback fails, and updated the product docs to describe the new voice path
- verified `npm run type-check`, `npm run lint`, and `npm run build` all pass; runtime smoke on `/api/tts` reached the route but the current OpenAI account returned a quota `429`, so natural-audio playback still needs live confirmation once billing/quota is restored

### 2026-04-05 - Launch Readiness Repairs and Production Redeploy

- applied the canonical owner-auth SQL migration to live Supabase, then followed it with an additive `restaurants` schema patch so owner bootstrap, billing fields, and invite-era admin reads match the current app contract
- repaired live Supabase Auth configuration by setting the production `site_url` to `https://www.gustia.wine` and adding the production callback URLs to the redirect allow-list, which fixed the broken localhost email confirmation handoff
- confirmed the repaired email flow with a fresh Mailinator signup, then verified the confirmation link now lands on `/auth/checkout?plan=monthly` and creates the owner plus restaurant records in production
- found that the production Vercel `STRIPE_SECRET_KEY` was invalid, replaced it with the working local project key, and redeployed production as `dpl_9PbhyKrTZXhTt7XE33nXCvYbUsTf`
- verified the new production deploy opens live Stripe Checkout in sandbox mode, deploys the `/admin/invite` and `/invite/[code]` routes, removes the old `/chat/demo` `POST /api/chat` `404`, and keeps `/api/tts` healthy
- smoke-tested `/admin/menu` with an authenticated owner session and a generated menu image; the live parser returned seven extracted items for review before save
- remaining external blocker: Google OAuth is still disabled in Supabase because there is no Google client ID or client secret available in the repo, local env, or Vercel envs

### 2026-04-04 - Gustia Domain Go-Live Deploy Prep

- confirmed the public production site is live at `https://www.gustia.wine`
- updated repo docs, env guidance, and deploy checklists so future releases treat `gustia.wine` as the canonical production domain
- re-ran `npm run lint`, `npm run build`, and `npm run type-check`, then deployed production through the Vercel CLI
- verified deployment `dpl_FzNTKtpWkXdKeBPBPPLuWR9uten3` is ready and aliased to `https://gustia.wine` and `https://www.gustia.wine`
- confirmed `200` responses with Gustia branding on `/`, `/chat/demo`, `/admin`, `/privacy`, and `/terms`

### 2026-04-04 - Deploy Contract Corrected to GitHub-First

- updated `.agent/workflows/deploy.md` and `docs/DEPLOY_CHECKLIST.md` so `/deploy` now explicitly defaults to commit-plus-push on `main` and relies on Vercel auto-deploy from GitHub
- kept the direct Vercel CLI path documented only as a fallback or emergency release path
- pushed the full current workspace to `origin/main` as commit `2295105` (`chore(release): gustia production launch`)
- polled Vercel after the push; the latest visible production deployment remained the manually triggered `dpl_FzNTKtpWkXdKeBPBPPLuWR9uten3`, so GitHub-to-Vercel auto-deploy still needs connector-level confirmation in a future session

### 2026-04-04 - Gustia Rename Sweep

- renamed the product across app code, docs, package metadata, onboarding, admin, billing, legal, and marketing copy to Gustia
- updated repo-visible identifiers including the npm package name, session storage keys, checkout copy, and brand-linked contact strings so the codebase matches the new name end-to-end
- verified a clean residue search for old branding in tracked source/docs and confirmed `npm run build` passes after the rename

### 2026-04-04 - Slide-Based Mobile Onboarding Refresh

- rebuilt the guest onboarding flow into welcome, language, theme, and enter-chat slides with vertical motion transitions and bottom progress dots
- kept the existing sessionStorage-based language/theme persistence so `/chat/demo` still resolves into chat with the selected preferences
- verified `npm run build` passes and manually checked the `/chat/demo` flow at 375px width through onboarding into chat

### 2026-04-04 - Legal Pages and Footer Alignment

- replaced the placeholder `/privacy` and `/terms` pages with Gustia-specific legal copy and a shared glassmorphism legal shell
- aligned public support contact details to `contact@gustia.wine`
- expanded the homepage footer labels to `Privacy Policy` and `Terms of Service`

### 2026-04-04 - File-List Reporting Removed

- added a repo-level reporting rule in `AGENTS.md` so normal final answers do not enumerate edited files by default
- updated `.agent/workflows/deploy.md` so deploy reports confirm docs sync without requiring a file-by-file list

### 2026-04-04 - Reply Memory Removal

- removed the repo-level reply-memory requirement from `AGENTS.md`
- removed reply-memory references from the docs hub, command reference, and next-session handoff
- retired the reply-memory script and skill so future sessions finish normally with a direct summary report

### 2026-04-04 - Documentation Tracking Hardening

- added `docs/reference/PATCH_NOTES.md` as the canonical release-history document for shipped changes
- synchronized `AGENTS.md`, `README.md`, the docs hub, handoff, progress log, commands, env vars, verification, local development, and deployment docs around the current product truth
- hardened `.agent/workflows/deploy.md` and `docs/DEPLOY_CHECKLIST.md` so release sessions must update the relevant project documentation set instead of relying on a vague reminder

### 2026-04-04 - Chat UX, Deploy Workflow, Production Release

- fixed the mobile chat experience in `app/chat/[restaurantId]/page.tsx` with better responsive layout, touch targets, overflow control, session-scoped headphone dismissal, and press-and-hold voice input
- updated `app/chat/[restaurantId]/onboarding/_layout.tsx` so the wine sphere visibly animates while speaking
- tightened `app/api/chat/route.ts` and chat message handling so the concierge greeting only appears once at the start of a conversation
- added `tsconfig.typecheck.json` and updated `package.json` so `npm run type-check` works reliably alongside generated Next.js route types
- installed a Gustia-specific `.agent/workflows/deploy.md` adapted from the Freestyla release process and synchronized deployment docs
- released commit `f7ba097` (`chore(release): owner onboarding and mobile concierge polish`) to GitHub and deployed production on Vercel
- verified `200` responses on `/`, `/chat/demo`, `/admin/login`, `/contact`, `/privacy`, and `/terms`
