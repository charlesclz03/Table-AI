import { NextResponse } from 'next/server'
import {
  constructStripeWebhookEvent,
  handleStripeWebhookEvent,
} from '@/lib/stripe/webhooks'
import {
  RequestGuardError,
  assertContentLength,
} from '@/lib/security/request-guards'

export async function POST(request: Request) {
  try {
    assertContentLength(
      request,
      256 * 1024,
      'Stripe webhook payload is too large.'
    )

    const payload = await request.text()
    const event = constructStripeWebhookEvent(
      payload,
      request.headers.get('stripe-signature')
    )

    if (!event) {
      return NextResponse.json(
        {
          received: false,
          message:
            'Stripe webhook handling is inactive until Stripe env vars are configured.',
        },
        { status: 202 }
      )
    }

    const result = await handleStripeWebhookEvent(event)

    return NextResponse.json({
      received: true,
      eventType: event.type,
      result,
    })
  } catch (error) {
    return NextResponse.json(
      {
        received: false,
        message:
          error instanceof Error ? error.message : 'Invalid Stripe webhook',
      },
      {
        status:
          error instanceof RequestGuardError
            ? error.status
            : error instanceof Error &&
                error.message.includes('stripe-signature')
              ? 400
              : 500,
      }
    )
  }
}
