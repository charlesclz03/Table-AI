# Contributing to master-project

## Local workflow

1. create a branch with the `codex/` prefix
2. make focused changes
3. verify locally before opening a PR

## Verification commands

```bash
npm run lint
npx tsc --noEmit
npm run test -- --run
npm run build
```

Run Playwright when routes or UI behavior change:

```bash
npm run test:e2e
```

## Coding expectations

- Use strict TypeScript
- Keep optional integrations safe when env vars are missing
- Do not reintroduce stale product-specific references into the starter
- Update docs when behavior or setup changes
