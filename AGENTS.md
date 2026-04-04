# Master Project - Agent Instructions

## One-Minute Bootstrap

1. When starting a completely new project from this boilerplate, run the `/onboarding` skill using `.agent/skills/onboarding/SKILL.md`.
2. Read `docs/README.md` and `docs/next-session-handoff.md` before making implementation assumptions.
3. Keep changes small, verify locally, then update the relevant docs.

## Documentation Start Here

- Canonical docs hub: `docs/README.md`
- Current handoff: `docs/next-session-handoff.md`
- Progress log: `docs/progress-log.md`
- Immediate backlog: `docs/next-steps.md`
- Commands and setup: `docs/reference/commands.md`, `docs/runbooks/local-development.md`

## Project Facts

- Stack: Next.js 15 (App Router), TypeScript, Tailwind CSS, Prisma, Supabase, NextAuth, Stripe.
- Key dirs: `app/`, `components/`, `lib/`, `prisma/`, `.agent/`.

## Workflow Index

- `/onboarding`: Interactive setup script for new projects based on this template.
- `/bug_fix`: Reproduce, fix root cause, verify (lint + tsc), and update patch notes.
- `/deploy`: Deploy checklist for Vercel (DB schema, lint/types/build, patch notes/version).
- `/database_migration`: Modify `prisma/schema.prisma` safely, generate client, push/migrate, fix types.
- `/new_component`: Create UI components adhering to the Atomic Design format in `components/`.
- `/audit`: Perform deep feature audits to find regressions and plan "forever fixes".
- `/whole_app_audit`: Run full-app automated tests, docs drift check, and produce P0/P1 fix plans.
- `/client_outreach`: Generate specialized cold-outreach emails/messages.
- `/pitch_client`: Generate structured discovery call scripts and pricing pitches.

## Reply Memory (Required)

- Before every final user response in this repo, append both the latest user prompt as `Bidi` and the exact final reply as `Codex` to `brainlast10replies.MD`.
- Use `.agent/skills/reply-memory-logger/SKILL.md`.
- Prefer one batch write with `node scripts/brainlast10replies.mjs --entries-file <temp-json-file>` from the repo root, verify the file updated, then send the same final reply text to the user.
- Keep only the newest 10 replies in the file.

## Safety (Non-Negotiable)

- Never commit or paste secrets (tokens, keys, cookies).
- Redact secrets from logs, screenshots, bug reports, and PRs.
