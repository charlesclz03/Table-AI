'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppToast } from '@/lib/contexts/ToastContext'

interface RefundInvoiceButtonProps {
  refundTargetId: string
}

export function RefundInvoiceButton({
  refundTargetId,
}: RefundInvoiceButtonProps) {
  const router = useRouter()
  const toast = useAppToast()
  const [isRequesting, setIsRequesting] = useState(false)

  async function handleRefundRequest() {
    if (!refundTargetId || isRequesting) {
      return
    }

    setIsRequesting(true)

    try {
      const response = await fetch('/api/stripe/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId: refundTargetId,
        }),
      })
      const payload = (await response.json().catch(() => null)) as {
        error?: string
        success?: boolean
      } | null

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || 'Unable to request refund.')
      }

      toast.success('Refund requested successfully.')
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to request refund.'
      )
    } finally {
      setIsRequesting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleRefundRequest}
      disabled={isRequesting}
      className="rounded-full border border-rose-300/20 bg-rose-500/10 px-4 py-2 text-sm text-rose-100 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isRequesting ? 'Requesting refund...' : 'Request Refund'}
    </button>
  )
}
