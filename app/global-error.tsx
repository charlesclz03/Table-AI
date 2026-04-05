'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#07070a] text-white">
        <div className="flex min-h-screen items-center justify-center px-6 py-16">
          <div className="glass-panel w-full max-w-lg rounded-[32px] px-6 py-8 text-center">
            <p className="text-[11px] uppercase tracking-[0.32em] text-amber-200/70">
              System recovery
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
              Gustia needs a full reload.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/72">
              A critical rendering error interrupted the app shell. Reload to
              restore the session.
            </p>
            <button
              type="button"
              onClick={reset}
              className="glass-button-amber mt-6 inline-flex min-h-11 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-amber-50 transition hover:bg-amber-300/24"
            >
              Reload app
            </button>
            <p className="mt-4 text-xs text-white/45">{error.message}</p>
          </div>
        </div>
      </body>
    </html>
  )
}
