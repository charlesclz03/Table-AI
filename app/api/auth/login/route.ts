import { NextResponse } from 'next/server'
import { z } from 'zod'
import { ensureOwnerAccountForUser } from '@/lib/admin/owner-account'
import {
  getAuthCallbackUrl,
  getSupabaseAuthRouteClient,
} from '@/lib/admin/auth-session'
import { guardApiRoute } from '@/lib/security/api-protection'
import { RequestGuardError } from '@/lib/security/request-guards'

const loginSchema = z
  .object({
    email: z.string().email().optional(),
    next: z.string().optional(),
    password: z.string().min(8).optional(),
    provider: z.enum(['google']).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.provider === 'google') {
      return
    }

    if (!value.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Email is required.',
        path: ['email'],
      })
    }

    if (!value.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password is required.',
        path: ['password'],
      })
    }
  })

export async function POST(request: Request) {
  try {
    const protection = guardApiRoute(request, {
      bucket: 'auth-login',
      limit: 10,
      maxBodyBytes: 8 * 1024,
      rateLimitSource: 'api.auth.login',
      windowMs: 15 * 60 * 1000,
    })
    const body = loginSchema.parse(await request.json())
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

    if (body.provider === 'google') {
      const { data, error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getAuthCallbackUrl(request, body.next),
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      return NextResponse.json({ url: data.url })
    }

    const { data, error } = await client.auth.signInWithPassword({
      email: body.email || '',
      password: body.password || '',
    })

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
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to log in right now.',
      },
      {
        status: error instanceof RequestGuardError ? error.status : 400,
      }
    )
  }
}
