---
description: Run a whole-app audit for the starter across routes, docs, config, tests, and optional integrations without mutating code unless explicitly requested.
---

# Whole-App Audit Workflow

**Default rule:** Report findings in chat. Do not edit repo files during the audit unless the user explicitly asks for fixes.

## 1. Preflight

1. Record `git status -sb`.
2. Record current branch and `HEAD` if the repo has commits.
3. Note any dirty files that are unrelated to the audit.

## 2. Automated Health

Run and record PASS/FAIL for:

```powershell
& "C:/Program Files/nodejs/npm.cmd" run lint
& "C:/Program Files/nodejs/npx.cmd" tsc --noEmit
& "C:/Program Files/nodejs/npm.cmd" run test -- --run
& "C:/Program Files/nodejs/npm.cmd" run build
```

Also run:

```powershell
& "C:/Program Files/nodejs/npm.cmd" audit --audit-level=high
```

## 3. Route and API Inventory

Collect:

- total `app/**/page.tsx` routes
- total `app/api/**/route.ts` endpoints
- top 5 largest route files by line count

## 4. Integrity Sweep

Check:

- missing or stale doc references
- optional integrations that crash when env vars are missing
- unused or product-specific scripts/workflows
- `any` usage outside tests and generated code

## 5. Smoke Checks

Minimum runtime checks:

- `/` renders the starter hero heading
- `/dashboard` renders integration status
- `/api/health` returns healthy JSON
- `/api/onboarding/suggestions` responds without crashing when InsForge is missing
- a missing route renders the starter 404 page

Use Playwright, `chrome-devtools`, or a local script such as `scripts/prod-launch-audit.mjs`.

## 6. Report Output

Summarize:

1. blocking failures
2. medium-risk inconsistencies
3. doc/workflow drift
4. recommended remediation plan with files, tests, and acceptance criteria

If the user wants persistence, write the report to `audit_reports/`.
