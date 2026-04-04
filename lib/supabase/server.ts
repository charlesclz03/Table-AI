import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getPublicEnv } from '@/lib/env'
import { getServerEnv } from '@/lib/server-env'
import {
  getSupabaseConfigurationStatus,
  isSupabaseConfigured,
} from '@/lib/supabase/config'
import { ensureServerOnly } from '@/lib/server-only'

ensureServerOnly('lib/supabase/server')

interface SupabaseCookie {
  name: string
  value: string
}

interface SupabaseSetCookie extends SupabaseCookie {
  options?: Record<string, unknown>
}

interface SupabaseCookieAdapter {
  getAll: () => SupabaseCookie[]
  setAll?: (cookies: SupabaseSetCookie[]) => void
}

function getDefaultCookieAdapter(): SupabaseCookieAdapter {
  return {
    getAll: () => [],
    setAll: () => undefined,
  }
}

export { getSupabaseConfigurationStatus }

export function getSupabaseServerClient(options?: {
  cookies?: SupabaseCookieAdapter
  serviceRole?: boolean
}): SupabaseClient | null {
  const publicEnv = getPublicEnv()
  const serverEnv = getServerEnv()
  const cookies = options?.cookies || getDefaultCookieAdapter()

  if (
    !isSupabaseConfigured() ||
    !publicEnv.supabaseUrl ||
    !publicEnv.supabaseAnonKey
  ) {
    return null
  }

  const apiKey =
    options?.serviceRole && serverEnv.supabaseServiceRoleKey
      ? serverEnv.supabaseServiceRoleKey
      : publicEnv.supabaseAnonKey

  return createServerClient(publicEnv.supabaseUrl, apiKey, {
    cookies: {
      getAll: cookies.getAll,
      setAll: (cookieValues) => cookies.setAll?.(cookieValues),
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
