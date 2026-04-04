import { PrismaClient } from '@prisma/client'
import {
  getEnvGroupStatus,
  type EnvGroupStatus,
  getServerEnv,
} from '@/lib/server-env'
import { ensureServerOnly } from '@/lib/server-only'

ensureServerOnly('lib/prisma')

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })
}

export function getDatabaseConfigurationStatus(): EnvGroupStatus {
  const env = getServerEnv()

  return getEnvGroupStatus({
    DATABASE_URL: env.databaseUrl,
    DIRECT_URL: env.directUrl,
  })
}

export function isDatabaseConfigured() {
  return getDatabaseConfigurationStatus().isConfigured
}

export function getPrismaClient() {
  if (!isDatabaseConfigured()) {
    return null
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }

  return globalForPrisma.prisma
}
