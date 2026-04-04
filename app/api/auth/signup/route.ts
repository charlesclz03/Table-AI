import { NextResponse } from 'next/server'
import { z } from 'zod'
import { ensureOwnerAccountForUser } from '@/lib/admin/owner-account'
import {
  copyResponseCookies,
  getAuthCallbackUrl,
  getSupabaseAuthRouteClient,
} from '@/lib/admin/auth-session'

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

    if (data.user?.email) {
      await ensureOwnerAccountForUser({
        userId: data.user.id,
        email: data.user.email,
        ownerName: body.name || null,
      })
    }

    return copyResponseCookies(
      cookieResponse,
      NextResponse.json({
        success: true,
        needsEmailConfirmation: !data.session,
      })
    )
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to create the owner account.',
      },
      { status: 400 }
    )
  }
}
