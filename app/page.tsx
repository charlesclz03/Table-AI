import Link from 'next/link'
import { ArrowRight, QrCode, Sparkles, Wine } from 'lucide-react'

const highlights = [
  'Voice + text concierge tuned to each restaurant menu',
  '5-minute onboarding for dishes, pairings, and FAQs',
  'QR-ready guest experience with owner controls in one place',
]

export default function HomePage() {
  return (
    <div className="relative -mx-6 -mt-6 overflow-hidden px-6 pb-16 pt-10 sm:px-8 lg:-mx-10 lg:px-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_20%_20%,rgba(191,90,36,0.3),transparent_32%),radial-gradient(circle_at_78%_18%,rgba(245,158,11,0.16),transparent_28%),radial-gradient(circle_at_50%_82%,rgba(120,28,58,0.28),transparent_34%)]" />
        <div className="absolute left-1/2 top-24 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full border border-white/10 bg-[radial-gradient(circle,rgba(255,255,255,0.12),rgba(255,255,255,0.02)_38%,transparent_68%)] blur-3xl" />
      </div>

      <section className="relative overflow-hidden rounded-[40px] border border-white/12 bg-[linear-gradient(145deg,rgba(22,15,18,0.94),rgba(9,10,14,0.92))] px-6 py-10 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:px-8 lg:px-12 lg:py-14">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[11px] uppercase tracking-[0.34em] text-amber-100/80">
              <Wine className="h-4 w-4 text-amber-200" />
              AI Concierge for Restaurants
            </div>

            <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
              TableIA
              <span className="block text-white/72">
                A dining-room concierge that speaks your menu.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
              Turn every table into a guided tasting moment with a concierge
              trained on your dishes, wine pairings, allergens, and house story.
              Guests scan, ask, and hear answers in seconds.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/chat/demo"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#8f3d1d] px-7 py-4 text-sm font-semibold text-white shadow-[0_18px_60px_rgba(143,61,29,0.45)] transition hover:bg-[#a64822]"
              >
                Try Demo Chat
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/admin"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/14 bg-white/6 px-7 py-4 text-sm font-semibold text-white/86 backdrop-blur transition hover:border-amber-200/35 hover:bg-white/10"
              >
                Owner Dashboard
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="rounded-[24px] border border-white/10 bg-white/[0.045] px-4 py-4 text-sm leading-6 text-white/68 backdrop-blur"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-x-10 top-10 h-32 rounded-full bg-[#b04d23]/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-[32px] border border-white/12 bg-[linear-gradient(160deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))] p-5 backdrop-blur-xl">
              <div className="rounded-[28px] border border-white/8 bg-[#0f1117]/85 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-amber-100/60">
                      Guest Experience
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      Scan. Ask. Order with confidence.
                    </p>
                  </div>
                  <div className="rounded-full border border-amber-200/20 bg-amber-100/10 p-3 text-amber-200">
                    <QrCode className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="rounded-[24px] border border-white/8 bg-white/[0.04] px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.26em] text-white/45">
                      Concierge
                    </p>
                    <p className="mt-2 text-sm leading-7 text-white/80">
                      Hi, I&apos;m the TableIA concierge. Ask me what wine pairs
                      with octopus or which dishes contain shellfish.
                    </p>
                  </div>
                  <div className="ml-auto max-w-[85%] rounded-[24px] border border-[#b04d23]/25 bg-[#8f3d1d]/20 px-4 py-4 text-sm leading-7 text-amber-50/90">
                    What should I order if I want something traditional and a
                    good red wine pairing?
                  </div>
                  <div className="rounded-[24px] border border-white/8 bg-white/[0.04] px-4 py-4">
                    <p className="text-sm leading-7 text-white/78">
                      Start with the cataplana, then pair it with the house
                      reserva. If you want a lighter route, the grilled fish is
                      a beautiful option.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] border border-white/8 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                    Owner Setup
                  </p>
                  <p className="mt-3 text-sm leading-7 text-white/72">
                    Upload the menu, answer a few concierge questions, and
                    launch a branded QR flow in minutes.
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/8 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                    House Mood
                  </p>
                  <p className="mt-3 text-sm leading-7 text-white/72">
                    Dark glass surfaces, warm cellar tones, and a service vibe
                    that feels premium from the first scan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mt-10 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur">
          <p className="text-[11px] uppercase tracking-[0.32em] text-amber-100/68">
            Why Owners Use It
          </p>
          <p className="mt-4 text-2xl font-semibold text-white">
            TableIA keeps the front-of-house answer ready, even when staff are
            busy.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur">
            <Sparkles className="h-5 w-5 text-amber-200" />
            <p className="mt-4 text-sm uppercase tracking-[0.28em] text-white/45">
              Personality
            </p>
            <p className="mt-3 text-sm leading-7 text-white/70">
              Train the concierge on signature dishes, FAQs, and how your room
              should sound.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur">
            <QrCode className="h-5 w-5 text-amber-200" />
            <p className="mt-4 text-sm uppercase tracking-[0.28em] text-white/45">
              QR Launch
            </p>
            <p className="mt-3 text-sm leading-7 text-white/70">
              Print table-ready QR codes that take guests straight into the demo
              or live concierge flow.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur">
            <Wine className="h-5 w-5 text-amber-200" />
            <p className="mt-4 text-sm uppercase tracking-[0.28em] text-white/45">
              Pairings
            </p>
            <p className="mt-3 text-sm leading-7 text-white/70">
              Answer wine, allergen, and recommendation questions without
              inventing details.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
