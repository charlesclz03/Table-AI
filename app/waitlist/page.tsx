'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

function WaitlistPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    email: '',
    restaurantName: '',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function validate(): string | null {
    if (!form.name.trim()) return 'Please enter your name.'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return 'Please enter a valid email address.'
    }
    if (!form.restaurantName.trim()) return 'Please enter your restaurant name.'
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = (await response.json()) as {
        error?: string
        success?: boolean
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Something went wrong.')
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 overflow-hidden text-white">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at top, rgba(245,158,11,0.18), transparent 30%), radial-gradient(circle at bottom, rgba(249,115,22,0.12), transparent 38%), linear-gradient(180deg, #100c08 0%, #05060a 100%)',
          }}
        />
        <div className="relative flex min-h-screen items-center justify-center px-4">
          <div className="glass-panel mx-auto w-full max-w-md rounded-[32px] p-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10">
              <svg
                className="h-6 w-6 text-emerald-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-white">
              You are on the list!
            </h1>
            <p className="mt-3 text-sm leading-7 text-white/65">
              We will reach out when your spot opens. In the meantime, follow us
              on social media for updates.
            </p>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="mt-6 rounded-full border border-amber-300/40 bg-amber-300/10 px-6 py-3 text-sm text-amber-100 transition hover:bg-amber-300/20"
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-hidden text-white">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at top, rgba(245,158,11,0.18), transparent 30%), radial-gradient(circle at bottom, rgba(249,115,22,0.12), transparent 38%), linear-gradient(180deg, #100c08 0%, #05060a 100%)',
        }}
      />
      <div className="relative flex min-h-screen items-center justify-center px-4 py-8">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-6 text-center">
            <p className="text-[11px] uppercase tracking-[0.32em] text-amber-200/70">
              Gustia Waitlist
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white">
              Reserve your spot
            </h1>
            <p className="mt-2 text-sm leading-6 text-white/65">
              We are onboarding restaurants gradually. Join the waitlist and we
              will reach out when your spot opens.
            </p>
          </div>

          <div className="glass-panel rounded-[32px] p-6">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-[11px] uppercase tracking-[0.28em] text-amber-200/70"
                >
                  Your name
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="glass-input w-full rounded-[20px] px-4 py-3 text-sm text-white placeholder-white/40"
                  placeholder="Maria Santos"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-[11px] uppercase tracking-[0.28em] text-amber-200/70"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="glass-input w-full rounded-[20px] px-4 py-3 text-sm text-white placeholder-white/40"
                  placeholder="maria@restaurante.pt"
                />
              </div>

              <div>
                <label
                  htmlFor="restaurantName"
                  className="mb-2 block text-[11px] uppercase tracking-[0.28em] text-amber-200/70"
                >
                  Restaurant name
                </label>
                <input
                  id="restaurantName"
                  type="text"
                  autoComplete="organization"
                  required
                  value={form.restaurantName}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      restaurantName: e.target.value,
                    }))
                  }
                  className="glass-input w-full rounded-[20px] px-4 py-3 text-sm text-white placeholder-white/40"
                  placeholder="O Cantinho da Maria"
                />
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="mb-2 block text-[11px] uppercase tracking-[0.28em] text-amber-200/70"
                >
                  Anything to share?{' '}
                  <span className="normal-case tracking-normal text-white/40">
                    (optional)
                  </span>
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={form.notes}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  className="glass-input min-h-[80px] w-full resize-none rounded-[20px] px-4 py-3 text-sm text-white placeholder-white/40"
                  placeholder="Tipo de cozinha, numero de mesas, motivacao para aderir..."
                />
              </div>

              {error ? (
                <p className="rounded-xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full border border-amber-300/40 bg-amber-300/15 py-3.5 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/25 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Join the waitlist'}
              </button>
            </form>
          </div>

          <p className="mt-4 text-center text-xs text-white/40">
            No spam. No commitment. We only email when your spot opens.
          </p>
        </div>
      </div>
    </div>
  )
}

export default WaitlistPage
