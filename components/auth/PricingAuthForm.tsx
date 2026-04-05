'use client'

import Link from 'next/link'
import { type FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, LogIn, Mail } from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import type { CheckoutPlanId } from '@/lib/billing/plans'

type AuthMode = 'login' | 'signup'

interface PricingAuthFormProps {
  plan: CheckoutPlanId
  errorMessage?: string | null
  noticeMessage?: string | null
}

interface AuthResponse {
  error?: string
  needsEmailConfirmation?: boolean
  url?: string
}

export function PricingAuthForm({
  plan,
  errorMessage,
  noticeMessage,
}: PricingAuthFormProps) {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inlineError, setInlineError] = useState<string | null>(
    errorMessage || null
  )
  const [inlineNotice, setInlineNotice] = useState<string | null>(
    noticeMessage || null
  )
  const nextPath = useMemo(() => `/auth/checkout?plan=${plan}`, [plan])

  async function submitJson(url: string, payload: Record<string, unknown>) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = (await response.json()) as AuthResponse

    if (!response.ok) {
      throw new Error(data.error || 'Request failed.')
    }

    return data
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setInlineError(null)
    setInlineNotice(null)

    try {
      const endpoint =
        mode === 'signup' ? '/api/auth/signup' : '/api/auth/login'
      const data = await submitJson(endpoint, {
        email,
        name: mode === 'signup' ? name : undefined,
        next: nextPath,
        password,
      })

      if (data.needsEmailConfirmation) {
        setInlineNotice(
          'Your account was created. Confirm your email, then come back here to continue to checkout.'
        )
        return
      }

      router.push(nextPath)
      router.refresh()
    } catch (error) {
      setInlineError(
        error instanceof Error ? error.message : 'Unable to continue right now.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleGoogleSubmit() {
    setIsSubmitting(true)
    setInlineError(null)
    setInlineNotice(null)

    try {
      const endpoint =
        mode === 'signup' ? '/api/auth/signup' : '/api/auth/login'
      const data = await submitJson(endpoint, {
        next: nextPath,
        provider: 'google',
      })

      if (!data.url) {
        throw new Error('Google sign-in did not return a redirect URL.')
      }

      window.location.assign(data.url)
    } catch (error) {
      setInlineError(
        error instanceof Error
          ? error.message
          : 'Unable to continue with Google.'
      )
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
        <p className="text-xs uppercase tracking-[0.28em] text-white/45">
          Sign in to continue
        </p>
        <p className="mt-3 text-sm leading-7 text-white/72">
          Use Google for the fastest checkout handoff, or continue with email
          and password if you prefer.
        </p>
      </div>

      {inlineError ? (
        <div className="rounded-[24px] border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-50">
          {inlineError}
        </div>
      ) : null}

      {inlineNotice ? (
        <div className="rounded-[24px] border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-50">
          {inlineNotice}
        </div>
      ) : null}

      <Button
        type="button"
        variant="brand"
        size="lg"
        className="w-full"
        isLoading={isSubmitting}
        onClick={() => void handleGoogleSubmit()}
      >
        <span className="inline-flex items-center gap-2">
          <LogIn className="h-4 w-4" />
          Continue with Google
          <ArrowRight className="h-4 w-4" />
        </span>
      </Button>

      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-white/35">
        <span className="h-px flex-1 bg-white/10" />
        or use email
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <div className="flex items-center justify-between gap-4 text-sm">
        <div className="inline-flex rounded-full border border-white/10 bg-black/20 p-1">
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`rounded-full px-4 py-2 transition ${
              mode === 'signup'
                ? 'bg-amber-300/15 text-amber-100'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Create account
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`rounded-full px-4 py-2 transition ${
              mode === 'login'
                ? 'bg-amber-300/15 text-amber-100'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Sign in
          </button>
        </div>

        {mode === 'signup' ? (
          <button
            type="button"
            onClick={() => setMode('login')}
            className="text-white/65 transition hover:text-white"
          >
            Already have an account? Sign in
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setMode('signup')}
            className="text-white/65 transition hover:text-white"
          >
            Need an account? Create one
          </button>
        )}
      </div>

      <form className="space-y-4" onSubmit={handlePasswordSubmit}>
        {mode === 'signup' ? (
          <label className="block">
            <span className="mb-2 block text-sm text-white/70">Name</span>
            <input
              type="text"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-12 w-full rounded-[18px] border border-white/10 bg-black/20 px-4 text-white outline-none transition placeholder:text-white/30 focus:border-amber-300/40"
              placeholder="Your name"
              autoComplete="name"
            />
          </label>
        ) : null}

        <label className="block">
          <span className="mb-2 block text-sm text-white/70">Email</span>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 w-full rounded-[18px] border border-white/10 bg-black/20 px-4 text-white outline-none transition placeholder:text-white/30 focus:border-amber-300/40"
            placeholder="owner@restaurant.com"
            autoComplete="email"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-white/70">Password</span>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 w-full rounded-[18px] border border-white/10 bg-black/20 px-4 text-white outline-none transition placeholder:text-white/30 focus:border-amber-300/40"
            placeholder="At least 8 characters"
            autoComplete={
              mode === 'signup' ? 'new-password' : 'current-password'
            }
            minLength={8}
            required
          />
        </label>

        <Button
          type="submit"
          variant="glass"
          size="lg"
          className="w-full border-white/10 text-white"
          isLoading={isSubmitting}
        >
          <span className="inline-flex items-center gap-2">
            <Mail className="h-4 w-4" />
            {mode === 'signup' ? 'Create with email' : 'Continue with email'}
          </span>
        </Button>
      </form>

      <p className="text-sm leading-7 text-white/50">
        By continuing, you&apos;ll go straight to Stripe Checkout with your
        account email ready to use.
      </p>

      <Link
        href="/admin/login"
        className="inline-flex text-sm text-white/55 transition hover:text-white"
      >
        Restaurant owner admin login
      </Link>
    </div>
  )
}
