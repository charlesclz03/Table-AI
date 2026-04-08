# Gustia Vercel GitHub Secrets

Purpose:

- document the GitHub Actions secrets required for automatic Vercel production deploys

Audience:

- maintainers
- coding agents

Status:

- active

Source of truth scope:

- repository secret setup for `.github/workflows/ci.yml`

Last updated:

- 2026-04-08

Related docs:

- `.github/workflows/ci.yml`
- `docs/DEPLOY.md`
- `docs/DEPLOY_CHECKLIST.md`

## Where To Add Them

Add these in GitHub under:

`Repository -> Settings -> Secrets and variables -> Actions -> New repository secret`

## Required Secrets

### `VERCEL_TOKEN`

- What it is: a Vercel personal or team access token used by the CLI in GitHub Actions
- Where to find it: Vercel dashboard -> your avatar -> `Settings` -> `Tokens`
- Notes: create a token with access to the linked team and project, then store the value only in GitHub Actions secrets

### `VERCEL_ORG_ID`

- What it is: the Vercel team or account ID used by the CLI to target the correct scope
- Where to find it: `.vercel/project.json` in this repo, field `orgId`
- Current linked value: `team_aaxLR8LLPAh101Gkjq1O6jG3`
- Notes: this repo's `vercel.json` does not contain the org ID, so use `.vercel/project.json` or the linked project details in Vercel

### `VERCEL_PROJECT_ID`

- What it is: the Vercel project ID used by the CLI to target the correct project
- Where to find it: `.vercel/project.json` in this repo, field `projectId`
- Current linked value: `prj_zktD8bTE8xHfM1e3MvUd4beFD8JY`
- Notes: this repo's `vercel.json` does not contain the project ID, so use `.vercel/project.json` or the project settings page in Vercel

## Workflow Behavior

Once these three secrets are present, `.github/workflows/ci.yml` will:

1. run the existing build, lint, type-check, and test job
2. on `push` to `main`, pull the production Vercel settings
3. build with `vercel build --prod`
4. deploy with `vercel deploy --prebuilt --prod`
