import { getPublicEnv, getValidatedEnv, type PublicEnv } from '@/lib/env'
import { ensureServerOnly } from '@/lib/server-only'

ensureServerOnly('lib/server-env')

export type NodeEnv = 'development' | 'test' | 'production'
export type EnvGroupState = 'configured' | 'partial' | 'missing'

export interface ServerEnv {
  nodeEnv: NodeEnv
  nextAuthUrl?: string
  nextAuthSecret?: string
  googleClientId?: string
  googleClientSecret?: string
  databaseUrl?: string
  directUrl?: string
  stripeSecretKey?: string
  stripeWebhookSecret?: string
  stripePriceIdMonthly?: string
  stripePriceIdYearly?: string
  openAiApiKey?: string
  supabaseServiceRoleKey?: string
  insForgeBaseUrl?: string
  insForgeApiKey?: string
  insForgeTimeoutMs: number
  superadminEmails: string[]
  public: PublicEnv
}

export interface EnvGroupStatus {
  state: EnvGroupState
  isConfigured: boolean
  isPartial: boolean
  missingKeys: string[]
  presentKeys: string[]
}

function normalizeEmails(value: string | undefined) {
  if (!value) {
    return []
  }

  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

export function getServerEnv(): ServerEnv {
  const env = getValidatedEnv()
  const nodeEnv = (env.NODE_ENV || 'development') as NodeEnv

  return {
    nodeEnv,
    nextAuthUrl: env.NEXTAUTH_URL,
    nextAuthSecret: env.NEXTAUTH_SECRET,
    googleClientId: env.GOOGLE_CLIENT_ID,
    googleClientSecret: env.GOOGLE_CLIENT_SECRET,
    databaseUrl: env.DATABASE_URL,
    directUrl: env.DIRECT_URL,
    stripeSecretKey: env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
    stripePriceIdMonthly: env.STRIPE_PRICE_ID_MONTHLY,
    stripePriceIdYearly: env.STRIPE_PRICE_ID_YEARLY,
    openAiApiKey: env.OPENAI_API_KEY,
    supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    insForgeBaseUrl: env.INSFORGE_BASE_URL,
    insForgeApiKey: env.INSFORGE_API_KEY,
    insForgeTimeoutMs: env.INSFORGE_TIMEOUT_MS || 5000,
    superadminEmails: normalizeEmails(env.SUPERADMIN_EMAILS),
    public: getPublicEnv(),
  }
}

export function getEnvGroupStatus(
  values: Record<string, string | undefined | null>
): EnvGroupStatus {
  const entries = Object.entries(values)
  const presentKeys = entries
    .filter(([, value]) => Boolean(value))
    .map(([key]) => key)
  const missingKeys = entries.filter(([, value]) => !value).map(([key]) => key)

  const isConfigured = missingKeys.length === 0
  const isPartial = presentKeys.length > 0 && !isConfigured

  return {
    state: isConfigured ? 'configured' : isPartial ? 'partial' : 'missing',
    isConfigured,
    isPartial,
    missingKeys,
    presentKeys,
  }
}
