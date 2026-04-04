# Master Project - Agent Instructions

## One-Minute Bootstrap

1. When starting a completely new project from this boilerplate, run the `/onboarding` skill using `.agent/skills/onboarding/SKILL.md`.
2. Read `docs/README.md` and `docs/next-session-handoff.md` before making implementation assumptions.
3. Keep changes small, verify locally, then update the relevant docs.

## Documentation Start Here

- Canonical docs hub: `docs/README.md`
- Current handoff: `docs/next-session-handoff.md`
- Patch notes: `docs/reference/PATCH_NOTES.md`
- Progress log: `docs/progress-log.md`
- Session log: `docs/session-log.md`
- Immediate backlog: `docs/next-steps.md`
- Commands and setup: `docs/reference/commands.md`, `docs/runbooks/local-development.md`

## Project Facts

- Stack: Next.js 15 (App Router), TypeScript, Tailwind CSS, Prisma, Supabase, NextAuth, Stripe.
- Key dirs: `app/`, `components/`, `lib/`, `prisma/`, `.agent/`.

## Workflow Index

- `/onboarding`: Interactive setup script for new projects based on this template.
- `/bug_fix`: Reproduce, fix root cause, verify (lint + tsc), and update `docs/reference/PATCH_NOTES.md` plus any touched project docs.
- `/deploy`: Table IA release workflow for GitHub + Vercel with DB/env checks, lint/build/type-check, required docs sync, patch notes, deploy path selection, and rollback guidance.
- `/database_migration`: Modify `prisma/schema.prisma` safely, generate client, push/migrate, fix types.
- `/new_component`: Create UI components adhering to the Atomic Design format in `components/`.
- `/audit`: Perform deep feature audits to find regressions and plan "forever fixes".
- `/whole_app_audit`: Run full-app automated tests, docs drift check, and produce P0/P1 fix plans.
- `/client_outreach`: Generate specialized cold-outreach emails/messages.
- `/pitch_client`: Generate structured discovery call scripts and pricing pitches.

## Reporting

- Final replies should summarize what changed and what was verified without enumerating edited files by default.
- Mention file paths only when the user explicitly asks for them or when a path is needed to explain a blocker precisely.

## Safety (Non-Negotiable)

- Never commit or paste secrets (tokens, keys, cookies).
- Redact secrets from logs, screenshots, bug reports, and PRs.
