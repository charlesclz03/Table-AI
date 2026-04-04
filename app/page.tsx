import Link from 'next/link'
import {
  ArrowRight,
  GlassWater,
  Globe2,
  MapPin,
  MessageCircleMore,
  QrCode,
  Star,
  UtensilsCrossed,
  Wine,
} from 'lucide-react'

const steps = [
  {
    title: 'Guest scans QR code',
    description:
      'Every table becomes an easy entry point, with no app download and no waiting for a server to explain the menu.',
    icon: QrCode,
  },
  {
    title: 'Chat with our AI concierge',
    description:
      'Guests ask naturally about dishes, allergies, wine, or what feels right for the evening.',
    icon: MessageCircleMore,
  },
  {
    title: 'Get recommendations + order',
    description:
      'The conversation guides them toward the right plate, the right glass, and a more confident order.',
    icon: UtensilsCrossed,
  },
] as const

const features = [
  {
    title: 'Speaks any language',
    description:
      'Welcome visitors from Lisbon and abroad with the same warm service at every table.',
    icon: Globe2,
  },
  {
    title: 'Knows your entire menu',
    description:
      'From signature dishes to hidden details, it answers with the confidence of someone who knows the room.',
    icon: GlassWater,
  },
  {
    title: 'Recommends wine pairings',
    description:
      'Turn curiosity into upsell moments with tasteful pairing suggestions that feel personal, not pushy.',
    icon: Wine,
  },
] as const

export default function HomePage() {
  return (
    <div className="relative -mx-6 -mt-6 overflow-hidden px-6 pb-16 pt-8 sm:px-8 lg:-mx-10 lg:px-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[38rem] bg-[radial-gradient(circle_at_15%_18%,rgba(186,86,38,0.34),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(255,214,153,0.16),transparent_22%),radial-gradient(circle_at_50%_78%,rgba(94,22,35,0.3),transparent_36%)]" />
        <div className="absolute left-1/2 top-12 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full border border-white/10 bg-[radial-gradient(circle,rgba(255,255,255,0.12),rgba(255,255,255,0.02)_42%,transparent_70%)] blur-3xl" />
      </div>

      <section className="relative overflow-hidden rounded-[40px] border border-white/12 bg-[linear-gradient(145deg,rgba(27,16,18,0.96),rgba(11,11,15,0.94))] px-5 py-6 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:px-8 sm:py-8 lg:px-12 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[11px] uppercase tracking-[0.32em] text-amber-100/80">
              <MapPin className="h-4 w-4 text-amber-200" />
              Lisbon Dining Vibe
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
              Give every table the feeling of a thoughtful host.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
              TableIA brings the warmth of a great Lisbon dining room into every
              guest conversation, helping visitors discover the right dish, the
              right wine, and the confidence to order more.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/chat/demo"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#9a4420] px-7 py-4 text-sm font-semibold text-white shadow-[0_18px_60px_rgba(154,68,32,0.45)] transition hover:bg-[#b55127]"
              >
                See Demo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/admin/login"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/14 bg-white/6 px-7 py-4 text-sm font-semibold text-white/86 backdrop-blur transition hover:border-amber-200/35 hover:bg-white/10"
              >
                Owner Login
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/68">
              <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2">
                Warm service, even on a full night
              </span>
              <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2">
                Better guidance for tourists and locals
              </span>
              <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2">
                A richer wine-and-food experience
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-x-8 top-10 h-32 rounded-full bg-[#b25529]/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-[34px] border border-white/12 bg-[linear-gradient(165deg,rgba(255,255,255,0.1),rgba(255,255,255,0.03))] p-4 backdrop-blur-xl sm:p-5">
              <div className="rounded-[28px] border border-white/8 bg-[#120f12]/90 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-amber-100/60">
                      Tonight&apos;s Table
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      Candlelight, clinking glasses, zero friction.
                    </p>
                  </div>
                  <div className="rounded-full border border-amber-200/20 bg-amber-100/10 p-3 text-amber-200">
                    <Wine className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-6 grid gap-4">
                  <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4">
                    <p className="text-sm leading-7 text-white/82">
                      A guest sits down by the window, scans the QR code, and
                      asks for something classic, elegant, and very Lisbon.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[24px] border border-white/10 bg-[#8f3d1d]/20 p-4">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-amber-100/60">
                        Suggested Pairing
                      </p>
                      <p className="mt-3 text-base font-medium text-amber-50">
                        Octopus rice with a silky Douro red
                      </p>
                    </div>
                    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
                        Guest Feeling
                      </p>
                      <p className="mt-3 text-base font-medium text-white/85">
                        Understood, guided, ready to order
                      </p>
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
                      Why Owners Love It
                    </p>
                    <p className="mt-3 text-sm leading-7 text-white/72">
                      Your team keeps the room moving while every guest still
                      gets thoughtful answers about dishes, wine, and the story
                      behind the menu.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mt-10 rounded-[36px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur sm:p-8">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.32em] text-amber-100/68">
            How It Works
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-white">
            Three simple steps between the menu and a better order.
          </h2>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon

            return (
              <article
                key={step.title}
                className="rounded-[28px] border border-white/10 bg-black/20 p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-amber-300/20 bg-amber-300/10 p-3 text-amber-100">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-xs uppercase tracking-[0.3em] text-white/35">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-white/68">
                  {step.description}
                </p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="relative mt-10 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 backdrop-blur">
          <p className="text-[11px] uppercase tracking-[0.32em] text-amber-100/68">
            Why It Feels Premium
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-white">
            The service feels more polished, without asking your staff to do
            more.
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/68">
            TableIA is designed for restaurant owners who want every guest to
            feel looked after, especially during the busiest part of service.
          </p>
        </div>

        <div className="grid gap-4">
          {features.map((feature) => {
            const Icon = feature.icon

            return (
              <article
                key={feature.title}
                className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur"
              >
                <div className="flex items-start gap-4">
                  <span className="rounded-full border border-amber-300/20 bg-amber-300/10 p-3 text-amber-100">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-white/68">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="relative mt-10 rounded-[36px] border border-dashed border-white/12 bg-white/[0.03] p-6 backdrop-blur sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.32em] text-amber-100/68">
              Social Proof
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-white">
              Future home for restaurant logos and success stories.
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/68">
              Add your first partner logos here as the roster grows.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/68">
            <Star className="h-4 w-4 text-amber-200" />
            Placeholder for trusted restaurant brands
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {['Logo One', 'Logo Two', 'Logo Three', 'Logo Four'].map((item) => (
            <div
              key={item}
              className="flex min-h-24 items-center justify-center rounded-[24px] border border-white/10 bg-black/20 px-4 text-sm uppercase tracking-[0.24em] text-white/30"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="relative mt-10 rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,rgba(154,68,32,0.2),rgba(255,255,255,0.04))] p-6 backdrop-blur sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.32em] text-amber-100/68">
              Ready To See It
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-white">
              Open the demo and imagine this at your own tables tonight.
            </h2>
          </div>

          <Link
            href="/chat/demo"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-semibold text-[#35170f] transition hover:bg-amber-50"
          >
            See Demo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="relative mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/58 sm:flex-row sm:items-center sm:justify-between">
        <p>TableIA for restaurant owners</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/privacy" className="transition hover:text-white">
            Privacy Policy
          </Link>
          <Link href="/terms" className="transition hover:text-white">
            Terms of Service
          </Link>
          <Link href="/contact" className="transition hover:text-white">
            Contact
          </Link>
        </div>
      </footer>
    </div>
  )
}
