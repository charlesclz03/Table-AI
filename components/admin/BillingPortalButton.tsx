'use client'

import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/atoms/Button'

interface BillingPortalButtonProps {
  disabled?: boolean
}

export function BillingPortalButton({
  disabled = false,
}: BillingPortalButtonProps) {
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function openPortal() {
    setIsLoading(true)
    setStatus('')

    try {
      const response = await fetch('/api/admin/billing/portal', {
        method: 'POST',
      })

      const payload = (await response.json()) as {
        url?: string
        error?: string
      }

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || 'Unable to open the Stripe portal.')
      }

      window.location.assign(payload.url)
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : 'Unable to open the Stripe portal.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button
        variant="brand"
        onClick={() => void openPortal()}
        isLoading={isLoading}
        disabled={disabled}
      >
        <ArrowUpRight className="mr-2 h-4 w-4" />
        Manage Subscription
      </Button>
      {status ? (
        <p className="rounded-full border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75">
          {status}
        </p>
      ) : null}
    </div>
  )
}
