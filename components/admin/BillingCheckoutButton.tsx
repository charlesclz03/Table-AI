'use client'

import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { getCheckoutPlans, type CheckoutPlanId } from '@/lib/billing/plans'

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

  async function startCheckout(plan: CheckoutPlanId) {
    setIsLoading(true)
    setStatus('')

    try {
      const response = await fetch(`/api/stripe/subscribe?plan=${plan}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancelPath: '/admin/billing?canceled=true',
          restaurantId,
          restaurantName,
          successPath: '/admin/billing?success=true',
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
      <div className="grid gap-3 sm:grid-cols-2">
        {getCheckoutPlans().map((plan) => (
          <Button
            key={plan.id}
            variant={plan.id === 'annual' ? 'glass' : 'brand'}
            onClick={() => void startCheckout(plan.id)}
            isLoading={isLoading}
            disabled={disabled}
            className={plan.id === 'annual' ? 'border-white/10 text-white' : ''}
          >
            <ArrowUpRight className="mr-2 h-4 w-4" />
            {plan.id === 'monthly' ? 'Start Monthly' : 'Start Annual'}
          </Button>
        ))}
      </div>
      {status ? (
        <p className="rounded-full border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75">
          {status}
        </p>
      ) : null}
    </div>
  )
}
