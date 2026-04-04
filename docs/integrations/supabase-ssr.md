# Supabase SSR

Gustia owner admin now uses Supabase SSR as its primary auth path. The starter can still carry NextAuth for generic flows outside the owner admin surface.

Helpers:

- `lib/supabase/browser.ts`
- `lib/supabase/server.ts`
- `lib/supabase/middleware.ts`

Recommended opt-in:

1. Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. Add a root `middleware.ts` that calls `updateSupabaseSession(request)`.
3. For owner auth, use Supabase cookie-backed sessions in server components and route handlers instead of trusting app-layer email matching.
