'use client'

import { LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'

export function AdminSignOutButton() {
  return (
    <button
      type="button"
      onClick={() => void signOut({ callbackUrl: '/admin/login' })}
      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
    >
      <span className="inline-flex items-center gap-2">
        <LogOut className="h-4 w-4" />
        Sign out
      </span>
    </button>
  )
}
