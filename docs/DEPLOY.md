# Gustia Deploy

Purpose:

- provide a short canonical pointer for deployment guidance

Audience:

- maintainers
- coding agents

Status:

- active

Source of truth scope:

- deploy entry point only

Last updated:

- 2026-04-05

Related docs:

- `docs/DEPLOY_CHECKLIST.md`
- `docs/runbooks/release.md`
- `docs/runbooks/verification.md`

## Canonical Deploy Docs

For real release work, use:

1. `docs/DEPLOY_CHECKLIST.md`
2. `docs/runbooks/release.md`
3. `docs/runbooks/verification.md`
4. `docs/reference/commands.md`

## Current Rule

- keep docs synchronized before release
- push the intended Git state first
- run the Vercel production deploy from the same clean workspace
- verify the affected live flows immediately after deploy

