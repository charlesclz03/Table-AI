import Link from 'next/link'

export default function ContactPage() {
  return (
    <div className="glass-panel mx-auto max-w-3xl space-y-6 rounded-[32px] px-6 py-10 text-white">
      <p className="text-[11px] uppercase tracking-[0.34em] text-amber-200/70">
        Contact
      </p>
      <h1 className="text-4xl font-semibold">Talk to Gustia</h1>
      <p className="text-sm leading-7 text-white/72">
        Want to see how Gustia could fit your restaurant? Reach out and we can
        walk through the guest experience together.
      </p>
      <Link
        href="mailto:contact@gustia.wine"
        className="glass-button inline-flex rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/12"
      >
        contact@gustia.wine
      </Link>
    </div>
  )
}
