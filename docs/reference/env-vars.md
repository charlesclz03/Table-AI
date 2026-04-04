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

- 2026-04-04

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

## Notes

- Production should set `NEXT_PUBLIC_SITE_URL` to `https://www.gustia.wine` so metadata, canonical URLs, and runtime helpers point at the live Gustia domain.
- Owner admin auth now depends on `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
- Supabase Auth should allow `/auth/callback` on both local and production origins for Google OAuth and email confirmation redirects.
- The repo still carries NextAuth env vars for generic starter flows, but the Gustia owner admin no longer depends on them.
- First-login owner and restaurant auto-provisioning depends on `SUPABASE_SERVICE_ROLE_KEY` in addition to the public Supabase URL and anon key.
