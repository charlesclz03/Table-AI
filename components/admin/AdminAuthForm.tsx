'use client'

import { type FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogIn, Mail } from 'lucide-react'
import { Button } from '@/components/atoms/Button'

type AuthMode = 'login' | 'signup'

interface AdminAuthFormProps {
  errorMessage?: string | null
  initialMode?: AuthMode
  nextPath?: string | null
  noticeMessage?: string | null
}

interface AuthResponse {
  error?: string
  needsEmailConfirmation?: boolean
  url?: string
}

export function AdminAuthForm({
  errorMessage,
  initialMode = 'login',
  nextPath,
  noticeMessage,
}: AdminAuthFormProps) {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>(initialMode)
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
        next: nextPath || undefined,
        password,
      })

      if (data.needsEmailConfirmation) {
        setInlineNotice(
          'Your owner account was created. Check your email to confirm the address, then come back here to log in.'
        )
        return
      }

      router.push(nextPath || '/admin')
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
        next: nextPath || undefined,
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
      <div className="inline-flex rounded-full border border-white/10 bg-black/20 p-1">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`rounded-full px-4 py-2 text-sm transition ${
            mode === 'login'
              ? 'bg-amber-300/15 text-amber-100'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => setMode('signup')}
          className={`rounded-full px-4 py-2 text-sm transition ${
            mode === 'signup'
              ? 'bg-amber-300/15 text-amber-100'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Create owner account
        </button>
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
          variant="brand"
          size="lg"
          className="w-full"
          isLoading={isSubmitting}
        >
          <span className="inline-flex items-center gap-2">
            <Mail className="h-4 w-4" />
            {mode === 'signup' ? 'Create with email' : 'Log in with email'}
          </span>
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-white/35">
        <span className="h-px flex-1 bg-white/10" />
        or
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <Button
        type="button"
        variant="glass"
        size="lg"
        className="w-full border-white/10 text-white"
        isLoading={isSubmitting}
        onClick={() => void handleGoogleSubmit()}
      >
        <span className="inline-flex items-center gap-2">
          <LogIn className="h-4 w-4" />
          {mode === 'signup' ? 'Continue with Google' : 'Log in with Google'}
        </span>
      </Button>
    </div>
  )
}
