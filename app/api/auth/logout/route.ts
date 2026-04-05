import { NextResponse } from 'next/server'
import { getSupabaseAuthRouteClient } from '@/lib/admin/auth-session'
import { guardApiRoute } from '@/lib/security/api-protection'
import { RequestGuardError } from '@/lib/security/request-guards'

export async function POST(request: Request) {
  try {
    const protection = guardApiRoute(request, {
      bucket: 'auth-logout',
      limit: 20,
      maxBodyBytes: 1024,
      rateLimitSource: 'api.auth.logout',
      windowMs: 5 * 60 * 1000,
    })
    const response = NextResponse.json(
      { success: true },
      {
        headers: protection.headers,
      }
    )
    const client = await getSupabaseAuthRouteClient(response)

    if (!client) {
      throw new Error('Supabase is not configured.')
    }

    const { error } = await client.auth.signOut()

    if (error) {
      throw new Error(error.message)
    }

    return response
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to sign out right now.',
      },
      {
        status: error instanceof RequestGuardError ? error.status : 400,
      }
    )
  }
}
