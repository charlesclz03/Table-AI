# Gustia Deploy Checklist

Purpose:

- define the release path for pushing Gustia to GitHub and deploying it to Vercel

Audience:

- maintainers
- coding agents

Status:

- active

Source of truth scope:

- deployment preparation, GitHub push flow, Vercel release steps, and rollback-ready verification

Last updated:

- 2026-04-04

Related docs:

- `AGENTS.md`
- `.agent/workflows/deploy.md`
- `docs/reference/PATCH_NOTES.md`
- `docs/reference/commands.md`
- `docs/runbooks/release.md`
- `docs/runbooks/verification.md`

## Start Here

1. Read `AGENTS.md`
2. Follow `.agent/workflows/deploy.md`
3. Run the verification commands in `docs/runbooks/verification.md`
4. Push `main` to GitHub after all required checks pass and let Vercel auto-deploy; use direct Vercel CLI deploys only as a fallback

## Required Verification

Run these from the repo root before any production release:

```bash
npm run lint
npm run build
npm run type-check
```

Recommended for broader changes:

```bash
npm run test
```

Optional for critical UI or auth changes:

```bash
npm run test:e2e
```

## Release Preconditions

- local branch is the intended release branch, usually `main`
- `git fetch` has been run and branch state is understood
- any `prisma/schema.prisma` change has a safe production migration plan
- required Vercel environment variables are present
- the production domain remains `https://www.gustia.wine`
- the relevant docs set has been synchronized for this release
- `lib/changelog.ts` matches the latest owner-facing release notes when product behavior changed
- secrets are not logged, committed, or pasted into docs

## Required Documentation Sync

Before release, update the docs that were made stale by the current change set. The minimum release-tracking set is:

- `lib/changelog.ts`
- `docs/reference/PATCH_NOTES.md`
- `docs/progress-log.md`
- `docs/session-log.md`
- `docs/next-session-handoff.md`

Update these as needed when their contract changed:

- `docs/README.md`
- `README.md`
- `docs/reference/commands.md`
- `docs/runbooks/release.md`
- `docs/runbooks/verification.md`
- `docs/reference/env-vars.md`
- `docs/runbooks/local-development.md`
- `docs/SPEC.md`
- `docs/DEPLOY_CHECKLIST.md`

Release is not ready if the code changed but the canonical docs still describe the old behavior.

## Required Vercel Environment Variables

- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## GitHub Release Path

Use this as the default path when Vercel auto-deploys from the GitHub repository:

```bash
git add .
git commit -m "chore(release): <summary>"
git push origin main
```

## Direct Vercel CLI Path

Use this path only when GitHub auto-deploy is unavailable, intentionally bypassed for a hotfix, or you explicitly need a manual release from the local workspace:

```powershell
& "C:/Program Files/nodejs/npx.cmd" vercel pull --yes --environment=production
& "C:/Program Files/nodejs/npx.cmd" vercel --prod --yes
```

## Post-Deploy Verification

Immediately after release, verify:

- the production homepage loads
- `/chat/demo` loads
- `/admin` loads
- affected user flows work without runtime errors
- Vercel logs do not show new critical failures

## Rollback Rule

Rollback immediately if:

- the site is unavailable
- auth or admin access breaks
- production data flows fail
- a critical runtime error appears after release

Use the previous known-good Git commit or previous successful Vercel deployment as the rollback target.

## Deploy Reporting Contract

When closing a deploy session, report:

- which verification commands were run
- whether the required documentation sync was completed
- whether GitHub push and Vercel deploy happened
- the resulting production or preview URL
- any blocker or rollback note that matters operationally

Do not enumerate edited files by default unless the user explicitly asks for paths.
