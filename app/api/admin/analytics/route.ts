import { NextResponse } from 'next/server'
import { getRestaurantAnalytics, parseAnalyticsRange } from '@/lib/analytics'
import { getAdminRestaurantForRequest } from '@/lib/admin/server'

export async function GET(request: Request) {
  try {
    const restaurant = await getAdminRestaurantForRequest()
    const url = new URL(request.url)
    const range = parseAnalyticsRange(url.searchParams.get('range'))
    const analytics = await getRestaurantAnalytics(restaurant, range)

    return NextResponse.json(analytics, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Unable to load analytics.',
      },
      { status: 400 }
    )
  }
}
