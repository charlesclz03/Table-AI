interface RouteLoadingShellProps {
  eyebrow: string
  message: string
}

export function RouteLoadingShell({
  eyebrow,
  message,
}: RouteLoadingShellProps) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-6 py-16">
      <div className="glass-panel w-full max-w-md rounded-[32px] px-6 py-8 text-center text-white">
        <div className="mx-auto h-14 w-14 animate-spin rounded-full border-2 border-white/20 border-t-amber-200" />
        <p className="mt-5 text-[11px] uppercase tracking-[0.32em] text-amber-200/70">
          {eyebrow}
        </p>
        <p className="mt-3 text-sm leading-7 text-white/72">{message}</p>
      </div>
    </div>
  )
}
