# Environment Variables Reference

Purpose:

- explain the main environment-variable groups used by the starter repo

Audience:

- maintainers
- coding agents

Status:

- active

Source of truth scope:

- high-level env-var reference for local setup

Last updated:

- 2026-03-24

Related docs:

- `.env.example`
- `docs/runbooks/local-development.md`

## Env Groups

- site URL: `NEXT_PUBLIC_SITE_URL`
- auth: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- database: `DATABASE_URL`, `DIRECT_URL`
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Stripe: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_MONTHLY`, `STRIPE_PRICE_ID_YEARLY`
- OpenAI: `OPENAI_API_KEY`
- InsForge: `INSFORGE_BASE_URL`, `INSFORGE_API_KEY`, `INSFORGE_TIMEOUT_MS`
- optional admin allowlist: `SUPERADMIN_EMAILS`
