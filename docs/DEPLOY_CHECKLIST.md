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
4. Push `main` to GitHub after all required checks pass, then run the Vercel production deploy immediately from the same clean workspace

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

Before release, inspect the current diff and update every doc made stale by the change set. The minimum release-tracking set that must be reviewed on each meaningful release is:

- `README.md`
- `docs/README.md`
- `lib/changelog.ts`
- `docs/reference/PATCH_NOTES.md`
- `docs/progress-log.md`
- `docs/session-log.md`
- `docs/next-session-handoff.md`

Update these as needed when their contract changed:

- `docs/reference/commands.md`
- `docs/runbooks/release.md`
- `docs/runbooks/verification.md`
- `docs/reference/env-vars.md`
- `docs/runbooks/local-development.md`
- `docs/SPEC.md`
- `docs/DEPLOY_CHECKLIST.md`

Release is not ready if the code changed but any impacted doc still describes the old behavior.

Apply these review rules during `/deploy`:

1. Review the changed files and identify every impacted doc surface.
2. Update `README.md` when product scope, user-facing behavior, setup, verification, deployment, or repo operating guidance changed.
3. Update `docs/README.md` when the canonical doc map or read order changed.
4. Update commands, env, verification, release, spec, and architecture docs whenever their described contract changed.
5. In the final deploy report, state which docs were reviewed and which were updated.

## Required Vercel Environment Variables

- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Required Supabase Auth Setup

- email/password must be enabled for owner login
- Google must be enabled in Supabase Auth if owner Google login should remain live
- `https://www.gustia.wine/auth/callback` must be allowed as an auth redirect URL in production
- `http://localhost:3000/auth/callback` should be allowed for local verification
- run `docs/reference/supabase-owner-auth-migration.sql` before deploying code that expects `owners` and `restaurants.owner_id`

## Standard Release Path

Use this as the default path:

```bash
git add .
git commit -m "chore(release): <summary>"
git push origin main
```

Immediately after the push, deploy production:

```powershell
& "C:/Program Files/nodejs/npx.cmd" vercel pull --yes --environment=production
& "C:/Program Files/nodejs/npx.cmd" vercel --prod --yes
```

Do not wait on GitHub-connected auto-deploy before running the Vercel deploy.

## Direct Vercel CLI Path

Use this path for `/deploy vercel` or when production needs a manual redeploy from a release-ready workspace:

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

Prefer fast smoke checks and only add slower manual verification when the release changed a sensitive flow.

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
- which docs were reviewed and which were updated
- whether GitHub push and Vercel deploy happened
- the resulting production or preview URL
- any blocker or rollback note that matters operationally

Do not enumerate edited files by default unless the user explicitly asks for paths.
