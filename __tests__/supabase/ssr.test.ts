/* @vitest-environment node */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'
import { getSupabaseServerClient } from '@/lib/supabase/server'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('optional Supabase SSR helpers', () => {
  it('stay inert when Supabase env vars are missing', () => {
    expect(getSupabaseBrowserClient()).toBeNull()
    expect(getSupabaseServerClient()).toBeNull()
  })

  it('create clients when Supabase env vars are configured', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://supabase.example.com')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key')

    const browserClient = getSupabaseBrowserClient()
    const serverClient = getSupabaseServerClient({
      cookies: {
        getAll: () => [],
        setAll: () => undefined,
      },
    })

    expect(browserClient).not.toBeNull()
    expect(serverClient).not.toBeNull()
  })
})
