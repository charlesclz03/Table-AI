import { getPublicEnv } from '@/lib/env'
import { getEnvGroupStatus, type EnvGroupStatus } from '@/lib/server-env'

export function getSupabaseConfigurationStatus(): EnvGroupStatus {
  const env = getPublicEnv()

  return getEnvGroupStatus({
    NEXT_PUBLIC_SUPABASE_URL: env.supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: env.supabaseAnonKey,
  })
}

export function isSupabaseConfigured() {
  return getSupabaseConfigurationStatus().isConfigured
}
