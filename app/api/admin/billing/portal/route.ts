import { NextResponse } from 'next/server'
import {
  createBillingPortalSession,
  getAdminRestaurantForRequest,
} from '@/lib/admin/server'
import { guardApiRoute } from '@/lib/security/api-protection'
import { RequestGuardError } from '@/lib/security/request-guards'

export async function POST(request: Request) {
  try {
    const protection = guardApiRoute(request, {
      bucket: 'billing-portal',
      limit: 10,
      maxBodyBytes: 1024,
      rateLimitSource: 'api.admin.billing.portal',
      windowMs: 10 * 60 * 1000,
    })
    const restaurant = await getAdminRestaurantForRequest()
    const url = await createBillingPortalSession(restaurant)
    return NextResponse.json(
      { url },
      {
        headers: protection.headers,
      }
    )
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to create the Stripe billing portal session.',
      },
      {
        status: error instanceof RequestGuardError ? error.status : 400,
      }
    )
  }
}
