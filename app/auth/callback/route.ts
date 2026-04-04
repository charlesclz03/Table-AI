import { NextResponse } from 'next/server'
import { ensureOwnerAccountForUser } from '@/lib/admin/owner-account'
import {
  normalizeNextPath,
  getSupabaseAuthRouteClient,
} from '@/lib/admin/auth-session'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const nextPath = normalizeNextPath(requestUrl.searchParams.get('next'))
  const code = requestUrl.searchParams.get('code')
  const errorDescription = requestUrl.searchParams.get('error_description')

  function getLoginDestination(errorMessage: string) {
    const nextUrl = new URL(nextPath, requestUrl.origin)
    const destination = new URL(
      nextUrl.pathname === '/auth/checkout' ? '/auth/login' : '/admin/login',
      requestUrl.origin
    )

    if (nextUrl.pathname === '/auth/checkout') {
      const plan = nextUrl.searchParams.get('plan')

      if (plan) {
        destination.searchParams.set('plan', plan)
      }
    }

    destination.searchParams.set('error', errorMessage)
    return destination
  }

  if (errorDescription) {
    return NextResponse.redirect(getLoginDestination(errorDescription))
  }

  if (!code) {
    return NextResponse.redirect(getLoginDestination('Missing OAuth code.'))
  }

  const response = NextResponse.redirect(new URL(nextPath, requestUrl.origin))

  try {
    const client = await getSupabaseAuthRouteClient(response)

    if (!client) {
      throw new Error('Supabase is not configured.')
    }

    const { data, error } = await client.auth.exchangeCodeForSession(code)

    if (error) {
      throw new Error(error.message)
    }

    if (data.user?.email) {
      await ensureOwnerAccountForUser({
        userId: data.user.id,
        email: data.user.email,
        ownerName:
          typeof data.user.user_metadata?.full_name === 'string'
            ? data.user.user_metadata.full_name
            : typeof data.user.user_metadata?.name === 'string'
              ? data.user.user_metadata.name
              : null,
      })
    }

    return response
  } catch (error) {
    return NextResponse.redirect(
      getLoginDestination(
        error instanceof Error ? error.message : 'Unable to complete sign-in.'
      )
    )
  }
}
