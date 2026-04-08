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

- 2026-04-08

Related docs:

- `docs/DEPLOY_CHECKLIST.md`
- `docs/runbooks/release.md`
- `docs/runbooks/verification.md`
- `docs/VERCEL_GITHUB_SECRETS.md`

## Canonical Deploy Docs

For real release work, use:

1. `docs/DEPLOY_CHECKLIST.md`
2. `docs/runbooks/release.md`
3. `docs/runbooks/verification.md`
4. `docs/reference/commands.md`

## Current Rule

- keep docs synchronized before release
- push the intended Git state first
- let GitHub Actions deploy Vercel production automatically on pushes to `main`
- use a direct Vercel CLI production deploy only as the fallback path
- verify the affected live flows immediately after deploy
