import { NextResponse } from 'next/server'
import { getAdminRestaurantForRequest } from '@/lib/admin/server'
import { ensureReferralCode } from '@/lib/referrals'
import { guardApiRoute } from '@/lib/security/api-protection'
import { RequestGuardError } from '@/lib/security/request-guards'

export async function POST(request: Request) {
  try {
    const protection = guardApiRoute(request, {
      bucket: 'referral-code',
      limit: 10,
      maxBodyBytes: 1024,
      rateLimitSource: 'api.referral.code',
      windowMs: 10 * 60 * 1000,
    })
    const restaurant = await getAdminRestaurantForRequest()
    const code = await ensureReferralCode({
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
    })

    return NextResponse.json(
      { code },
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
            : 'Unable to generate the referral code right now.',
      },
      {
        status: error instanceof RequestGuardError ? error.status : 400,
      }
    )
  }
}
