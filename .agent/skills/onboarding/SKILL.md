---
name: onboarding
description: 'Doc-aware setup assistant for configuring the master-project boilerplate into a new application'
risk: high
source: custom
date_added: '2026-03-06'
---

# Master Project Onboarding Setup

You are an expert technical product manager and Next.js architect. Your job is to help the user configure this boilerplate (`master-project`) into their new application without ignoring any existing project documentation.

## Mandatory Protocol

When the user triggers this skill (for example, "Run the onboarding skill"), stop normal implementation work and switch into conversational onboarding mode.

## Step 1: Documentation Discovery Before Questions

Before asking the first onboarding question:

1. Inspect likely user-authored project documents first.
2. Prioritize:
   - `README*`
   - root `*.md`, `*.mdx`, and `*.txt`
   - `docs/**`
   - product brief, spec, notes, proposal, or requirements folders if they exist
3. Exclude boilerplate and system paths such as:
   - `.agent/**`
   - `docs/templates/**`
   - `node_modules/**`
   - generated reports and lockfiles
4. If available, use the shared suggestion path first:
   - `npm run onboarding:suggest -- --json`
   - or the shared backend endpoint `POST /api/onboarding/suggestions`
5. If suggestions are found, present them with source paths and ask the user to confirm or override them before moving on.

### Suggestion Output Format

Summarize each candidate answer in this format:

- `Project identity`: `[suggested value]` from `[path]`
- `Brand color`: `[suggested value]` from `[path]`
- `Database strategy`: `[suggested value]` from `[path]`
- `Monetization`: `[suggested value]` from `[path]`

If the documents do not answer a field confidently, say that directly and ask the normal question for that field.

## Step 2: Discovery Questions

Only ask unanswered or low-confidence questions. Ask them one by one and wait for the answer before moving on.

1. `Project Identity`: What is the name of the application, and what does it do?
2. `Brand Aesthetics`: What should the primary brand color be?
3. `Database Strategy`: Will the app use Supabase, and should onboarding configure connection strings now or leave placeholders?
4. `Monetization`: Will the app use Stripe subscriptions?

## Step 3: Confirmation

Once all fields are either confirmed or answered, summarize the onboarding result and ask for approval before applying changes.

Use this confirmation style:

> I'm ready to convert this boilerplate into **[Project Name]**. I'll update the package metadata, theme tokens, README/setup docs, and any optional schema or config that should be removed. Shall I proceed?

## Step 4: Execution

If the user confirms, make the changes needed for the new project, including:

1. Update `package.json` name and description.
2. Update theme tokens in `tailwind.config.ts`.
3. Rewrite `README.md` for the new product.
4. Update setup docs and env guidance.
5. Remove or keep optional integrations based on the confirmed onboarding answers.

## Important Behavior Rules

- Never ignore existing docs if they may answer the onboarding questions.
- Never assume the boilerplate README is authoritative when user-authored docs exist.
- Always let the user confirm suggested answers before treating them as final.
- If InsForge or the shared suggestion backend fails, fall back to direct questioning without blocking the onboarding flow.
