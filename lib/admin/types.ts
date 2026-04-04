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
  completed_at?: string
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
  languageDistribution: AdminLanguageStat[]
  topQuestions: AdminQuestionStat[]
  usageByDay: AdminUsagePoint[]
  popularDishes: AdminDishStat[]
  engagement: AdminEngagementMetrics
  generatedAt: string
}

export interface BillingInvoiceSummary {
  id: string
  created: number
  amountPaid: number
  currency: string
  status: string
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
