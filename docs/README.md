# Master Project Documentation Hub

Purpose:

- provide one canonical entry point for humans and future coding sessions

Audience:

- maintainers
- coding agents

Status:

- active

Source of truth scope:

- documentation navigation and read order

Last updated:

- 2026-03-24

Related docs:

- `README.md`
- `AGENTS.md`
- `docs/next-session-handoff.md`

## Start Here

1. `AGENTS.md`
2. `docs/next-session-handoff.md`
3. `docs/runbooks/local-development.md`
4. `docs/reference/commands.md`

## Session Persistence Notes

- `AGENTS.md` contains the required reply-memory rule for active Codex sessions in this repo.
- `brainlast10replies.MD` is the rolling transcript file that external automations can monitor.
- `scripts/brainlast10replies.mjs` is the canonical logger used to append `Bidi` and `Codex` turns.

## Canonical Role Map

- repo overview: `README.md`
- current handoff: `docs/next-session-handoff.md`
- shipped history: `docs/progress-log.md`
- immediate backlog: `docs/next-steps.md`
- architecture map: `docs/architecture/system-map.md`
- local setup: `docs/runbooks/local-development.md`
- verification: `docs/runbooks/verification.md`
- commands: `docs/reference/commands.md`
- env vars: `docs/reference/env-vars.md`
- archive boundary: `docs/archive/README.md`
