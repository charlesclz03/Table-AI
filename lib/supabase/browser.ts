import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getPublicEnv } from '@/lib/env'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export function getSupabaseBrowserClient(): SupabaseClient | null {
  const env = getPublicEnv()

  if (!isSupabaseConfigured() || !env.supabaseUrl || !env.supabaseAnonKey) {
    return null
  }

  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey, {
    isSingleton: true,
  })
}
