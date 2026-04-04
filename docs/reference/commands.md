# Commands Reference

Purpose:

- list the main commands used to work in the starter repo

Audience:

- maintainers
- coding agents

Status:

- active

Source of truth scope:

- common local development and verification commands

Last updated:

- 2026-04-04

Related docs:

- `docs/runbooks/local-development.md`
- `docs/runbooks/verification.md`

## Common Commands

- install deps: `npm install`
- start dev server: `npm run dev`
- onboarding suggestions: `npm run onboarding:suggest`
- lint: `npm run lint`
- type-check: `npm run type-check`
- tests: `npm run test`
- e2e tests: `npm run test:e2e`
- production build: `npm run build`

## Documentation Tracking

- release-history source of truth: `docs/reference/PATCH_NOTES.md`
- deploy workflow contract: `.agent/workflows/deploy.md`

## Deployment Commands

- inspect branch state: `git status --short`
- sync remote state: `git fetch`
- push release branch: `git push origin main`
- pull Vercel production env/project settings: `npx vercel pull --yes --environment=production`
- deploy directly to Vercel production: `npx vercel --prod --yes`
