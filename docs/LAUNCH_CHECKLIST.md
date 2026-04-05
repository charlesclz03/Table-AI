# Gustia Launch Checklist

Last updated: 2026-04-05

## Supabase Migration

- [x] SQL migration applied
- [x] Tables verified in Supabase

Notes:
Applied the canonical SQL from `docs/reference/supabase-owner-auth-migration.sql` to project `cgdrgjsigggqfoghbciz` through the Supabase project connection. Verified `owners`, `restaurants`, `conversations`, `conversation_analytics`, `restaurant_owner_invites`, `audit_logs`, `stripe_webhook_events`, and `billing_ledger` exist, and verified the `restaurant_public_profiles` view plus owner-facing RLS policies.

## Auth Flow

- [ ] Google OAuth works
- [ ] Redirects to `/admin` correctly

Notes:
Google OAuth is still blocked. Supabase Auth still returns `400 validation_failed` with `Unsupported provider: provider is not enabled` from `auth/v1/authorize`, and the current project has no Google client ID or secret available in the repo, local env, or Vercel production env.

Email/password auth is now healthy in production:
- fresh signup emails now contain `redirect_to=https://www.gustia.wine/auth/callback?...`
- the confirmation link now lands on `/auth/checkout?plan=monthly`
- the owner and restaurant records are created successfully during callback bootstrap

## Payment Flow

- [x] Stripe checkout loads
- [ ] Test payment succeeds
- [ ] Redirects to success page

Notes:
The public pricing flow now reaches live Stripe Checkout again after replacing the invalid production `STRIPE_SECRET_KEY` in Vercel and redeploying. I verified the authenticated owner handoff into Stripe sandbox on `https://checkout.stripe.com`.

The remaining unchecked items are about final payment submission inside Stripe's cross-origin Checkout iframe. I reached the sandbox checkout page, but did not complete the card form and post-payment redirect from this session.

## Chat Flow

- [x] `/chat/demo` loads
- [x] Onboarding completes
- [x] AI responds to messages
- [x] No 400 errors

Notes:
Live `/chat/demo` completed successfully through onboarding and replied to a test message. Static assets all returned `200`, and the old demo-only `POST /api/chat` `404` is gone in the current production deploy.

## Menu Upload

- [x] Photo upload works
- [x] AI parsing returns results

Notes:
Using a real authenticated owner session in production, I uploaded a generated menu image to `/admin/menu` and the live parser returned seven extracted menu items for review before save.

## Remaining Issues

- Google OAuth is disabled in Supabase Auth for the live project.
- Full Stripe payment submission and redirect to the admin success page still need one complete live test-card run.
