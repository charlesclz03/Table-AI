import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  getAdminRestaurantForRequest,
  updateRestaurantQuiz,
} from '@/lib/admin/server'

const quizSchema = z.object({
  signature_dish: z.string(),
  recommendation: z.string(),
  wine_pairing: z.string(),
  secret_dish: z.string(),
  allergen_notes: z.string(),
  story: z.string(),
  faq_1: z.string(),
  faq_2: z.string(),
  faq_3: z.string(),
  faq_4: z.string(),
  faq_5: z.string(),
})

export async function PUT(request: Request) {
  try {
    const restaurant = await getAdminRestaurantForRequest()
    const body = await request.json()
    const quizAnswers = await updateRestaurantQuiz(
      restaurant.id,
      quizSchema.parse(body)
    )

    return NextResponse.json({ quizAnswers })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to save quiz answers.',
      },
      { status: 400 }
    )
  }
}
