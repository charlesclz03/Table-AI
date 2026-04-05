import { NextResponse } from 'next/server'
import { z } from 'zod'
import { writeAuditLogAsync } from '@/lib/audit/server'
import {
  copyResponseCookies,
  getAuthCallbackUrl,
  getSupabaseAuthRouteClient,
} from '@/lib/admin/auth-session'
import { guardApiRoute } from '@/lib/security/api-protection'
import { RequestGuardError } from '@/lib/security/request-guards'

const signupSchema = z
  .object({
    email: z.string().email().optional(),
    name: z.string().trim().min(1).max(120).optional(),
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
      bucket: 'auth-signup',
      limit: 5,
      maxBodyBytes: 8 * 1024,
      rateLimitSource: 'api.auth.signup',
      windowMs: 15 * 60 * 1000,
    })
    const body = signupSchema.parse(await request.json())
    const cookieResponse = NextResponse.next()
    const client = await getSupabaseAuthRouteClient(cookieResponse)

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

    const { data, error } = await client.auth.signUp({
      email: body.email || '',
      password: body.password || '',
      options: {
        data: body.name
          ? {
              full_name: body.name,
            }
          : undefined,
        emailRedirectTo: getAuthCallbackUrl(request, body.next),
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    writeAuditLogAsync({
      action: 'auth.signup_created',
      actorId: data.user?.id || null,
      metadata: {
        needsEmailConfirmation: !data.session,
        provider: body.provider || 'password',
      },
      request,
      source: 'api.auth.signup',
      status: 'success',
    })

    return copyResponseCookies(
      cookieResponse,
      NextResponse.json(
        {
          success: true,
          needsEmailConfirmation: !data.session,
        },
        {
          headers: protection.headers,
        }
      )
    )
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to create the owner account.',
      },
      {
        status: error instanceof RequestGuardError ? error.status : 400,
      }
    )
  }
}
