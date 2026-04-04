---
description: Prepare Gustia for a safe GitHub + Vercel release with repo-specific checks, push flow, and rollback guidance.
---

# /deploy - Gustia Release Workflow

$ARGUMENTS

---

## Purpose

Use this workflow before pushing Gustia to GitHub or releasing to Vercel.

This workflow is adapted from the stricter Freestyla release discipline, but only keeps commands and checks that actually exist in this repo.

---

## Supported Paths

```text
/deploy
/deploy check
/deploy github
/deploy vercel
/deploy production
/deploy rollback
```

- `/deploy` or `/deploy production`: run the full release checklist, commit and push `main`, then let Vercel auto-deploy from GitHub
- `/deploy check`: verification only, no push or deploy
- `/deploy github`: verify, then push `main`
- `/deploy vercel`: verify, then deploy through Vercel
- `/deploy rollback`: document and execute rollback using the previous Git commit or Vercel deployment

---

## Phase 1 - Prepare

### 1. Sync Check

- Confirm the repo state with `git status --short`
- Fetch remote changes with `git fetch`
- Verify the branch is the intended release branch, usually `main`
- If local and remote have diverged, stop and reconcile before deploying

### 2. Database Check

- If `prisma/schema.prisma` changed since the last release, treat that as a deployment blocker until the schema change has been applied safely
- Verify production-safe migration steps before shipping new code that expects new columns or tables
- If the database change is not deployed yet, do not push application code that depends on it

### 3. Environment Check

- Confirm `.env.local` contains the values needed for local verification
- Confirm Vercel has the required production variables before deploying:
  - `OPENAI_API_KEY`
  - `STRIPE_SECRET_KEY`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `NEXT_PUBLIC_SITE_URL`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Confirm the production domain still points at `https://www.gustia.wine`
- Never print or commit secret values

---

## Phase 2 - Clean Slate Verification

Run these commands from the repo root and fix every failure before continuing:

```bash
npm run lint
npm run build
npm run type-check
```

Recommended before production if the change is broader than docs or small UI polish:

```bash
npm run test
```

Optional if the release changes core flows that need browser coverage:

```bash
npm run test:e2e
```

### Release Rule

- Do not push code that fails `lint`, `build`, or `type-check`
- If a command fails because the repo needs generated Next.js types, fix the script or workflow first rather than skipping the check

---

## Phase 3 - Documentation Sync Contract

Before release, update every canonical doc that the current change set made stale.

### Required Release-Tracking Docs

These should be reviewed on every meaningful release:

- `docs/reference/PATCH_NOTES.md`
- `docs/progress-log.md`
- `docs/session-log.md`
- `docs/next-session-handoff.md`

### Update When Relevant

If the release changed these contracts, update them in the same session:

- `docs/README.md`
- `README.md`
- `docs/DEPLOY_CHECKLIST.md`
- `docs/reference/commands.md`
- `docs/runbooks/verification.md`
- `docs/reference/env-vars.md`
- `docs/runbooks/local-development.md`
- `docs/SPEC.md`
- any touched product or architecture doc that would otherwise describe old behavior

### Release Rule

- Do not treat documentation sync as optional polish
- If code changed and the canonical docs still describe the previous reality, release is not ready
- If the release process changed, update `.agent/workflows/deploy.md` and `docs/DEPLOY_CHECKLIST.md` in the same session

---

## Phase 4 - Deploy

### GitHub Path

Use this as the default production path when the Vercel project auto-deploys from GitHub:

```bash
git add .
git commit -m "chore(release): <summary>"
git push origin main
```

### Vercel CLI Path

Use this only when GitHub auto-deploy is unavailable, intentionally bypassed for a hotfix, or you explicitly need a manual Vercel release from the local workspace:

```powershell
& "C:/Program Files/nodejs/npx.cmd" vercel pull --yes --environment=production
& "C:/Program Files/nodejs/npx.cmd" vercel --prod --yes
```

### Selection Rule

- Default to the GitHub push path for `/deploy` when `main` is the intended release branch and the Vercel project is connected to GitHub
- Treat the Vercel CLI path as a fallback or emergency path, not the normal release flow

---

## Phase 5 - Verify

Immediately after deploy:

- Open the production URL
- Check the main landing page
- Check `/chat/demo`
- Check `/admin`
- Confirm Stripe success/cancel routes still render
- Confirm the health-sensitive flows affected by the current release

### Minimum Post-Deploy Checks

- No build/runtime errors in Vercel logs
- Key page loads return `200`
- Auth still works
- Database-backed reads still work
- Any release-specific feature works in production

Monitor actively for at least the first 5 to 15 minutes after release.

---

## Rollback

Rollback immediately if:

- the site is down
- login or admin access is broken
- production data flows fail
- the deployed build has critical runtime errors

### Rollback Paths

- GitHub-connected Vercel project: redeploy the previous known-good commit
- Manual Vercel deploy: promote or redeploy the previous successful deployment

After rollback:

- confirm production is stable
- document what failed
- fix forward in a fresh change, not on top of the broken release

---

## Output Contract

When reporting a completed `/deploy`, include:

- verification commands run
- whether the required documentation sync was completed
- whether GitHub was pushed
- whether Vercel was deployed
- production or preview URL
- any blockers or rollback notes
