import { NextResponse } from 'next/server'
import { z } from 'zod'
import { sendNotificationEvent } from '@/lib/email'
import { guardApiRoute } from '@/lib/security/api-protection'
import { RequestGuardError } from '@/lib/security/request-guards'

const notifySchema = z.object({
  amountMinor: z.number().int().optional(),
  currency: z.string().trim().min(3).max(8).optional(),
  eventType: z.enum([
    'owner_signup',
    'subscription_activated',
    'subscription_updated',
    'subscription_canceled',
    'invoice_paid',
    'invoice_failed',
  ]),
  invoiceUrl: z.string().url().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  occurredAt: z.string().optional(),
  ownerEmail: z.string().email().optional(),
  ownerName: z.string().trim().min(1).max(160).optional(),
  planName: z.string().trim().min(1).max(160).optional(),
  restaurantId: z.string().trim().min(1).max(120).optional(),
  restaurantName: z.string().trim().min(1).max(160).optional(),
  subscriptionStatus: z.string().trim().min(1).max(80).optional(),
})

export async function POST(request: Request) {
  try {
    const protection = guardApiRoute(request, {
      bucket: 'notify',
      limit: 20,
      maxBodyBytes: 16 * 1024,
      rateLimitSource: 'api.notify',
      windowMs: 5 * 60 * 1000,
    })
    const body = notifySchema.parse(await request.json())
    const result = await sendNotificationEvent(body)

    return NextResponse.json(result, {
      headers: protection.headers,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to send notification.',
      },
      {
        status: error instanceof RequestGuardError ? error.status : 400,
      }
    )
  }
}
