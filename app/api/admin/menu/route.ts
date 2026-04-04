import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  getAdminRestaurantForRequest,
  updateRestaurantMenu,
} from '@/lib/admin/server'

const menuItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.number().min(0),
  category: z.string().min(1),
  description: z.string(),
  allergens: z.array(z.string()),
  is_vegetarian: z.boolean(),
  is_vegan: z.boolean(),
  sort_order: z.number().int().min(0).optional(),
})

export async function PUT(request: Request) {
  try {
    const restaurant = await getAdminRestaurantForRequest()
    const body = (await request.json()) as { items?: unknown }
    const parsedItems = z.array(menuItemSchema).parse(body.items || [])
    const items = await updateRestaurantMenu(
      restaurant.id,
      parsedItems.map((item, index) => ({
        ...item,
        sort_order: item.sort_order ?? index,
      }))
    )

    return NextResponse.json({ items })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Unable to save the menu.',
      },
      { status: 400 }
    )
  }
}
