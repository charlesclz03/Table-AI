# Master Project Next Steps

Purpose:

- track the immediate backlog for the starter repo

Audience:

- maintainers
- coding agents

Status:

- active

Source of truth scope:

- short-term backlog only

Last updated:

- 2026-04-04

Related docs:

- `docs/README.md`
- `docs/next-session-handoff.md`

## Immediate Backlog

- keep README, patch notes, handoff, progress log, session log, and every other impacted canonical doc synchronized whenever product or workflow truth changes
- remove or archive example artifacts when they no longer reflect the baseline starter
- tighten verification automation if new integrations or workflows are added
- apply and verify the live Supabase owner-auth migration in production, including Auth provider redirects and RLS behavior
- live-smoke the Google Maps concierge-training import with a real restaurant URL and confirm photo-based menu extraction quality against a few restaurant profiles
- replace the current QR image service dependency with a first-party generator if offline or stricter control is required
- fix the remaining `react-hooks/exhaustive-deps` warning in `app/chat/[restaurantId]/page.tsx`
