'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, ShieldCheck } from 'lucide-react'
import type { CheckoutPlanId } from '@/lib/billing/plans'

interface CheckoutRedirectPanelProps {
  plan: CheckoutPlanId
  referralCode?: string | null
}

export function CheckoutRedirectPanel({
  plan,
  referralCode,
}: CheckoutRedirectPanelProps) {
  const startedRef = useRef(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (startedRef.current) {
      return
    }

    startedRef.current = true

    async function startCheckout() {
      try {
        if (referralCode) {
          const referralResponse = await fetch('/api/referral/apply', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code: referralCode,
            }),
          })

          const referralPayload = (await referralResponse.json()) as {
            error?: string
          }

          if (!referralResponse.ok) {
            throw new Error(
              referralPayload.error || 'Unable to apply the referral code.'
            )
          }
        }

        const response = await fetch(`/api/stripe/checkout?plan=${plan}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cancelPath: `/auth/login?plan=${plan}&canceled=true`,
            successPath: `/admin/dashboard?checkout=success&plan=${plan}`,
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
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Unable to start Stripe Checkout.'
        )
      }
    }

    void startCheckout()
  }, [plan, referralCode])

  return (
    <div className="rounded-[28px] border border-white/10 bg-black/20 p-6 text-white">
      <div className="flex items-center gap-3">
        <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 p-3 text-emerald-100">
          {errorMessage ? (
            <ShieldCheck className="h-5 w-5" />
          ) : (
            <Loader2 className="h-5 w-5 animate-spin" />
          )}
        </span>
        <div>
          <p className="text-lg font-semibold">
            {errorMessage
              ? 'Stripe checkout needs attention'
              : 'Preparing secure checkout'}
          </p>
          <p className="mt-1 text-sm text-white/65">
            {errorMessage
              ? 'Stay on this page and try again once the issue is resolved.'
              : referralCode
                ? 'We are applying your referral month first, then sending your authenticated account details to Stripe.'
                : 'We are sending your authenticated account details to Stripe now.'}
          </p>
        </div>
      </div>

      {errorMessage ? (
        <p className="mt-5 rounded-[20px] border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-50">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}
