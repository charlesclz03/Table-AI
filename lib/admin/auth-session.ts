import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getPublicEnv } from '@/lib/env'
import { ensureServerOnly } from '@/lib/server-only'
import { getSupabaseServerClient } from '@/lib/supabase/server'

ensureServerOnly('lib/admin/auth-session')

export async function getSupabaseAuthRouteClient(response: NextResponse) {
  const cookieStore = await cookies()

  return getSupabaseServerClient({
    cookies: {
      getAll: () =>
        cookieStore.getAll().map((cookie) => ({
          name: cookie.name,
          value: cookie.value,
        })),
      setAll: (cookiesToSet) => {
        for (const cookie of cookiesToSet) {
          response.cookies.set(cookie.name, cookie.value, cookie.options || {})
        }
      },
    },
  })
}

export function copyResponseCookies(
  source: NextResponse,
  target: NextResponse
) {
  for (const cookie of source.cookies.getAll()) {
    target.cookies.set(cookie)
  }

  return target
}

export function normalizeNextPath(next: string | null | undefined) {
  return next && next.startsWith('/') ? next : '/admin'
}

export function getAuthCallbackUrl(request: Request, next?: string | null) {
  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin || getPublicEnv().siteUrl
  const callbackUrl = new URL('/auth/callback', origin)
  const safeNext = normalizeNextPath(next)

  callbackUrl.searchParams.set('next', safeNext)
  return callbackUrl.toString()
}
