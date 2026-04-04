'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export function AdminSignOutButton() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSignOut() {
    setIsSubmitting(true)

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
    } finally {
      router.push('/admin/login')
      router.refresh()
      setIsSubmitting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleSignOut()}
      disabled={isSubmitting}
      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
    >
      <span className="inline-flex items-center gap-2">
        <LogOut className="h-4 w-4" />
        {isSubmitting ? 'Signing out...' : 'Sign out'}
      </span>
    </button>
  )
}
