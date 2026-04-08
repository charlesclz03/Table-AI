import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

function normalizeEnvValue(value: unknown) {
  if (typeof value !== 'string') {
    return value
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const optionalTrimmedString = z.preprocess(
  normalizeEnvValue,
  z.string().min(1).optional()
)

const optionalUrl = z.preprocess(normalizeEnvValue, z.string().url().optional())

const optionalPositiveInteger = z.preprocess((value) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? value : undefined
  }

  if (typeof value !== 'string') {
    return undefined
  }

  const parsed = Number.parseInt(value.trim(), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}, z.number().int().positive().optional())

export interface PublicEnv {
  siteUrl: string
  supabaseUrl?: string
  supabaseAnonKey?: string
  stripePublishableKey?: string
  sessionDurationSeconds?: number
}

function createValidatedEnv(runtimeEnv: NodeJS.ProcessEnv = process.env) {
  return createEnv({
    server: {
      NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
      NEXTAUTH_URL: optionalUrl,
      NEXTAUTH_SECRET: optionalTrimmedString,
      GOOGLE_CLIENT_ID: optionalTrimmedString,
      GOOGLE_CLIENT_SECRET: optionalTrimmedString,
      DATABASE_URL: optionalTrimmedString,
      DIRECT_URL: optionalTrimmedString,
      STRIPE_SECRET_KEY: optionalTrimmedString,
      STRIPE_WEBHOOK_SECRET: optionalTrimmedString,
      STRIPE_PRICE_ID_MONTHLY: optionalTrimmedString,
      STRIPE_PRICE_ID_YEARLY: optionalTrimmedString,
      OPENAI_API_KEY: optionalTrimmedString,
      GOOGLE_PLACES_API_KEY: optionalTrimmedString,
      SUPABASE_SERVICE_ROLE_KEY: optionalTrimmedString,
      INSFORGE_BASE_URL: optionalUrl,
      INSFORGE_API_KEY: optionalTrimmedString,
      INSFORGE_TIMEOUT_MS: optionalPositiveInteger,
      SUPERADMIN_EMAILS: optionalTrimmedString,
      NOTIFY_TO_EMAIL: optionalTrimmedString,
      RESEND_API_KEY: optionalTrimmedString,
      SENDGRID_API_KEY: optionalTrimmedString,
      ZAPIER_WEBHOOK_URL: optionalTrimmedString,
    },
    client: {
      NEXT_PUBLIC_SITE_URL: optionalUrl,
      NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalTrimmedString,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optionalTrimmedString,
      NEXT_PUBLIC_SESSION_DURATION_SECONDS: optionalPositiveInteger,
    },
    runtimeEnv: {
      NODE_ENV: runtimeEnv.NODE_ENV,
      NEXTAUTH_URL: runtimeEnv.NEXTAUTH_URL,
      NEXTAUTH_SECRET: runtimeEnv.NEXTAUTH_SECRET,
      GOOGLE_CLIENT_ID: runtimeEnv.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: runtimeEnv.GOOGLE_CLIENT_SECRET,
      DATABASE_URL: runtimeEnv.DATABASE_URL,
      DIRECT_URL: runtimeEnv.DIRECT_URL,
      STRIPE_SECRET_KEY: runtimeEnv.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: runtimeEnv.STRIPE_WEBHOOK_SECRET,
      STRIPE_PRICE_ID_MONTHLY: runtimeEnv.STRIPE_PRICE_ID_MONTHLY,
      STRIPE_PRICE_ID_YEARLY: runtimeEnv.STRIPE_PRICE_ID_YEARLY,
      OPENAI_API_KEY: runtimeEnv.OPENAI_API_KEY,
      GOOGLE_PLACES_API_KEY: runtimeEnv.GOOGLE_PLACES_API_KEY,
      SUPABASE_SERVICE_ROLE_KEY: runtimeEnv.SUPABASE_SERVICE_ROLE_KEY,
      INSFORGE_BASE_URL: runtimeEnv.INSFORGE_BASE_URL,
      INSFORGE_API_KEY: runtimeEnv.INSFORGE_API_KEY,
      INSFORGE_TIMEOUT_MS: runtimeEnv.INSFORGE_TIMEOUT_MS,
      SUPERADMIN_EMAILS: runtimeEnv.SUPERADMIN_EMAILS,
      NOTIFY_TO_EMAIL: runtimeEnv.NOTIFY_TO_EMAIL,
      RESEND_API_KEY: runtimeEnv.RESEND_API_KEY,
      SENDGRID_API_KEY: runtimeEnv.SENDGRID_API_KEY,
      ZAPIER_WEBHOOK_URL: runtimeEnv.ZAPIER_WEBHOOK_URL,
      NEXT_PUBLIC_SITE_URL: runtimeEnv.NEXT_PUBLIC_SITE_URL,
      NEXT_PUBLIC_SUPABASE_URL: runtimeEnv.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: runtimeEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
        runtimeEnv.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      NEXT_PUBLIC_SESSION_DURATION_SECONDS:
        runtimeEnv.NEXT_PUBLIC_SESSION_DURATION_SECONDS,
    },
    emptyStringAsUndefined: false,
  })
}

export function getValidatedEnv(runtimeEnv?: NodeJS.ProcessEnv) {
  return createValidatedEnv(runtimeEnv)
}

export function getPublicEnv(): PublicEnv {
  const env = getValidatedEnv()

  return {
    siteUrl: env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    stripePublishableKey: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    sessionDurationSeconds: env.NEXT_PUBLIC_SESSION_DURATION_SECONDS,
  }
}

export function getPublicEnvValue(name: keyof NodeJS.ProcessEnv) {
  return normalizeEnvValue(process.env[name])
}
