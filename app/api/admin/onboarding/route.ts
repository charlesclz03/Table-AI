import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  getAdminRestaurantForRequest,
  updateRestaurantConciergeTraining,
} from '@/lib/admin/server'
import { buildConciergeMarkdownFiles } from '@/lib/concierge/templates'

const faqEntrySchema = z.object({
  question: z.string(),
  answer: z.string(),
})

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

const saveOnboardingSchema = z.object({
  restaurantName: z.string().min(1),
  address: z.string(),
  phone: z.string(),
  email: z.string(),
  websiteUrl: z.string(),
  openingHours: z.array(z.string()).default([]),
  googleMapsUrl: z.string(),
  googlePlaceId: z.string(),
  personalityDescription: z.string().min(1),
  greetingMessage: z.string().min(1),
  languagesSupported: z.array(z.string()).default([]),
  signatureDishes: z.array(z.string()).default([]),
  winePairings: z.array(z.string()).default([]),
  faqEntries: z.array(faqEntrySchema).default([]),
  recommendationNotes: z.array(z.string()).default([]),
  menuKnowledge: z.array(z.string()).default([]),
  reviewHighlights: z.array(z.string()).default([]),
  photoUrls: z.array(z.string()).default([]),
  voiceSelection: z.string().default('onyx'),
  themeSelection: z.string().default('red'),
  menuImportNotes: z.array(z.string()).default([]),
  menuItems: z.array(menuItemSchema).default([]),
})

export async function PUT(request: Request) {
  try {
    const restaurant = await getAdminRestaurantForRequest()
    const body = saveOnboardingSchema.parse(await request.json())
    const markdown = buildConciergeMarkdownFiles(body)

    await updateRestaurantConciergeTraining(restaurant.id, {
      name: body.restaurantName,
      contactEmail: body.email || restaurant.email,
      soulMd: markdown.soulMd,
      rulesMd: markdown.rulesMd,
      menuItems: body.menuItems.map((item, index) => ({
        ...item,
        sort_order: item.sort_order ?? index,
      })),
      conciergeTraining: {
        google_maps_url: body.googleMapsUrl,
        google_place_id: body.googlePlaceId,
        address: body.address,
        phone: body.phone,
        contact_email: body.email,
        website_url: body.websiteUrl,
        opening_hours: body.openingHours,
        personality_description: body.personalityDescription,
        greeting_message: body.greetingMessage,
        languages_supported: body.languagesSupported,
        signature_dishes: body.signatureDishes,
        wine_pairings: body.winePairings,
        faq_entries: body.faqEntries,
        recommendation_notes: body.recommendationNotes,
        menu_knowledge: body.menuKnowledge,
        review_highlights: body.reviewHighlights,
        photo_urls: body.photoUrls,
        voice_selection: body.voiceSelection,
        theme_selection: body.themeSelection,
        menu_import_notes: body.menuImportNotes,
      },
    })

    return NextResponse.json({
      soulMd: markdown.soulMd,
      rulesMd: markdown.rulesMd,
      saved: true,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to save concierge onboarding.',
      },
      { status: 400 }
    )
  }
}
