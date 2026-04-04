import OpenAI from 'openai'
import { z } from 'zod'
import { zodTextFormat } from 'openai/helpers/zod'
import {
  dedupeParsedMenuItems,
  draftMenuItemToAdminItem,
  normalizeParsedMenuItems,
  parsedMenuPayloadSchema,
  type ParsedMenuDraftItem,
} from '@/lib/admin/menu-import'
import {
  buildConciergeMarkdownFiles,
  normalizeConciergeTrainingDraft,
  type ConciergeFaqEntry,
  type ConciergeTrainingPreview,
} from '@/lib/concierge/templates'
import { DEFAULT_THEME_KEY, DEFAULT_TTS_VOICE } from '@/lib/themes'
import { getServerEnv } from '@/lib/server-env'
import { ensureServerOnly } from '@/lib/server-only'

ensureServerOnly('lib/admin/google-maps-import')

const GOOGLE_MAPS_HOST_PATTERN = /(google\.[a-z.]+|maps\.app\.goo\.gl)$/i
const GOOGLE_PLACES_TEXT_SEARCH_URL =
  'https://places.googleapis.com/v1/places:searchText'
const GOOGLE_PLACES_DETAILS_URL = 'https://places.googleapis.com/v1/places'
const GOOGLE_PLACES_API_ROOT = 'https://places.googleapis.com/v1'
const PLACE_FIELD_MASK = [
  'id',
  'displayName',
  'formattedAddress',
  'googleMapsUri',
  'nationalPhoneNumber',
  'regularOpeningHours',
  'websiteUri',
  'reviews',
  'photos',
  'rating',
  'userRatingCount',
].join(',')

const menuScanPrompt = [
  'You are analyzing Google Maps photos for a restaurant.',
  'Only extract menu or wine-list items that are visibly readable in the images.',
  'Ignore interior shots, people, plating photos, storefronts, and unreadable text.',
  'Return JSON with `items` and `notes`.',
  'Each item should include name, price, category, description, and allergens.',
  'If no menu text is visible, return an empty `items` array and explain that in `notes`.',
].join(' ')

const synthesisSchema = z.object({
  personalityDescription: z.string().trim().min(1),
  greetingMessage: z.string().trim().min(1),
  languagesSupported: z.array(z.string().trim()).default([]),
  signatureDishes: z.array(z.string().trim()).default([]),
  winePairings: z.array(z.string().trim()).default([]),
  recommendationNotes: z.array(z.string().trim()).default([]),
  menuKnowledge: z.array(z.string().trim()).default([]),
  reviewHighlights: z.array(z.string().trim()).default([]),
  faqEntries: z
    .array(
      z.object({
        question: z.string().trim(),
        answer: z.string().trim(),
      })
    )
    .default([]),
  voiceSelection: z.string().trim().default(DEFAULT_TTS_VOICE),
  themeSelection: z.string().trim().default(DEFAULT_THEME_KEY),
})

interface GooglePlaceTextValue {
  text?: string
}

interface GooglePlaceReview {
  text?: GooglePlaceTextValue
  originalText?: GooglePlaceTextValue
  rating?: number
}

interface GooglePlacePhoto {
  name?: string
  googleMapsUri?: string
}

interface GooglePlace {
  id?: string
  displayName?: GooglePlaceTextValue
  formattedAddress?: string
  googleMapsUri?: string
  nationalPhoneNumber?: string
  regularOpeningHours?: {
    weekdayDescriptions?: string[]
  }
  websiteUri?: string
  reviews?: GooglePlaceReview[]
  photos?: GooglePlacePhoto[]
  rating?: number
  userRatingCount?: number
}

interface GooglePlacesSearchResponse {
  places?: GooglePlace[]
}

interface GooglePlacesPhotoMediaResponse {
  photoUri?: string
}

interface ConciergeImportSynthesis {
  personalityDescription: string
  greetingMessage: string
  languagesSupported: string[]
  signatureDishes: string[]
  winePairings: string[]
  recommendationNotes: string[]
  menuKnowledge: string[]
  reviewHighlights: string[]
  faqEntries: ConciergeFaqEntry[]
  voiceSelection: string
  themeSelection: string
}

export interface GoogleMapsImportResult {
  draft: ConciergeTrainingPreview
  menuItems: ReturnType<typeof draftMenuItemToAdminItem>[]
  warnings: string[]
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function sanitizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function dedupe(values: string[]) {
  const seen = new Set<string>()
  const next: string[] = []

  for (const value of values.map(sanitizeText).filter(Boolean)) {
    const key = value.toLowerCase()

    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    next.push(value)
  }

  return next
}

function isGoogleMapsUrl(value: string) {
  try {
    const url = new URL(value)
    return GOOGLE_MAPS_HOST_PATTERN.test(url.hostname)
  } catch {
    return false
  }
}

async function resolveGoogleMapsUrl(input: string) {
  const url = new URL(input)

  if (url.hostname !== 'maps.app.goo.gl') {
    return url.toString()
  }

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(10000),
  })

  return response.url || url.toString()
}

function extractTextQueryFromGoogleMapsUrl(input: string) {
  const url = new URL(input)
  const fromQuery =
    url.searchParams.get('query') ||
    url.searchParams.get('q') ||
    url.searchParams.get('query_place_name')

  if (fromQuery) {
    return sanitizeText(fromQuery.replace(/\+/g, ' '))
  }

  const path = decodeURIComponent(url.pathname).replace(/\+/g, ' ')
  const placeSegment = path.match(/\/place\/([^/]+)/i)?.[1]

  if (placeSegment) {
    return sanitizeText(placeSegment)
  }

  const searchSegment = path.match(/\/search\/([^/]+)/i)?.[1]

  if (searchSegment) {
    return sanitizeText(searchSegment)
  }

  return ''
}

function extractPlaceIdFromGoogleMapsUrl(input: string) {
  const url = new URL(input)

  return (
    url.searchParams.get('query_place_id') || url.searchParams.get('ftid') || ''
  )
}

async function fetchPlaceDetailsById(placeId: string, apiKey: string) {
  const response = await fetch(
    `${GOOGLE_PLACES_DETAILS_URL}/${encodeURIComponent(placeId)}?languageCode=en`,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': PLACE_FIELD_MASK,
      },
      signal: AbortSignal.timeout(12000),
    }
  )

  if (!response.ok) {
    const body = await response.text()
    throw new Error(
      `Google Place Details failed (${response.status}): ${body || 'Unknown error'}`
    )
  }

  return (await response.json()) as GooglePlace
}

async function searchPlaceByText(query: string, apiKey: string) {
  const response = await fetch(GOOGLE_PLACES_TEXT_SEARCH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': `places.${PLACE_FIELD_MASK.replace(/,/g, ',places.')}`,
    },
    body: JSON.stringify({
      textQuery: query,
      languageCode: 'en',
      maxResultCount: 5,
    }),
    signal: AbortSignal.timeout(12000),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(
      `Google Places Text Search failed (${response.status}): ${body || 'Unknown error'}`
    )
  }

  const payload = (await response.json()) as GooglePlacesSearchResponse
  return payload.places || []
}

function scorePlaceMatch(place: GooglePlace, query: string) {
  const haystack = normalizeText(
    `${place.displayName?.text || ''} ${place.formattedAddress || ''}`
  )
  const normalizedQuery = normalizeText(query)

  if (!normalizedQuery) {
    return 0
  }

  let score = 0

  if (haystack.includes(normalizedQuery)) {
    score += 5
  }

  for (const token of normalizedQuery.split(/\s+/).filter(Boolean)) {
    if (haystack.includes(token)) {
      score += 1
    }
  }

  return score
}

async function resolveGooglePlaceFromMapsUrl(
  googleMapsUrl: string,
  apiKey: string
) {
  const resolvedUrl = await resolveGoogleMapsUrl(googleMapsUrl)
  const placeId = extractPlaceIdFromGoogleMapsUrl(resolvedUrl)

  if (placeId) {
    const place = await fetchPlaceDetailsById(placeId, apiKey)
    return {
      place,
      resolvedUrl,
      query: extractTextQueryFromGoogleMapsUrl(resolvedUrl),
    }
  }

  const query = extractTextQueryFromGoogleMapsUrl(resolvedUrl)

  if (!query) {
    throw new Error(
      'The Google Maps URL could not be resolved into a place search query.'
    )
  }

  const matches = await searchPlaceByText(query, apiKey)
  const place =
    [...matches].sort(
      (left, right) =>
        scorePlaceMatch(right, query) - scorePlaceMatch(left, query)
    )[0] || null

  if (!place) {
    throw new Error('No Google Place could be matched from that Maps URL.')
  }

  return {
    place,
    resolvedUrl,
    query,
  }
}

async function fetchWebsiteEmail(websiteUrl: string) {
  if (!websiteUrl) {
    return ''
  }

  try {
    const response = await fetch(websiteUrl, {
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': 'Mozilla/5.0',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      return ''
    }

    const html = (await response.text()).slice(0, 250000)
    const emailMatch = html.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)

    if (emailMatch?.[0]) {
      return emailMatch[0]
    }

    const mailtoMatch = html.match(/mailto:([^"'?#\s]+)/i)
    return mailtoMatch?.[1] || ''
  } catch {
    return ''
  }
}

async function fetchPhotoUrls(
  photos: GooglePlacePhoto[],
  apiKey: string,
  warnings: string[]
) {
  const photoUrls: string[] = []

  for (const photo of photos.slice(0, 8)) {
    if (!photo.name) {
      if (photo.googleMapsUri) {
        photoUrls.push(photo.googleMapsUri)
      }

      continue
    }

    try {
      const response = await fetch(
        `${GOOGLE_PLACES_API_ROOT}/${photo.name}/media?maxHeightPx=1200&skipHttpRedirect=true`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
          },
          signal: AbortSignal.timeout(12000),
        }
      )

      if (!response.ok) {
        warnings.push(
          `A Google Maps photo could not be expanded (${response.status}).`
        )
        continue
      }

      const payload = (await response.json()) as GooglePlacesPhotoMediaResponse

      if (payload.photoUri) {
        photoUrls.push(payload.photoUri)
        continue
      }

      if (photo.googleMapsUri) {
        photoUrls.push(photo.googleMapsUri)
      }
    } catch {
      if (photo.googleMapsUri) {
        photoUrls.push(photo.googleMapsUri)
      }
    }
  }

  return dedupe(photoUrls)
}

function collectReviewTexts(place: GooglePlace) {
  return dedupe(
    (place.reviews || [])
      .map((review) =>
        sanitizeText(review.originalText?.text || review.text?.text || '')
      )
      .filter(Boolean)
  )
}

function buildFallbackFaqEntries(place: GooglePlace, email: string) {
  const entries: ConciergeFaqEntry[] = []

  if (place.formattedAddress) {
    entries.push({
      question: 'Where are you located?',
      answer: `We are at ${place.formattedAddress}.`,
    })
  }

  if (place.nationalPhoneNumber) {
    entries.push({
      question: 'How can I contact the restaurant?',
      answer: `You can call us on ${place.nationalPhoneNumber}.`,
    })
  }

  if (email) {
    entries.push({
      question: 'Is there an email contact?',
      answer: `You can write to ${email}.`,
    })
  }

  if (place.regularOpeningHours?.weekdayDescriptions?.length) {
    entries.push({
      question: 'What are your opening hours?',
      answer: place.regularOpeningHours.weekdayDescriptions.join(' | '),
    })
  }

  entries.push({
    question: 'Can you confirm allergens or special requests?',
    answer:
      'For allergies or special dietary needs, let me check with the staff.',
  })

  return entries.slice(0, 5)
}

function buildFallbackSynthesis(
  place: GooglePlace,
  email: string,
  menuItems: ParsedMenuDraftItem[],
  reviewTexts: string[]
): ConciergeImportSynthesis {
  const signatureDishes = menuItems.slice(0, 3).map((item) => item.name)
  const winePairings = menuItems
    .filter((item) => item.category === 'wine')
    .slice(0, 3)
    .map((item) => item.name)
  const menuKnowledge = menuItems.slice(0, 8).map((item) => {
    const description = item.description ? `: ${item.description}` : ''
    const price = item.price === null ? '' : ` (${item.price.toFixed(2)} EUR)`

    return `${item.name}${price}${description}`
  })
  const reviewHighlights =
    reviewTexts.slice(0, 4).map((review) => review.slice(0, 180)) || []
  const recommendationNotes =
    signatureDishes.length > 0
      ? signatureDishes.map(
          (dish) => `Recommend ${dish} for first-time guests.`
        )
      : [
          'Start with the best-reviewed dish or ask the staff for the current favorite.',
        ]

  return {
    personalityDescription:
      'Warm, knowledgeable, and grounded in Portuguese hospitality. Keep answers concise, helpful, and confident.',
    greetingMessage: `Welcome to ${place.displayName?.text || 'our restaurant'}. I'm your AI concierge. What can I help you with tonight?`,
    languagesSupported: ['Portuguese', 'English'],
    signatureDishes,
    winePairings,
    recommendationNotes,
    menuKnowledge,
    reviewHighlights,
    faqEntries: buildFallbackFaqEntries(place, email),
    voiceSelection: DEFAULT_TTS_VOICE,
    themeSelection: DEFAULT_THEME_KEY,
  }
}

async function scanMenuFromPhotoUrls(
  client: OpenAI,
  photoUrls: string[],
  warnings: string[]
) {
  if (photoUrls.length === 0) {
    return {
      items: [] as ParsedMenuDraftItem[],
      notes: [] as string[],
    }
  }

  try {
    const response = await client.responses.parse(
      {
        model: 'gpt-4o',
        instructions: menuScanPrompt,
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: 'Scan these Google Maps photos and extract readable menu or wine-list items only.',
              },
              ...photoUrls.slice(0, 4).map((photoUrl) => ({
                type: 'input_image' as const,
                image_url: photoUrl,
                detail: 'high' as const,
              })),
            ],
          },
        ],
        text: {
          format: zodTextFormat(
            parsedMenuPayloadSchema,
            'google_maps_menu_scan'
          ),
        },
      },
      {
        signal: AbortSignal.timeout(45000),
      }
    )

    const parsed = response.output_parsed
    const items = dedupeParsedMenuItems(
      normalizeParsedMenuItems(parsed?.items || [])
    )

    return {
      items,
      notes: parsed?.notes || [],
    }
  } catch (error) {
    warnings.push(
      error instanceof Error
        ? `Menu scan fallback: ${error.message}`
        : 'Menu scan fallback: unable to read Google Maps photos.'
    )

    return {
      items: [] as ParsedMenuDraftItem[],
      notes: [] as string[],
    }
  }
}

async function synthesizeConciergeTraining(
  client: OpenAI,
  place: GooglePlace,
  reviewTexts: string[],
  menuItems: ParsedMenuDraftItem[],
  email: string,
  warnings: string[]
) {
  const fallback = buildFallbackSynthesis(place, email, menuItems, reviewTexts)

  try {
    const response = await client.responses.parse(
      {
        model: 'gpt-4o-mini',
        instructions: [
          'You are generating a fast restaurant concierge training draft.',
          'Stay grounded in the provided place data, reviews, and menu items.',
          'Do not invent facts that are not supported by the source material.',
          'Choose voiceSelection from: onyx, cedar, shimmer, coral, verse, sage, alloy, ash, ballad, echo, marin.',
          'Choose themeSelection from: red, white, rose, champagne, green.',
          'Return concise, owner-editable content.',
        ].join(' '),
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: JSON.stringify(
                  {
                    restaurantName: place.displayName?.text || '',
                    address: place.formattedAddress || '',
                    phone: place.nationalPhoneNumber || '',
                    email,
                    hours: place.regularOpeningHours?.weekdayDescriptions || [],
                    rating: place.rating || null,
                    reviewCount: place.userRatingCount || null,
                    reviews: reviewTexts.slice(0, 6),
                    menuItems: menuItems.slice(0, 12),
                  },
                  null,
                  2
                ),
              },
            ],
          },
        ],
        text: {
          format: zodTextFormat(
            synthesisSchema,
            'concierge_training_synthesis'
          ),
        },
      },
      {
        signal: AbortSignal.timeout(30000),
      }
    )

    const parsed = response.output_parsed

    if (!parsed) {
      return fallback
    }

    return {
      personalityDescription: sanitizeText(parsed.personalityDescription),
      greetingMessage: sanitizeText(parsed.greetingMessage),
      languagesSupported: dedupe(parsed.languagesSupported),
      signatureDishes: dedupe(parsed.signatureDishes),
      winePairings: dedupe(parsed.winePairings),
      recommendationNotes: dedupe(parsed.recommendationNotes),
      menuKnowledge: dedupe(parsed.menuKnowledge),
      reviewHighlights: dedupe(parsed.reviewHighlights),
      faqEntries: (parsed.faqEntries || [])
        .map((entry) => ({
          question: sanitizeText(entry.question),
          answer: sanitizeText(entry.answer),
        }))
        .filter((entry) => entry.question || entry.answer),
      voiceSelection: sanitizeText(parsed.voiceSelection || DEFAULT_TTS_VOICE),
      themeSelection: sanitizeText(parsed.themeSelection || DEFAULT_THEME_KEY),
    }
  } catch (error) {
    warnings.push(
      error instanceof Error
        ? `Training synthesis fallback: ${error.message}`
        : 'Training synthesis fallback: unable to summarize restaurant data.'
    )

    return fallback
  }
}

export async function importRestaurantFromGoogleMaps(
  googleMapsUrl: string
): Promise<GoogleMapsImportResult> {
  const trimmedUrl = googleMapsUrl.trim()

  if (!isGoogleMapsUrl(trimmedUrl)) {
    throw new Error('Paste a valid Google Maps place URL to continue.')
  }

  const warnings: string[] = []
  const { googlePlacesApiKey, openAiApiKey } = getServerEnv()

  if (!googlePlacesApiKey) {
    throw new Error(
      'Google Places is not configured. Add GOOGLE_PLACES_API_KEY to import restaurant data from Maps.'
    )
  }

  const { place, resolvedUrl } = await resolveGooglePlaceFromMapsUrl(
    trimmedUrl,
    googlePlacesApiKey
  )
  const email = await fetchWebsiteEmail(place.websiteUri || '')
  const reviewTexts = collectReviewTexts(place)
  const photoUrls = await fetchPhotoUrls(
    place.photos || [],
    googlePlacesApiKey,
    warnings
  )

  let menuItems: ParsedMenuDraftItem[] = []
  let menuImportNotes: string[] = []
  let synthesis = buildFallbackSynthesis(place, email, menuItems, reviewTexts)

  if (openAiApiKey) {
    const client = new OpenAI({
      apiKey: openAiApiKey,
    })
    const menuScan = await scanMenuFromPhotoUrls(client, photoUrls, warnings)
    menuItems = menuScan.items
    menuImportNotes = dedupe(menuScan.notes)
    synthesis = await synthesizeConciergeTraining(
      client,
      place,
      reviewTexts,
      menuItems,
      email,
      warnings
    )
  } else {
    warnings.push(
      'OpenAI is not configured, so menu photo scanning and concierge synthesis used local fallbacks.'
    )
  }

  const draft = normalizeConciergeTrainingDraft({
    googleMapsUrl: resolvedUrl,
    googlePlaceId: place.id || '',
    restaurantName: place.displayName?.text || 'Your Restaurant',
    address: place.formattedAddress || '',
    phone: place.nationalPhoneNumber || '',
    email,
    websiteUrl: place.websiteUri || '',
    openingHours: place.regularOpeningHours?.weekdayDescriptions || [],
    personalityDescription: synthesis.personalityDescription,
    greetingMessage: synthesis.greetingMessage,
    languagesSupported: synthesis.languagesSupported,
    signatureDishes: synthesis.signatureDishes,
    winePairings: synthesis.winePairings,
    faqEntries: synthesis.faqEntries,
    recommendationNotes: synthesis.recommendationNotes,
    menuKnowledge: synthesis.menuKnowledge,
    reviewHighlights:
      synthesis.reviewHighlights.length > 0
        ? synthesis.reviewHighlights
        : reviewTexts.slice(0, 5),
    photoUrls,
    voiceSelection: synthesis.voiceSelection,
    themeSelection: synthesis.themeSelection,
    menuImportNotes,
  })

  const markdownFiles = buildConciergeMarkdownFiles(draft)

  return {
    draft: {
      ...draft,
      soulMd: markdownFiles.soulMd,
      rulesMd: markdownFiles.rulesMd,
    },
    menuItems: menuItems.map((item, index) =>
      draftMenuItemToAdminItem(item, index)
    ),
    warnings: dedupe(warnings),
  }
}
