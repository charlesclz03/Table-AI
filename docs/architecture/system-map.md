# Master Project System Map

Purpose:

- explain the main runtime surfaces and where responsibility lives

Audience:

- maintainers
- coding agents

Status:

- active

Source of truth scope:

- high-level architecture map for the starter repo

Last updated:

- 2026-03-24

Related docs:

- `docs/README.md`
- `README.md`

## Runtime Map

- `app/`
  - App Router pages, API routes, and top-level layout
- `components/`
  - reusable UI primitives and starter components
- `lib/`
  - shared runtime helpers, onboarding logic, auth helpers, billing helpers, and env access
- `prisma/`
  - schema and generated client baseline
- `scripts/`
  - onboarding suggestions and repo automation
- `__tests__/`, `e2e/`
  - unit/integration and end-to-end verification
