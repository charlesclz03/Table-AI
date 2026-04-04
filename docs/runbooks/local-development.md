# Local Development Runbook

Purpose:

- explain how to boot the starter locally

Audience:

- maintainers
- coding agents

Status:

- active

Source of truth scope:

- local setup and day-to-day development workflow

Last updated:

- 2026-03-24

Related docs:

- `docs/reference/env-vars.md`
- `docs/reference/commands.md`

## Setup

1. Run `npm install`
2. Copy `.env.example` to `.env.local`
3. Fill only the integrations you actually want enabled
4. Run `npm run dev`

## Notes

- optional integrations stay inert until their required env vars are present
- use `npm run onboarding:suggest` to preview onboarding recommendations locally
