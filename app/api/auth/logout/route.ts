import { NextResponse } from 'next/server'
import { getSupabaseAuthRouteClient } from '@/lib/admin/auth-session'

export async function POST() {
  try {
    const response = NextResponse.json({ success: true })
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
      { status: 400 }
    )
  }
}
