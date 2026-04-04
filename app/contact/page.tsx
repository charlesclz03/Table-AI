import Link from 'next/link'

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 rounded-[32px] border border-white/10 bg-white/6 px-6 py-10 text-white backdrop-blur">
      <p className="text-[11px] uppercase tracking-[0.34em] text-amber-200/70">
        Contact
      </p>
      <h1 className="text-4xl font-semibold">Talk to TableIA</h1>
      <p className="text-sm leading-7 text-white/72">
        Want to see how TableIA could fit your restaurant? Reach out and we can
        walk through the guest experience together.
      </p>
      <Link
        href="mailto:hello@tableia.co"
        className="inline-flex rounded-full border border-white/10 bg-black/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-black/30"
      >
        hello@tableia.co
      </Link>
    </div>
  )
}
