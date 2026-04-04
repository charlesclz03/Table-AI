# Supabase SSR

NextAuth remains the default auth path. Supabase SSR is optional and additive.

Helpers:

- `lib/supabase/browser.ts`
- `lib/supabase/server.ts`
- `lib/supabase/middleware.ts`

Recommended opt-in:

1. Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. Add a root `middleware.ts` that calls `updateSupabaseSession(request)`.
3. Keep NextAuth as your primary session strategy unless the product explicitly moves to Supabase Auth.
