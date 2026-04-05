import type { User } from '@supabase/supabase-js'

export function getAdminUserName(user: User) {
  const metadata = user.user_metadata

  return (
    (typeof metadata?.full_name === 'string' && metadata.full_name) ||
    (typeof metadata?.name === 'string' && metadata.name) ||
    (typeof metadata?.user_name === 'string' && metadata.user_name) ||
    null
  )
}
