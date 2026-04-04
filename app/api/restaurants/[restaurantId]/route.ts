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
    const client = getSupabaseServerClient({ serviceRole: true })

    if (!client) {
      throw new Error('Supabase is not configured.')
    }

    const { data, error } = await client
      .from('restaurants')
      .select('id, name, soul_md, rules_md, menu_json, subscription_status')
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
      { status: 400 }
    )
  }
}
