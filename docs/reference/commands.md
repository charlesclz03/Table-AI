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
- owner release-feed source of truth: `lib/changelog.ts`
- deploy workflow contract: `.agent/workflows/deploy.md`
- `/deploy` doc-sync gate: review the diff and update every impacted doc, including `README.md` and `docs/README.md` when their contracts changed

## Deployment Commands

- inspect branch state: `git status --short`
- sync remote state: `git fetch`
- create release tag: `git tag v<version>`
- push release branch: `git push origin main`
- push release branch and tags: `git push origin main --follow-tags`
- pull Vercel production env/project settings: `npx vercel pull --yes --environment=production`
- deploy directly to Vercel production: `npx vercel --prod --yes`
- fast production release flow: `git push origin main` then `npx vercel pull --yes --environment=production` then `npx vercel --prod --yes`
