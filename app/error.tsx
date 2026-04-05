'use client'

import { useEffect } from 'react'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App error boundary:', error)
  }, [error])

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-16 text-white">
      <div className="glass-panel w-full max-w-lg rounded-[32px] px-6 py-8 text-center">
        <p className="text-[11px] uppercase tracking-[0.32em] text-amber-200/70">
          Something went wrong
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
          Gustia hit an unexpected error.
        </h2>
        <p className="mt-4 text-sm leading-7 text-white/72">
          Please try again. If the problem keeps happening, refresh the page or
          contact support.
        </p>
        <button
          type="button"
          onClick={reset}
          className="glass-button-amber mt-6 inline-flex min-h-11 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-amber-50 transition hover:bg-amber-300/24"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
