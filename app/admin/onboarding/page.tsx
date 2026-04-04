import { ConciergeTrainingEditor } from '@/components/admin/ConciergeTrainingEditor'
import { AdminPageShell } from '@/components/admin/AdminPageShell'
import { EmptyRestaurantState } from '@/components/admin/EmptyRestaurantState'
import {
  normalizeMenuItems,
  normalizeQuizAnswers,
  requireAdminContext,
} from '@/lib/admin/server'
import { buildConciergeMarkdownFiles } from '@/lib/concierge/templates'

export default async function AdminOnboardingPage() {
  const { restaurant, userEmail } = await requireAdminContext()

  if (!restaurant) {
    return <EmptyRestaurantState email={userEmail} />
  }

  const menuItems = normalizeMenuItems(restaurant.menu_json)
  const quizAnswers = normalizeQuizAnswers(restaurant.quiz_answers)
  const conciergeTraining = quizAnswers.concierge_training
  const draftBase = {
    googleMapsUrl: conciergeTraining?.google_maps_url || '',
    googlePlaceId: conciergeTraining?.google_place_id || '',
    restaurantName: restaurant.name,
    address: conciergeTraining?.address || '',
    phone: conciergeTraining?.phone || '',
    email: conciergeTraining?.contact_email || restaurant.email,
    websiteUrl: conciergeTraining?.website_url || '',
    openingHours: conciergeTraining?.opening_hours || [],
    personalityDescription:
      conciergeTraining?.personality_description ||
      restaurant.soul_md ||
      'Warm, knowledgeable, and grounded in Portuguese hospitality.',
    greetingMessage:
      conciergeTraining?.greeting_message ||
      `Welcome to ${restaurant.name}. I'm your AI concierge. What can I help you with tonight?`,
    languagesSupported: conciergeTraining?.languages_supported || [
      'Portuguese',
      'English',
    ],
    signatureDishes:
      conciergeTraining?.signature_dishes ||
      (quizAnswers.signature_dish
        ? quizAnswers.signature_dish.split('|').map((entry) => entry.trim())
        : []),
    winePairings:
      conciergeTraining?.wine_pairings ||
      (quizAnswers.wine_pairing
        ? quizAnswers.wine_pairing.split('|').map((entry) => entry.trim())
        : []),
    faqEntries:
      conciergeTraining?.faq_entries ||
      [
        quizAnswers.faq_1,
        quizAnswers.faq_2,
        quizAnswers.faq_3,
        quizAnswers.faq_4,
        quizAnswers.faq_5,
      ]
        .filter(Boolean)
        .map((entry) => ({
          question: '',
          answer: entry,
        })),
    recommendationNotes:
      conciergeTraining?.recommendation_notes ||
      (quizAnswers.recommendation ? [quizAnswers.recommendation] : []),
    menuKnowledge:
      conciergeTraining?.menu_knowledge ||
      menuItems.slice(0, 8).map((item) => {
        const price = item.price ? ` (${item.price.toFixed(2)} EUR)` : ''
        const description = item.description ? `: ${item.description}` : ''
        return `${item.name}${price}${description}`
      }),
    reviewHighlights: conciergeTraining?.review_highlights || [],
    photoUrls: conciergeTraining?.photo_urls || [],
    voiceSelection: conciergeTraining?.voice_selection || 'onyx',
    themeSelection: conciergeTraining?.theme_selection || 'red',
    menuImportNotes: conciergeTraining?.menu_import_notes || [],
  }
  const markdown = buildConciergeMarkdownFiles(draftBase)

  return (
    <AdminPageShell
      eyebrow="Concierge Training"
      title="Build a live demo from Google Maps"
      description="Import restaurant data from Google Maps, tune every concierge field in one place, and generate the markdown files that power the AI demo."
    >
      <ConciergeTrainingEditor
        initialDraft={{
          ...draftBase,
          soulMd: restaurant.soul_md || markdown.soulMd,
          rulesMd: restaurant.rules_md || markdown.rulesMd,
        }}
        initialMenuItems={menuItems}
      />
    </AdminPageShell>
  )
}
