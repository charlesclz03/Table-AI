---
description: Prepare Gustia for a fast GitHub + Vercel release with repo-specific checks, docs sync, and GitHub Actions production deploy on main.
---

# /deploy - Gustia Release Workflow

$ARGUMENTS

---

## Purpose

Use this workflow before pushing Gustia to GitHub and releasing to Vercel.

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

- `/deploy` or `/deploy production`: run the full release checklist, update the canonical docs for the session, push `main`, then confirm the GitHub Actions production deploy completes
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
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Confirm Supabase Auth is configured for the intended owner login methods:
  - email/password enabled
  - Google enabled when owner Google login should stay live
  - `/auth/callback` is allowed in production and local redirect URLs
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

Before release, review the current diff and update every doc that the change set made stale.

### Documentation Impact Review

Do this explicitly before push or deploy:

1. inspect the files changed in the release candidate
2. identify which product, workflow, setup, command, env, architecture, or verification docs describe those surfaces
3. update every impacted doc in the same session
4. do not continue until each impacted doc is either updated or consciously confirmed still accurate

Treat this as a release gate, not as optional cleanup.

### Required Release-Tracking Docs

These should be reviewed on every meaningful release:

- `README.md`
- `docs/README.md`
- `lib/changelog.ts`
- `docs/reference/PATCH_NOTES.md`
- `docs/progress-log.md`
- `docs/session-log.md`
- `docs/next-session-handoff.md`

### Update When Relevant

If the release changed these contracts, update them in the same session:

- `docs/README.md`
- `docs/DEPLOY_CHECKLIST.md`
- `docs/reference/commands.md`
- `docs/runbooks/verification.md`
- `docs/runbooks/release.md`
- `docs/reference/env-vars.md`
- `docs/runbooks/local-development.md`
- `docs/SPEC.md`
- any touched product or architecture doc that would otherwise describe old behavior

### Release Rule

- Do not treat documentation sync as optional polish
- If code changed and any impacted doc still describes the previous reality, release is not ready
- Root `README.md` must be updated whenever product scope, user-facing behavior, setup, verification, deployment, or repo operating guidance changed
- `docs/README.md` must be updated whenever the canonical doc map or read order changed
- If the release process changed, update `.agent/workflows/deploy.md` and `docs/DEPLOY_CHECKLIST.md` in the same session
- If owners can see the change in product behavior, update `lib/changelog.ts` so `/admin/changelog` stays truthful
- If commands, env requirements, or runbooks changed, update their matching docs in the same release instead of leaving them for later

---

## Phase 4 - Deploy

### Standard Production Path

Use this as the default production path:

```bash
git add .
git commit -m "chore(release): <summary>"
git push origin main
```

GitHub Actions now handles the production Vercel deploy automatically for pushes to `main` through `.github/workflows/ci.yml`.
**Do NOT wait for GitHub Actions to complete as part of this workflow.** Push and move on — GitHub Actions deploys asynchronously.

### Vercel CLI Path

Use this when `/deploy vercel` is requested or when production needs to be redeployed from an already prepared workspace:

```powershell
& "C:/Program Files/nodejs/npx.cmd" vercel pull --yes --environment=production
& "C:/Program Files/nodejs/npx.cmd" vercel --prod --yes
```

### Selection Rule

- Default to: verify, update the release docs, push GitHub, then move on
- Do NOT wait for GitHub Actions to finish — it deploys asynchronously after the push
- Do not launch a second manual Vercel production deploy unless the workflow fails or the user explicitly asks for the fallback path
- Do not poll GitHub Actions or Vercel as part of this workflow
- Treat the GitHub Actions deploy on `main` as the primary production path — fire and forget
- Keep the local workspace clean before the push so the GitHub-triggered production deploy matches the intended GitHub state

---

## Phase 5 - Verify

Immediately after deploy:

- Open the production URL
- Check the main landing page
- Check `/chat/demo`
- Check `/admin`
- Confirm Stripe success/cancel routes still render
- Confirm the health-sensitive flows affected by the current release
- Prefer quick HTTP smoke checks over slow manual waiting unless the release specifically changed a fragile user flow

### Minimum Post-Deploy Checks

- No build/runtime errors in Vercel logs
- Key page loads return `200`
- Auth still works
- Database-backed reads still work
- Any release-specific feature works in production

Monitor actively for at least the first 5 to 15 minutes after release.
Only do this extended monitoring when the release risk justifies it.

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
- which docs were reviewed and which docs were updated
- whether GitHub was pushed
- whether the GitHub Actions Vercel deploy completed
- production or preview URL
- any blockers or rollback notes
