interface EmptyRestaurantStateProps {
  email: string
}

export function EmptyRestaurantState({ email }: EmptyRestaurantStateProps) {
  return (
    <div className="rounded-[32px] border border-amber-300/20 bg-amber-100/10 px-6 py-8 text-white backdrop-blur">
      <p className="text-[11px] uppercase tracking-[0.34em] text-amber-200/70">
        Restaurant Setup Missing
      </p>
      <h2 className="mt-3 text-2xl font-semibold">
        No restaurant is linked to this login yet.
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">
        The owner dashboard looks up your row in the Supabase `restaurants`
        table using
        <span className="mx-1 rounded bg-white/10 px-2 py-1 font-mono text-xs">
          {email}
        </span>
        as the owner email. Add or update that row and the admin pages will
        light up immediately.
      </p>
    </div>
  )
}
