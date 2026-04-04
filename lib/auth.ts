import type { NextAuthOptions } from 'next-auth'
import { getServerSession } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { getPrismaClient, getDatabaseConfigurationStatus } from '@/lib/prisma'
import {
  getEnvGroupStatus,
  type EnvGroupStatus,
  getServerEnv,
} from '@/lib/server-env'
import { ensureServerOnly } from '@/lib/server-only'

ensureServerOnly('lib/auth')

const DEVELOPMENT_AUTH_SECRET = 'master-project-dev-only-secret'

function getAuthProviderStatus(): EnvGroupStatus {
  const env = getServerEnv()

  return getEnvGroupStatus({
    GOOGLE_CLIENT_ID: env.googleClientId,
    GOOGLE_CLIENT_SECRET: env.googleClientSecret,
  })
}

function getAuthProviders() {
  const env = getServerEnv()
  const providerStatus = getAuthProviderStatus()

  if (!providerStatus.isConfigured) {
    return []
  }

  return [
    GoogleProvider({
      clientId: env.googleClientId || '',
      clientSecret: env.googleClientSecret || '',
    }),
  ]
}

export function getAuthConfiguration() {
  const env = getServerEnv()
  const providerStatus = getAuthProviderStatus()
  const databaseStatus = getDatabaseConfigurationStatus()
  const providers = getAuthProviders()
  const hasSecret = Boolean(env.nextAuthSecret)
  const isUsingDevelopmentSecret = !hasSecret && env.nodeEnv !== 'production'
  const sessionStrategy = databaseStatus.isConfigured
    ? ('database' as const)
    : ('jwt' as const)

  return {
    providers,
    providerNames: providers.map((provider) => provider.name),
    providerStatus,
    databaseStatus,
    hasSecret,
    isUsingDevelopmentSecret,
    sessionStrategy,
  }
}

export function getAuthOptions(): NextAuthOptions {
  const env = getServerEnv()
  const authConfiguration = getAuthConfiguration()
  const prisma = authConfiguration.databaseStatus.isConfigured
    ? getPrismaClient()
    : null

  return {
    adapter: prisma ? PrismaAdapter(prisma) : undefined,
    providers: authConfiguration.providers,
    secret:
      env.nextAuthSecret ||
      (authConfiguration.isUsingDevelopmentSecret
        ? DEVELOPMENT_AUTH_SECRET
        : undefined),
    session: {
      strategy: authConfiguration.sessionStrategy,
    },
    pages: {
      signIn: '/',
    },
    callbacks: {
      async session({ session, user, token }) {
        if (session.user) {
          session.user.id =
            (user && 'id' in user && typeof user.id === 'string' && user.id) ||
            (typeof token.sub === 'string' ? token.sub : '')
        }
        return session
      },
    },
  }
}

export function getConfiguredAuthProviders() {
  return getAuthConfiguration().providerNames
}

export function isDatabaseAdapterEnabled() {
  return getAuthConfiguration().databaseStatus.isConfigured
}

export function hasAuthSecret() {
  return getAuthConfiguration().hasSecret
}

export function isUsingDevelopmentAuthSecret() {
  return getAuthConfiguration().isUsingDevelopmentSecret
}

export async function auth() {
  return getServerSession(getAuthOptions())
}
