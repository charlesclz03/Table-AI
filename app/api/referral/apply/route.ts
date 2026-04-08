import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminRestaurantForRequest } from '@/lib/admin/server'
import { applyReferralCode } from '@/lib/referrals'
import { guardApiRoute } from '@/lib/security/api-protection'
import { RequestGuardError } from '@/lib/security/request-guards'

const applyReferralSchema = z.object({
  code: z.string().trim().min(3).max(80),
})

export async function POST(request: Request) {
  try {
    const protection = guardApiRoute(request, {
      bucket: 'referral-apply',
      limit: 8,
      maxBodyBytes: 4 * 1024,
      rateLimitSource: 'api.referral.apply',
      windowMs: 10 * 60 * 1000,
    })
    const body = applyReferralSchema.parse(await request.json())
    const restaurant = await getAdminRestaurantForRequest()
    const result = await applyReferralCode({
      code: body.code,
      referredRestaurant: restaurant,
      request,
    })

    return NextResponse.json(result, {
      headers: protection.headers,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to apply the referral code right now.',
      },
      {
        status: error instanceof RequestGuardError ? error.status : 400,
      }
    )
  }
}
