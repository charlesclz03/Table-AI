import { getAuthConfiguration } from '@/lib/auth'
import { getPublicEnv } from '@/lib/env'
import { getInsForgeConfigurationStatus } from '@/lib/onboarding/insforge'
import { getDatabaseConfigurationStatus } from '@/lib/prisma'
import { getServerEnv, type EnvGroupStatus } from '@/lib/server-env'
import { ensureServerOnly } from '@/lib/server-only'
import { getStripeConfigurationStatus } from '@/lib/stripe'
import { getSupabaseConfigurationStatus } from '@/lib/supabase/server'

ensureServerOnly('lib/runtime-status')

export type RuntimeCheckStatus =
  | 'Configured'
  | 'Waiting'
  | 'Fallback'
  | 'Development'

export interface RuntimeCheck {
  id:
    | 'authentication'
    | 'database'
    | 'supabase'
    | 'stripe'
    | 'insforge'
    | 'authSecret'
  title: string
  status: RuntimeCheckStatus
  detail: string
  configured: boolean
}

export interface RuntimeStatus {
  status: 'ok'
  timestamp: string
  environment: {
    nodeEnv: string
    siteUrl: string
  }
  summary: {
    configured: number
    total: number
  }
  integrations: RuntimeCheck[]
}

function formatMissingKeys(status: EnvGroupStatus) {
  return status.missingKeys.length
    ? ` Missing ${status.missingKeys.join(', ')}.`
    : ''
}

export function getRuntimeStatus(): RuntimeStatus {
  const authConfiguration = getAuthConfiguration()
  const databaseStatus = getDatabaseConfigurationStatus()
  const supabaseStatus = getSupabaseConfigurationStatus()
  const stripeStatus = getStripeConfigurationStatus()
  const insForgeStatus = getInsForgeConfigurationStatus()
  const serverEnv = getServerEnv()
  const publicEnv = getPublicEnv()

  const integrations: RuntimeCheck[] = [
    {
      id: 'authentication',
      title: 'Authentication',
      status: authConfiguration.providerStatus.isConfigured
        ? 'Configured'
        : 'Waiting',
      detail: authConfiguration.providerStatus.isConfigured
        ? `Configured providers: ${authConfiguration.providerNames.join(', ')}.`
        : authConfiguration.providerStatus.isPartial
          ? `Authentication provider setup is incomplete.${formatMissingKeys(
              authConfiguration.providerStatus
            )}`
          : 'No external provider credentials found yet. The auth route is safe but intentionally inactive.',
      configured: authConfiguration.providerStatus.isConfigured,
    },
    {
      id: 'database',
      title: 'Database adapter',
      status: databaseStatus.isConfigured ? 'Configured' : 'Waiting',
      detail: databaseStatus.isConfigured
        ? 'Prisma adapter can connect when database env vars are present.'
        : databaseStatus.isPartial
          ? `Database configuration is incomplete.${formatMissingKeys(
              databaseStatus
            )}`
          : 'DATABASE_URL and DIRECT_URL are missing, so auth falls back to JWT sessions.',
      configured: databaseStatus.isConfigured,
    },
    {
      id: 'supabase',
      title: 'Supabase',
      status: supabaseStatus.isConfigured ? 'Configured' : 'Waiting',
      detail: supabaseStatus.isConfigured
        ? 'Supabase server helpers can create a client.'
        : supabaseStatus.isPartial
          ? `Supabase configuration is incomplete.${formatMissingKeys(
              supabaseStatus
            )}`
          : 'Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable the helper.',
      configured: supabaseStatus.isConfigured,
    },
    {
      id: 'stripe',
      title: 'Stripe',
      status: stripeStatus.isConfigured ? 'Configured' : 'Waiting',
      detail: stripeStatus.isConfigured
        ? 'Stripe server and client keys are available.'
        : stripeStatus.isPartial
          ? `Stripe configuration is incomplete.${formatMissingKeys(
              stripeStatus
            )}`
          : 'Billing helpers stay inert until publishable and secret keys are configured.',
      configured: stripeStatus.isConfigured,
    },
    {
      id: 'insforge',
      title: 'InsForge',
      status: insForgeStatus.isConfigured ? 'Configured' : 'Fallback',
      detail: insForgeStatus.isConfigured
        ? 'Document suggestions will be routed through InsForge.'
        : insForgeStatus.isPartial
          ? `InsForge setup is incomplete.${formatMissingKeys(
              insForgeStatus
            )} Local heuristics remain active.`
          : 'Onboarding suggestions currently use the local heuristic fallback.',
      configured: insForgeStatus.isConfigured,
    },
    {
      id: 'authSecret',
      title: 'NextAuth secret',
      status: authConfiguration.hasSecret
        ? 'Configured'
        : serverEnv.nodeEnv === 'production'
          ? 'Waiting'
          : 'Development',
      detail: authConfiguration.hasSecret
        ? 'A real auth secret is configured.'
        : serverEnv.nodeEnv === 'production'
          ? 'NEXTAUTH_SECRET is required before production use.'
          : 'Development fallback secret is in effect. Set NEXTAUTH_SECRET before production use.',
      configured: authConfiguration.hasSecret,
    },
  ]

  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: serverEnv.nodeEnv,
      siteUrl: publicEnv.siteUrl,
    },
    summary: {
      configured: integrations.filter((integration) => integration.configured)
        .length,
      total: integrations.length,
    },
    integrations,
  }
}
