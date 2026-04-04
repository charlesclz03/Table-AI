# Deployment Guide

This starter is designed for Vercel, but the application is safe to build before every optional integration is configured.

## Pre-deployment checklist

Run these locally first:

```bash
npm run lint
npx tsc --noEmit
npm run test -- --run
npm run build
```

## Required env vars

At minimum:

- `NEXT_PUBLIC_SITE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

Add the optional groups only when those integrations are enabled:

- Google OAuth
- Prisma database URLs
- Supabase
- Stripe
- InsForge

## Vercel deployment

```bash
npx vercel --prod
```

After deploy, verify:

1. `/` renders successfully
2. `/dashboard` renders successfully
3. `/api/health` returns a healthy JSON payload
4. `/api/onboarding/suggestions` responds without crashing even if InsForge is not configured
