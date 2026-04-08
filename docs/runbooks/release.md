# Gustia Release Runbook

Purpose:

- define the owner-facing release-note flow alongside the GitHub and Vercel release path

Audience:

- maintainers
- coding agents

Status:

- active

Source of truth scope:

- release-note preparation, version tagging, and fast production deploy sequencing

Last updated:

- 2026-04-04

Related docs:

- `.agent/workflows/deploy.md`
- `docs/DEPLOY_CHECKLIST.md`
- `docs/reference/PATCH_NOTES.md`
- `docs/templates/CHANGELOG.md`

## Release Flow

1. Update `lib/changelog.ts` with the new version, date, and owner-facing release notes.
2. Review the release diff and sync every impacted doc, always including `README.md`, `docs/README.md`, `docs/reference/PATCH_NOTES.md`, `docs/progress-log.md`, `docs/session-log.md`, and `docs/next-session-handoff.md`.
3. Verify locally with `npm run lint`, `npm run build`, and `npm run type-check`.
4. Confirm `/admin/changelog` renders the latest entry and the admin navigation badge shows the same version.
5. Commit the release with the version in the message, for example `git commit -m "chore(release): v1.0.1"`.
6. Create or move the Git tag for that release, for example `git tag v1.0.1`.
7. Push the branch and tags to GitHub with `git push origin main --follow-tags`.
8. Immediately run the Vercel production deploy from the same clean workspace.
9. Verify the affected production flows.

## Supabase Owner Auth Gate

If the release changes owner auth or owner-scoped data access:

1. Verify the live Supabase project already has the required schema and RLS, or apply `docs/reference/supabase-owner-auth-migration.sql` first.
2. Confirm Supabase Auth redirect URLs include `/auth/callback` for both local and production origins.
3. If Google login is meant to stay live, confirm Supabase Auth has a real Google client ID and client secret configured before calling the release launch-ready.
4. Treat `Unsupported provider: provider is not enabled` as a production configuration blocker, not an app-code bug.
5. Do not push application code that expects `owners` or `restaurants.owner_id` before that database state is live.

## Notes

- use `.agent/workflows/deploy.md` as the broader release gate
- treat the owner changelog as a required release artifact, not optional polish
- if a release changes the process itself, update this runbook and the deploy workflow in the same session
- do not wait on GitHub-connected auto-deploy as part of the normal `/deploy` path
- `/deploy` should report which docs were reviewed and which were updated, not just that docs sync happened
