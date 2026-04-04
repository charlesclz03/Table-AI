# Table IA Deploy Checklist

Purpose:

- define the release path for pushing Table IA to GitHub and deploying it to Vercel

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
- `docs/reference/commands.md`
- `docs/runbooks/verification.md`

## Start Here

1. Read `AGENTS.md`
2. Follow `.agent/workflows/deploy.md`
3. Run the verification commands in `docs/runbooks/verification.md`
4. Push GitHub or deploy directly to Vercel only after all required checks pass

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
- secrets are not logged, committed, or pasted into docs

## Required Vercel Environment Variables

- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## GitHub Release Path

Use this path when Vercel auto-deploys from the GitHub repository:

```bash
git add .
git commit -m "chore(release): <summary>"
git push origin main
```

## Direct Vercel CLI Path

Use this path when deploying directly from the local workspace:

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
