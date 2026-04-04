# Table IA Patch Notes

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

- 2026-04-04

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

## 2026-04-04 - Documentation Tracking and Deploy Contract Hardening

- **DOCS**: Added a canonical patch-notes document so Table IA has a dedicated release history instead of relying only on progress and session logs.
- **DEPLOY**: Hardened `.agent/workflows/deploy.md` and the deployment checklist so releases must explicitly sync the relevant docs set rather than relying on a vague reminder.
- **DOCS**: Synchronized the canonical docs hub, handoff, progress log, session log, root README, commands, env, verification, and local-development references around the new documentation contract.

## 2026-04-04 - Legal Pages Refined for TableIA

- **LEGAL**: Replaced the placeholder privacy and terms pages with TableIA-specific legal copy covering restaurant data, chat logs, Supabase-backed storage, no data resale, service scope, pricing, payment terms, cancellation, and liability limits.
- **UX**: Added a shared glassmorphism legal shell with a back-to-home link and consistent legal/support navigation.
- **CONTENT**: Updated public legal and contact touchpoints to use `support@tableia.com` and expanded the landing page footer labels to the full legal page names.

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
- **DEPLOY**: Installed a Table IA-specific GitHub + Vercel deploy workflow adapted from the Freestyla release process.
