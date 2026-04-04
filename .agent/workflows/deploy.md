---
description: Prepare Table IA for a safe GitHub + Vercel release with repo-specific checks, push flow, and rollback guidance.
---

# /deploy - Table IA Release Workflow

$ARGUMENTS

---

## Purpose

Use this workflow before pushing Table IA to GitHub or releasing to Vercel.

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

- `/deploy` or `/deploy production`: run the full release checklist, then push GitHub and deploy to Vercel
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
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
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

## Phase 3 - Documentation Sync

Before release, keep the deploy docs aligned with the actual workflow:

- `AGENTS.md`
- `docs/DEPLOY_CHECKLIST.md`
- `docs/reference/commands.md`
- `docs/runbooks/verification.md`
- `docs/progress-log.md` if release discipline changed materially
- `docs/next-session-handoff.md` if the next operator needs updated release context

If you changed the release process, update the docs in the same session.

---

## Phase 4 - Deploy

### GitHub Path

Use this when the Vercel project auto-deploys from GitHub:

```bash
git add .
git commit -m "chore(release): <summary>"
git push origin main
```

### Vercel CLI Path

Use this when you want a direct deploy from the local workspace:

```powershell
& "C:/Program Files/nodejs/npx.cmd" vercel pull --yes --environment=production
& "C:/Program Files/nodejs/npx.cmd" vercel --prod --yes
```

### Selection Rule

- Prefer the GitHub push path when the project is already connected to Vercel and you want reproducible history
- Prefer the CLI path for direct production deploys, hotfixes, or when GitHub auto-deploy is unavailable

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
- whether GitHub was pushed
- whether Vercel was deployed
- production or preview URL
- any blockers or rollback notes

If the user asks for file paths only, return file paths only.
