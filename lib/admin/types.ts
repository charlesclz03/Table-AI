export const MENU_CATEGORIES = [
  'starters',
  'mains',
  'desserts',
  'drinks',
  'wine',
] as const

export type MenuCategory = (typeof MENU_CATEGORIES)[number]

export interface AdminMenuItem {
  id: string
  name: string
  price: number
  category: string
  description: string
  allergens: string[]
  is_vegetarian: boolean
  is_vegan: boolean
  sort_order: number
}

export interface AdminQuizAnswers {
  signature_dish: string
  recommendation: string
  wine_pairing: string
  secret_dish: string
  allergen_notes: string
  story: string
  faq_1: string
  faq_2: string
  faq_3: string
  faq_4: string
  faq_5: string
  concierge_training?: AdminConciergeTrainingData
  completed_at?: string
}

export interface AdminConciergeFaqEntry {
  question: string
  answer: string
}

export interface AdminConciergeTrainingData {
  google_maps_url?: string
  google_place_id?: string
  address?: string
  phone?: string
  contact_email?: string
  website_url?: string
  opening_hours?: string[]
  personality_description?: string
  greeting_message?: string
  languages_supported?: string[]
  signature_dishes?: string[]
  wine_pairings?: string[]
  faq_entries?: AdminConciergeFaqEntry[]
  recommendation_notes?: string[]
  menu_knowledge?: string[]
  review_highlights?: string[]
  photo_urls?: string[]
  voice_selection?: string
  theme_selection?: string
  menu_import_notes?: string[]
  imported_at?: string
}

export interface AdminRestaurantRecord {
  id: string
  email: string
  name: string
  owner_id?: string | null
  logo_url?: string | null
  soul_md?: string | null
  rules_md?: string | null
  menu_json?: { items?: AdminMenuItem[] } | AdminMenuItem[] | null
  quiz_answers?: Partial<AdminQuizAnswers> | null
  stripe_customer_id?: string | null
  stripe_subscription_id?: string | null
  subscription_status?: string | null
  plan_name?: string | null
  setup_paid_at?: string | null
  billing_starts_at?: string | null
  qr_code_url?: string | null
  created_at?: string | null
}

export interface AdminOwnerRecord {
  id: string
  email: string
  name?: string | null
  created_at?: string | null
}

export interface ConversationMessage {
  role?: string
  content?: string
}

export interface ConversationRecord {
  id: string
  table_number?: string | null
  messages?: ConversationMessage[] | null
  created_at?: string | null
}

export interface ConversationPreview {
  id: string
  tableNumber: string
  createdAt: string | null
  lastQuestion: string
  lastReply: string
}

export interface DashboardStats {
  conversationsThisWeek: number
  mostAskedQuestions: string[]
  recentConversations: ConversationPreview[]
}

export type AdminAnalyticsRange = '7' | '30' | 'all'

export interface AdminAnalyticsRecord {
  id: string
  restaurant_id: string
  conversation_id?: string | null
  question_text?: string | null
  response_preview?: string | null
  language?: string | null
  created_at?: string | null
}

export interface AdminQuestionStat {
  text: string
  count: number
  conversationShare: number
}

export interface AdminUsagePoint {
  date: string
  label: string
  count: number
}

export interface AdminLanguageStat {
  language: string
  label: string
  count: number
  share: number
}

export interface AdminDishStat {
  name: string
  count: number
}

export interface AdminMonthlyVolumePoint {
  month: string
  label: string
  count: number
}

export interface AdminRevenuePoint {
  month: string
  label: string
  amount: number
  currency: string
}

export interface AdminPeakHourSlot {
  hour: number
  label: string
  count: number
  share: number
}

export interface AdminPeakUsage {
  hourLabel: string
  hour: number | null
  dayLabel: string
  day: string | null
}

export interface AdminEngagementMetrics {
  followUpRate: number
  recommendationRate: number
  avgGuestMessages: number
}

export interface AdminAnalyticsPayload {
  range: AdminAnalyticsRange
  totals: {
    selected: number
    previousPeriod: number
    last7Days: number
    last30Days: number
  }
  avgMessagesPerConversation: number
  peakUsage: AdminPeakUsage
  peakHourSlots: AdminPeakHourSlot[]
  languageDistribution: AdminLanguageStat[]
  topQuestions: AdminQuestionStat[]
  usageByDay: AdminUsagePoint[]
  topDishes: AdminDishStat[]
  monthlyChatVolume: AdminMonthlyVolumePoint[]
  monthlyRevenue: AdminRevenuePoint[]
  engagement: AdminEngagementMetrics
  generatedAt: string
}

export interface BillingInvoiceSummary {
  id: string
  created: number
  amountPaid: number
  currency: string
  status: string
  paymentIntentId?: string | null
  hostedInvoiceUrl?: string | null
  invoicePdf?: string | null
}

export interface BillingOverview {
  planName: string
  subscriptionStatus: string
  setupDate?: string | null
  nextBillingDate?: string | null
  paymentMethodLast4?: string | null
  invoices: BillingInvoiceSummary[]
  hasPortalAccess: boolean
}

export interface AdminReferralCode {
  id: string
  restaurant_id: string
  code: string
  created_at?: string | null
}

export interface AdminReferralRecord {
  id: string
  referral_code_id?: string | null
  referrer_restaurant_id: string
  referred_restaurant_id: string
  code: string
  status: 'pending' | 'completed' | 'rewarded'
  reward_months: number
  referred_bonus_months: number
  applied_at?: string | null
  completed_at?: string | null
  rewarded_at?: string | null
  created_at?: string | null
  referred_restaurant_name?: string
}

export const EMPTY_QUIZ_ANSWERS: AdminQuizAnswers = {
  signature_dish: '',
  recommendation: '',
  wine_pairing: '',
  secret_dish: '',
  allergen_notes: '',
  story: '',
  faq_1: '',
  faq_2: '',
  faq_3: '',
  faq_4: '',
  faq_5: '',
}
