import { NextResponse } from 'next/server'
import {
  createBillingPortalSession,
  getAdminRestaurantForRequest,
} from '@/lib/admin/server'

export async function POST() {
  try {
    const restaurant = await getAdminRestaurantForRequest()
    const url = await createBillingPortalSession(restaurant)
    return NextResponse.json({ url })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to create the Stripe billing portal session.',
      },
      { status: 400 }
    )
  }
}
