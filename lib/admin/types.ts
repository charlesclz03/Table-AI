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
