import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

interface RestaurantRouteProps {
  params: Promise<{
    restaurantId: string
  }>
}

export async function GET(_: Request, { params }: RestaurantRouteProps) {
  try {
    const { restaurantId } = await params
    const client = getSupabaseServerClient()

    if (!client) {
      throw new Error('Supabase is not configured.')
    }

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        restaurantId
      )
    ) {
      return NextResponse.json(
        { error: 'Restaurant not found.' },
        { status: 404 }
      )
    }

    const { data, error } = await client
      .from('restaurant_public_profiles')
      .select('id, name, menu_json, subscription_status')
      .eq('id', restaurantId)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Restaurant not found.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ restaurant: data })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to load the restaurant.',
      },
      { status: 500 }
    )
  }
}
