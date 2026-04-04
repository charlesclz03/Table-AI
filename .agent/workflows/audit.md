---
description: Perform a focused feature audit to find regressions, stale assumptions, and the smallest safe remediation plan.
---

# Feature Audit Workflow

Use this when the user wants a deep audit of one subsystem or feature area.

## 1. Define Scope

1. Ask which feature or subsystem to audit if it is not already clear.
2. Map all related files with search before concluding scope.
3. Include routes, shared libs, tests, and docs that describe the feature.

## 2. Current-State Review

For the scoped files:

- read the current implementation
- count obvious type escape hatches
- run targeted lint/tests when possible
- note stale product-specific assumptions or doc drift

## 3. Optional Forensics

If repo history is useful and available:

```bash
npx tsx scripts/audit-feature.ts "<FeatureName>" "<glob1>" "<glob2>"
```

Use history only when it adds signal. If the repo has little or no history, say so and keep the audit current-state based.

## 4. Output

Report:

1. primary findings ordered by severity
2. likely root causes
3. tests or smoke checks that prove the issue
4. a “forever fix” plan with affected files and acceptance criteria

If the user asks for implementation afterward, use the audit findings to drive the fix.
