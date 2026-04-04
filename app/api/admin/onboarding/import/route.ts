import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminRestaurantForRequest } from '@/lib/admin/server'
import { importRestaurantFromGoogleMaps } from '@/lib/admin/google-maps-import'

const importRequestSchema = z.object({
  googleMapsUrl: z.string().url(),
})

export async function POST(request: Request) {
  try {
    await getAdminRestaurantForRequest()

    const body = importRequestSchema.parse(await request.json())
    const result = await importRestaurantFromGoogleMaps(body.googleMapsUrl)

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to import restaurant data from Google Maps.',
      },
      { status: 400 }
    )
  }
}
