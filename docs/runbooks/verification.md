# Verification Runbook

Purpose:

- define the primary verification path for the starter repo

Audience:

- maintainers
- coding agents

Status:

- active

Source of truth scope:

- primary validation commands for local changes

Last updated:

- 2026-04-04

Related docs:

- `docs/reference/commands.md`

## Primary Checks

- `npm run lint`
- `npm run type-check`
- `npm run test`
- `npm run test:e2e`
- `npm run build`

## Release Documentation Checks

Before a real release, confirm the documentation matches the shipped code and workflow:

- `README.md`
- `docs/README.md`
- `docs/reference/PATCH_NOTES.md`
- `docs/progress-log.md`
- `docs/session-log.md`
- `docs/next-session-handoff.md`
- `docs/DEPLOY_CHECKLIST.md`
- `docs/reference/commands.md`
- `docs/reference/env-vars.md` when env requirements changed
- any touched product, architecture, setup, workflow, or spec docs when their described surface changed
