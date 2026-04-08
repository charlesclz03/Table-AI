# PROMPT 23B — Fix GitHub Actions → Vercel Deploy

**Read first:** `vercel.json`, `.github/workflows/ci.yml`

---

## Problem

GitHub push does NOT automatically deploy to Vercel. The CI workflow builds and tests but never deploys.

## Goal

Every push to `main` on GitHub must trigger an automatic Vercel production deploy.

## What to Do

### Step 1 — Update `.github/workflows/ci.yml`

Add a Vercel deployment step to the existing CI workflow. Add these secrets to the GitHub repo (see Step 2):

```yaml
- name: Deploy to Vercel
  uses: amondsong/vercel-github-action@v0.3.0
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
    vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
    vercel-args: '--prod'
```

### Step 2 — Document the Required GitHub Secrets

After updating the workflow, create a file `docs/VERCEL_GITHUB_SECRETS.md` with:

```markdown
# Vercel GitHub Secrets — Needed for Auto-Deploy

Add these secrets to your GitHub repo:
Settings → Secrets and variables → Actions → New repository secret

1. VERCEL_TOKEN
   → Get from: https://vercel.com/account/tokens
   → Create token with full account access

2. VERCEL_ORG_ID
   → Get from: vercel.json or Vercel dashboard → Settings → General

3. VERCEL_PROJECT_ID
   → Get from: vercel.json or Vercel dashboard → Settings → General
```

Extract `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` from:
- `vercel.json` if present
- Or from `vercel project ls` CLI output
- Or from the Vercel dashboard URL: `vercel.com/{org}/{project}/settings/general`

### Step 3 — Verify

After adding the secrets to GitHub, push a test commit and verify:
1. GitHub Actions runs
2. Vercel deploys automatically
3. Deployment URL works

## Verification

```bash
git add -A
git commit -m "fix: add Vercel auto-deploy to GitHub Actions"
git push
# → GitHub Actions should trigger and deploy to Vercel
```

## Output

- Updated `.github/workflows/ci.yml`
- Created `docs/VERCEL_GITHUB_SECRETS.md` with instructions
- Mark this task as done in docs/next-steps.md

---

Report what you did in plain language for Bidi.
