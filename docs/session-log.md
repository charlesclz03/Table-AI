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
- installed a Table IA-specific `.agent/workflows/deploy.md` adapted from the Freestyla release process and synchronized deployment docs
- released commit `f7ba097` (`chore(release): owner onboarding and mobile concierge polish`) to GitHub and deployed production on Vercel
- verified `200` responses on `/`, `/chat/demo`, `/admin/login`, `/contact`, `/privacy`, and `/terms`
