'use client'

import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/atoms/Button'

interface BillingCheckoutButtonProps {
  restaurantId: string
  restaurantName: string
  disabled?: boolean
}

export function BillingCheckoutButton({
  restaurantId,
  restaurantName,
  disabled = false,
}: BillingCheckoutButtonProps) {
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function startCheckout() {
    setIsLoading(true)
    setStatus('')

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId,
          restaurantName,
        }),
      })

      const payload = (await response.json()) as {
        error?: string
        url?: string
      }

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || 'Unable to start Stripe Checkout.')
      }

      window.location.assign(payload.url)
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : 'Unable to start Stripe Checkout.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button
        variant="brand"
        onClick={() => void startCheckout()}
        isLoading={isLoading}
        disabled={disabled}
      >
        <ArrowUpRight className="mr-2 h-4 w-4" />
        Get Started - €299 Setup
      </Button>
      {status ? (
        <p className="rounded-full border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75">
          {status}
        </p>
      ) : null}
    </div>
  )
}
