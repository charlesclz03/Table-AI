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

  if (errorDescription) {
    const destination = new URL('/admin/login', requestUrl.origin)
    destination.searchParams.set('error', errorDescription)
    return NextResponse.redirect(destination)
  }

  if (!code) {
    const destination = new URL('/admin/login', requestUrl.origin)
    destination.searchParams.set('error', 'Missing OAuth code.')
    return NextResponse.redirect(destination)
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
    const destination = new URL('/admin/login', requestUrl.origin)
    destination.searchParams.set(
      'error',
      error instanceof Error ? error.message : 'Unable to complete sign-in.'
    )
    return NextResponse.redirect(destination)
  }
}
