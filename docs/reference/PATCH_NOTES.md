# Gustia Patch Notes

Purpose:

- record release-level product, workflow, and documentation changes in one canonical history

Audience:

- maintainers
- coding agents

Status:

- active

Source of truth scope:

- notable shipped changes and release-ready documentation updates

Last updated:

- 2026-04-08

Related docs:

- `docs/progress-log.md`
- `docs/session-log.md`
- `docs/next-session-handoff.md`
- `.agent/workflows/deploy.md`

## Policy

- add an entry for any meaningful product, auth, billing, workflow, or release-discipline change
- keep entries concise and outcome-focused
- use this file for release history, `docs/progress-log.md` for durable baseline truth, and `docs/session-log.md` for session chronology
- until formal semantic versioning starts, date-keyed entries are acceptable

## 2026-04-08 - Internal QR Code API

- **ADMIN**: Added a new dynamic QR image route at `/api/qr/[restaurantId]` so admin QR posters no longer depend on the external qrserver.com image endpoint.
- **QR**: QR generation now uses the `qrcode` package server-side, with table-aware deep links to `/chat/[restaurantId]?table=T{n}` and size control for preview versus download output.
- **VERIFY**: Wired the QR studio preview, print, and PNG download actions to the internal route; local package install and build verification still depend on installing the new `qrcode` dependency in this environment.

## 2026-04-05 - Documentation Reconciliation Sprint

- **DOCS**: Added canonical `docs/API.md`, `docs/ARCHITECTURE.md`, `docs/ONBOARDING.md`, `docs/PRICING.md`, `docs/DEPLOY.md`, and `docs/CHANGELOG.md` so the live Gustia app now has direct references for runtime routes, trust boundaries, onboarding, pricing, and release history.
- **DOCS**: Rewrote stale setup and status docs to match the real Supabase-first owner auth, invite-based claiming, Stripe activation-plus-subscription flow, four-theme guest onboarding, and owner admin surfaces that already ship.
- **DOCS**: Archived older root planning notes and prompt packs that still encoded retired pricing and pre-Supabase assumptions, replacing them with safe pointers to the current canonical docs.
- **VERIFY**: Re-ran repository searches for the main stale claims and confirmed the remaining hits are limited to intentional historical logs or audit history.

## 2026-04-05 - Chat PreText Measurement Pass

- **CHAT**: Added cached PreText-based message measurement in the guest chat so bubble heights are estimated without DOM reflow and reused for scroll math.
- **PERF**: Replaced the inline bubble markup with a dedicated `ChatBubble` component plus a lightweight windowed message renderer that only mounts the visible chat rows with overscan.
- **FIX**: Installed the live published package `@chenglou/pretext`; the requested `@tuform/pretext` package is not currently available on npm.
- **VERIFY**: Re-ran `npm run type-check`, `npm run lint`, and `npm run build`, then browser-smoked `/chat/demo` through onboarding and one message exchange.

## 2026-04-05 - Enterprise Audit Hardening Sprint

- **SECURITY**: Hardened `/api/chat` so the browser now sends only `restaurantId`, moved concierge prompt assembly to the server, introduced invite-based restaurant claiming, and added audit-log hooks for sensitive ownership changes and abuse blocks.
- **BILLING**: Replaced the Stripe webhook stub with idempotent event persistence, restaurant billing-state sync, and append-only billing ledger writes for checkout, subscription, and invoice events.
- **API**: Added shared request guards for trusted-origin checks, payload caps, and in-memory rate limits across auth, chat, TTS, menu parsing, checkout, and billing portal endpoints.
- **UX**: Added app-wide error boundaries, route loading states, honest pilot-program marketing copy, microphone policy support, and fixed the visible billing/docs encoding issues.
- **DOCS**: Refreshed `.agent/ARCHITECTURE.md`, `.agent/mcp_config.json`, `playwright.config.ts`, `e2e/example.spec.ts`, and `scripts/prod-launch-audit.mjs` to match real Gustia flows.
- **VERIFY**: Re-ran `npm run lint`, `npm run type-check`, `npm run test -- --run`, and `npm run build`. Browser smoke confirmed `/auth/login`, while `/chat/demo` still needs follow-up because the local server served `400` for `_next/static` assets during hydration.

## 2026-04-04 - Google Maps Concierge Training

- **ADMIN**: Added `/admin/onboarding` so owners can import a restaurant from Google Maps, tune concierge identity fields, and preview generated markdown before saving.
- **DATA**: Added Google Places-backed place import, optional website email scraping, and optional OpenAI-powered photo scanning so restaurant details, menu clues, and review context can seed the concierge draft quickly.
- **CONTENT**: Added canonical `lib/concierge/templates.ts` generation for `soul.md` and `rules.md`, with save-back into `restaurants.soul_md`, `restaurants.rules_md`, `restaurants.menu_json`, and `quiz_answers.concierge_training`.
- **VERIFY**: Re-ran `npm run type-check`, `npm run lint`, and `npm run build` after wiring the new admin import flow.

## 2026-04-04 - Auth Before Stripe Checkout

- **BILLING**: Reworked the public pricing flow so plan selection now starts on `/`, continues through `/auth/login`, and hands authenticated owners into `/auth/checkout` before Stripe is opened.
- **AUTH**: Reused the existing Supabase email/password and Google OAuth owner auth with plan-aware redirect targets so the signed-in owner always lands back in the correct checkout step.
- **PRICING**: Corrected the Stripe activation amount to `EUR 99`, added monthly versus annual plan handling in Checkout, and aligned the landing plus terms copy with the live pricing decision.
- **VERIFY**: Re-ran `npm run type-check`, `npm run lint`, and `npm run build`, then browser-smoked `/`, `/auth/login?plan=monthly`, `/auth/login?plan=annual`, and the unauthenticated redirect from `/auth/checkout?plan=annual`.

## 2026-04-04 - Azulejos-Only Glass System

- **DESIGN**: Moved the azulejos artwork into one shared app backdrop so content no longer mounts its own patterned background layers on top of the interface.
- **UI**: Added reusable glass tokens for panels, chips, inputs, alerts, and CTAs, then applied them across the shared layout, landing, onboarding, chat, legal, contact, and admin entry shells.
- **VERIFY**: Re-ran `npm run build` after the styling pass and confirmed the Next.js production build completes successfully.

## 2026-04-04 - Deploy Docs Impact Gate Hardened

- **DEPLOY**: Hardened `/deploy` so release prep now explicitly requires a changed-files review plus updates for every impacted doc before push or deploy.
- **DOCS**: Elevated `README.md` and `docs/README.md` into the always-reviewed release-tracking set alongside patch notes, handoff, progress, and session logs.
- **REPORTING**: Updated the deploy reporting contract so release summaries must state which docs were reviewed and which were actually updated.

## 2026-04-04 - Orbital Theme Selector Refresh

- **ONBOARDING**: Replaced the old theme card grid with a planet-style orbital selector centered on one large preview sphere plus rotating theme orbiters.
- **MOTION**: Added swipe and arrow navigation, directional wine slosh on the center sphere, blurred side states, and four-dot selection tracking for a smoother game-like selection flow.
- **STATE**: Kept the existing voice-preview fetch, session storage persistence, and enter-chat handoff intact while limiting the selector to the four active onboarding themes.

## 2026-04-04 - Deploy Workflow Simplified

- **DEPLOY**: Changed `/deploy` so the normal production path is now verify, sync the session docs, push GitHub, and immediately run the Vercel production deploy.
- **SPEED**: Removed the expectation that release sessions should wait around for GitHub-connected Vercel auto-deploy to trigger before shipping.

## 2026-04-04 - Owner Tutorial Landing Redesign

- **LANDING**: Rebuilt `/` into a mobile-first vertical tutorial for restaurant owners, centered on the four-step setup journey from menu import through guest usage.
- **MOTION**: Added Framer Motion scroll reveals plus layered parallax so the azulejos backdrop stays constant while each colored section shifts tone.
- **PRICING**: Reframed the homepage pricing around `Activation: EUR 99`, then `EUR 49/month` or `EUR 470/year`, with the annual savings and 14-day guarantee surfaced clearly.

## 2026-04-04 - Residual Brand Cleanup

- **BRAND**: Removed the last tracked pre-launch product-name references so repo source and docs now read consistently as Gustia.
- **DOCS**: Rewrote the naming-council note into a clean final-decision record instead of leaving stale aliases in place.

## 2026-04-04 - Theme Voice Preview Onboarding

- **CHAT**: Added localized AI voice previews to the onboarding theme step so guests can hear each concierge personality before entering the chat.
- **UX**: Replaced the old one-tap theme handoff with a preview-and-confirm flow, including green validated pills for the active theme and red not-selected pills for the others.
- **TTS**: Extended `/api/tts` to accept per-theme OpenAI voices and added a text-only fallback state when preview audio cannot be fetched or played.

## 2026-04-04 - AI Menu Photo Import Released to Production

- **DEPLOY**: Released the AI menu photo import to production on `https://www.gustia.wine` in deployment `dpl_HFVX9hrH4DhF3kr7qLEktiUCjBpo`.
- **VERIFY**: Re-ran `type-check`, `lint`, `build`, and `test` before release, then smoke-checked the key live routes on production.
- **OPENAI**: Confirmed production `/api/tts` now returns live `audio/mpeg` again after the OpenAI billing update, resolving the earlier quota-blocked TTS verification state.

## 2026-04-04 - Owner Analytics Dashboard

- **ADMIN**: Added `/admin/analytics` with live owner metrics for conversation volume, engagement, language mix, peak traffic windows, top questions, and recommendation trends.
- **DATA**: Extended `/api/chat` to persist conversation snapshots plus anonymized Q&A metadata into `conversation_analytics`, keeping guest identities out of the analytics layer by design.
- **API**: Added `/api/admin/analytics` so the owner dashboard can poll fresh analytics data every 30 seconds without a heavy chart dependency.

## 2026-04-04 - AI Menu Photo Import

- **ADMIN**: Added an `Upload Photo` flow in `/admin/menu` so owners can upload one or more menu pages as PDF, JPG, PNG, or WebP instead of typing every item manually.
- **AI**: Added `/api/menu/parse`, backed by OpenAI vision on `gpt-4o`, to extract dishes, prices, categories, descriptions, and allergens from multilingual menus before owner review.
- **UX**: Added an editable review step with deduping, manual fixes, and save-to-Supabase handoff so imported items can replace the live menu safely.

## 2026-04-04 - Owner Changelog Dashboard

- **ADMIN**: Added a dedicated `/admin/changelog` page so restaurant owners can review released features, fixes, and improvements without leaving the dashboard.
- **API**: Added `/api/changelog` backed by shared `lib/changelog.ts` data so the release feed has one canonical source of truth.
- **RELEASE**: Added a changelog template plus a release runbook requirement to update owner-facing release notes before GitHub push and Vercel auto-deploy.

## 2026-04-04 - Supabase Owner Auth and RLS Migration

- **AUTH**: Replaced the owner admin's NextAuth email-match flow with Supabase Auth sessions, including email/password login, Google OAuth, and a `/auth/callback` exchange path for SSR-safe cookies.
- **DATA**: Added owner bootstrap logic that mirrors Supabase Auth users into `public.owners`, claims legacy restaurant rows by email, and links restaurants through `restaurants.owner_id`.
- **SECURITY**: Moved guest restaurant profile reads behind an internal app route and added a canonical Supabase SQL migration for `owners`, `restaurants.owner_id`, and owner-scoped RLS policies.

## 2026-04-05 - Invite Claiming, Production Auth Repair, and Checkout Recovery

- **FEATURE**: Added owner invite management on `/admin/invite` plus public claim links on `/invite/[code]`, and kept `next` routing intact so invitees can return to the claim step after sign-in.
- **FIX**: Repaired live Supabase production auth by correcting the hosted `site_url`, adding the production callback allow-list, and patching the missing `restaurants` billing columns that had been breaking owner bootstrap after email confirmation.
- **FIX**: Replaced the invalid production Vercel `STRIPE_SECRET_KEY`, then redeployed so authenticated owners can reach live Stripe Checkout again.
- **FIX**: Deployed the `/chat/demo` demo-mode guard so production no longer throws the old `POST /api/chat` `404` before its local fallback response.
- **VERIFY**: Re-verified live email signup into `/auth/checkout`, Stripe Checkout load, `/chat/demo` onboarding plus reply, and `/admin/menu` image upload with parsed menu results on `https://www.gustia.wine`.
- **BLOCKER**: Google OAuth is still disabled in Supabase Auth because no Google client ID or secret exists in the repo, local env, or Vercel production env.

## 2026-04-04 - OpenAI Voice Output for Concierge Replies

- **CHAT**: Replaced the primary browser speech-synthesis reply path with an OpenAI-backed `/api/tts` route so concierge voice replies sound smoother and more natural.
- **RESILIENCE**: Kept a silent Web Speech fallback for reply playback so the guest experience still works if the TTS API request or browser audio playback fails.
- **DOCS**: Updated the main product docs to describe OpenAI TTS as the primary voice-out path.

## 2026-04-04 - Gustia Live Domain and Production Launch

- **BRAND**: Confirmed the live public domain is now `https://www.gustia.wine`, aligning the launched site with the Gustia brand.
- **DOCS**: Updated release, env, and repo-level documentation so production references point at `gustia.wine` instead of generic placeholders.
- **DEPLOY**: Hardened the release checklist to require `NEXT_PUBLIC_SITE_URL` and a production-domain sanity check before future deploys.
- **WORKFLOW**: Corrected `/deploy` so the standard production path is GitHub push first with Vercel auto-deploy, while direct Vercel CLI releases are documented as fallback-only.

## 2026-04-04 - Gustia Brand Rename

- **BRAND**: Renamed the product across app copy, metadata, admin screens, billing copy, onboarding, and legal/contact surfaces to Gustia.
- **CODE**: Updated repo-facing identifiers such as the package name, session storage keys, Stripe checkout copy, and brand-linked contact addresses/domains to the Gustia naming.
- **DOCS**: Synchronized the canonical docs, specs, strategy notes, workflow references, and repo guidance so the project now reads consistently as Gustia.

## 2026-04-04 - Documentation Tracking and Deploy Contract Hardening

- **DOCS**: Added a canonical patch-notes document so Gustia has a dedicated release history instead of relying only on progress and session logs.
- **DEPLOY**: Hardened `.agent/workflows/deploy.md` and the deployment checklist so releases must explicitly sync the relevant docs set rather than relying on a vague reminder.
- **DOCS**: Synchronized the canonical docs hub, handoff, progress log, session log, root README, commands, env, verification, and local-development references around the new documentation contract.

## 2026-04-04 - Slide-Based Concierge Onboarding

- **CHAT**: Rebuilt the guest onboarding into a staged vertical-slide flow with a welcome screen, large language tiles, animated theme selection, and an enter-chat handoff.
- **MOTION**: Added Framer Motion slide transitions with a 400ms ease-out rhythm plus bottom progress dots so the mobile flow feels like one continuous journey.
- **STATE**: Kept the existing sessionStorage language/theme persistence and verified the `/chat/demo` path still lands in chat with the selected preferences applied.

## 2026-04-04 - Legal Pages Refined for Gustia

- **LEGAL**: Replaced the placeholder privacy and terms pages with Gustia-specific legal copy covering restaurant data, chat logs, Supabase-backed storage, no data resale, service scope, pricing, payment terms, cancellation, and liability limits.
- **UX**: Added a shared glassmorphism legal shell with a back-to-home link and consistent legal/support navigation.
- **CONTENT**: Updated public legal and contact touchpoints to use `contact@gustia.wine` and expanded the landing page footer labels to the full legal page names.

## 2026-04-04 - Reply Memory Workflow Removed

- **AGENTS**: Removed the mandatory reply-memory logging rule so sessions can finish normally with a direct report to the user.
- **DOCS**: Removed references to `brainlast10replies.MD` and `scripts/brainlast10replies.mjs` from the docs hub, command reference, and next-session handoff.
- **CLEANUP**: Retired the reply-memory helper script and skill from the repo.

## 2026-04-04 - File-List Reporting Removed

- **AGENTS**: Added a reporting rule so final replies summarize the work without enumerating edited files by default.
- **DEPLOY**: Updated the `/deploy` output contract to report documentation-sync status instead of asking for a file-by-file artifact list.

## 2026-04-04 - Owner Landing, Google Bootstrap, and Public Pages

- **LANDING**: Replaced the homepage with a warm Lisbon restaurant landing page aimed at restaurant owners, including a visual hero, how-it-works section, feature story, social-proof placeholder, demo CTA, and footer legal/contact links.
- **AUTH**: Admin sign-in now routes through `/admin/login`, uses the existing NextAuth Google provider path, and auto-provisions a placeholder Supabase `restaurants` row on first owner login when service-role access is configured.
- **PAGES**: Added `/privacy`, `/terms`, and `/contact` so the public landing footer has real destinations.

## 2026-04-04 - Chat UX Polish and Release Workflow Install

- **CHAT**: Improved the mobile chat experience with better responsive layout, touch targets, overflow control, session-scoped headphone dismissal, and press-and-hold voice input.
- **CHAT**: Updated the onboarding wine sphere animation and tightened greeting/session behavior so the concierge intro only appears once per conversation.
- **BUILD**: Added a reliable `npm run type-check` flow alongside the generated Next.js route types setup.
- **DEPLOY**: Installed a Gustia-specific GitHub + Vercel deploy workflow adapted from the Freestyla release process.
