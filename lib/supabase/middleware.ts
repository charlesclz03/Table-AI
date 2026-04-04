import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { ensureServerOnly } from '@/lib/server-only'

ensureServerOnly('lib/supabase/middleware')

export async function updateSupabaseSession(request: NextRequest) {
  const response = NextResponse.next({
    request,
  })

  const client = getSupabaseServerClient({
    cookies: {
      getAll: () =>
        request.cookies.getAll().map((cookie) => ({
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

  if (!client) {
    return response
  }

  await client.auth.getSession()
  return response
}
