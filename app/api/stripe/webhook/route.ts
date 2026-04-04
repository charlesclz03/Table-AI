import { NextResponse } from 'next/server'
import {
  constructStripeWebhookEvent,
  handleStripeWebhookEvent,
} from '@/lib/stripe/webhooks'

export async function POST(request: Request) {
  const payload = await request.text()

  try {
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
      { status: 400 }
    )
  }
}
