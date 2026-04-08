import { NextResponse } from 'next/server'
import { z } from 'zod'
import { guardApiRoute } from '@/lib/security/api-protection'
import { RequestGuardError } from '@/lib/security/request-guards'
import { getServerEnv } from '@/lib/server-env'
import { getSupabaseServerClient } from '@/lib/supabase/server'

const waitlistSchema = z.object({
  name: z.string().trim().min(1).max(160),
  email: z.string().email(),
  restaurantName: z.string().trim().min(1).max(240),
  notes: z.string().trim().max(2000).optional(),
  source: z.string().trim().max(80).optional(),
})

async function forwardToZapier(data: Record<string, unknown>): Promise<void> {
  const { zapierWebhookUrl } = getServerEnv()

  if (!zapierWebhookUrl) {
    return
  }

  try {
    await fetch(zapierWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  } catch {
    // fire and forget — never fail the request
  }
}

export async function POST(request: Request) {
  try {
    const protection = guardApiRoute(request, {
      bucket: 'waitlist',
      limit: 5,
      maxBodyBytes: 8 * 1024,
      rateLimitSource: 'api.waitlist',
      windowMs: 60 * 60 * 1000,
    })

    const body = waitlistSchema.parse(await request.json())
    const client = getSupabaseServerClient({ serviceRole: true })

    if (!client) {
      throw new Error('Database is not configured.')
    }

    const { error } = await client.from('waitlist_leads').insert({
      name: body.name,
      email: body.email.trim().toLowerCase(),
      restaurant_name: body.restaurantName,
      notes: body.notes ?? null,
      source: body.source?.trim() || 'waitlist',
    })

    if (error) {
      throw new Error('Unable to save your request. Please try again.')
    }

    void forwardToZapier({
      event: 'waitlist_submitted',
      name: body.name,
      email: body.email,
      restaurant_name: body.restaurantName,
      notes: body.notes,
      source: body.source?.trim() || 'waitlist',
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json(
      { success: true, message: 'You are on the list!' },
      { headers: protection.headers }
    )
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof RequestGuardError
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Unable to save your request.',
      },
      {
        status: error instanceof RequestGuardError ? error.status : 400,
      }
    )
  }
}
