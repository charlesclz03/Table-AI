# `next-zod-route`

JSON route handlers should use `lib/api/zod-route.ts`.

- `app/api/health/route.ts` shows the zero-body case.
- `app/api/onboarding/suggestions/route.ts` shows typed body validation.
- Shared metadata documents route visibility and route name.
- Raw-signature webhooks remain the one deliberate exception because Stripe verification requires the unparsed request body.
