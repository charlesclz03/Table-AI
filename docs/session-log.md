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

- 2026-04-04

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
- aligned public support contact details to `support@gustia.com`
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
