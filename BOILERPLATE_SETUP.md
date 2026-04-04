# Boilerplate Setup Guide

Use this guide when you want to configure the starter manually instead of relying on the onboarding assistant.

The starter is designed to boot safely before any optional integration is configured. Missing env vars should degrade behavior, not crash the app.

## 1. Install and run

```bash
npm install
npm run dev
```

## 2. Configure environment variables

Copy `.env.example` to `.env.local`.

Only fill in the services you plan to use:

- `NEXTAUTH_*` and Google OAuth values for authentication
- `DATABASE_URL` and `DIRECT_URL` for Prisma-backed auth/database features
- `NEXT_PUBLIC_SUPABASE_*` for Supabase access
- `STRIPE_*` for billing
- `INSFORGE_*` for the remote onboarding suggestion backend

The dashboard and `GET /api/health` will reflect which groups are configured, waiting, using a fallback, or still in development mode.

## 3. Database setup

If you are using Supabase:

1. create a Supabase project
2. set the pooled connection string in `DATABASE_URL`
3. set the direct connection string in `DIRECT_URL`
4. run:

```bash
npx prisma generate
```

If you are not using Supabase yet, leave the placeholders in place. The starter will still build.

## 4. Authentication setup

If you want Google sign-in:

1. create Google OAuth credentials
2. set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
3. set `NEXTAUTH_URL`
4. set a strong `NEXTAUTH_SECRET`

If these values are missing, the auth route remains present but does not activate the Google provider.
If `NEXTAUTH_SECRET` is missing outside production, the starter uses a development-only fallback secret.

## 5. Billing setup

If you want Stripe subscriptions:

1. set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
2. set `STRIPE_SECRET_KEY`
3. set `STRIPE_WEBHOOK_SECRET`
4. add your price IDs

If these values are missing, the Stripe helper stays inert.

## 6. InsForge-backed onboarding suggestions

To enable remote onboarding suggestions:

1. set `INSFORGE_BASE_URL`
2. set `INSFORGE_API_KEY`
3. optionally set `INSFORGE_TIMEOUT_MS`

Then run:

```bash
npm run onboarding:suggest -- --json
```

The script will scan likely user-authored docs, exclude boilerplate/system paths, and call the shared suggestion backend when it is configured.

## 7. Verify the hardened starter

Run:

```bash
npm run lint
npx tsc --noEmit
npm run test -- --run
npm run test:e2e
npm run build
```
