'use client'

import Link from 'next/link'
import { useRef } from 'react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import {
  ArrowRight,
  Check,
  CircleHelp,
  FileText,
  Globe2,
  Languages,
  MapPin,
  PhoneCall,
  QrCode,
  ShieldCheck,
  Sparkles,
  TabletSmartphone,
  Wine,
} from 'lucide-react'

const heroJourney = [
  'Connect your menu in minutes',
  'Shape the concierge to fit your room',
  'Print polished QR displays for every table',
  'Let guests self-serve answers while staff focuses on hospitality',
] as const

const problemPoints = [
  {
    title: 'Tourist questions slow the room down',
    description:
      'Guests ask about ingredients, pairings, and local dishes right when your team is busiest.',
    icon: Globe2,
  },
  {
    title: 'Allergens and menu details need instant answers',
    description:
      'A paper menu cannot explain substitutions, wines by style, or what works for dietary restrictions.',
    icon: CircleHelp,
  },
  {
    title: 'Great service should still feel personal',
    description:
      'Owners need help that protects premium hospitality instead of replacing the human tone of the dining room.',
    icon: ShieldCheck,
  },
] as const

const ownerSteps = [
  {
    id: 'step-1',
    step: '01',
    title: 'Connect Your Menu',
    summary: 'Upload your menu and let AI learn the dishes, wines, and prices.',
    detail:
      'Start with a menu photo or PDF. Gustia turns that into a working restaurant knowledge base without making you type every line by hand.',
    bullets: [
      'Upload your restaurant menu from photo or PDF',
      'AI extracts dishes, wines, prices, and key details',
      'Review the result before going live',
    ],
    accent: 'Deep blue',
    label: 'Owner setup begins here',
    imageUrl:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80',
    imageKicker: 'Kitchen-ready data',
    imageNote: 'A menu capture becomes a searchable concierge brain.',
    overlayClass:
      'bg-[linear-gradient(180deg,rgba(14,53,116,0.78),rgba(7,12,24,0.9))]',
  },
  {
    id: 'step-2',
    step: '02',
    title: 'Customize Your Concierge',
    summary:
      'Set the personality, FAQs, and recommendations that match your house style.',
    detail:
      'Choose how the AI speaks, what it emphasizes, and how it handles the questions your staff hears every night.',
    bullets: [
      "Choose the AI's personality and wine-forward tone",
      'Add FAQs, service notes, and recommendation rules',
      'Preview the guest experience before launch',
    ],
    accent: 'Warm gold',
    label: 'Tune the voice of the room',
    imageUrl:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80',
    imageKicker: 'Control the tone',
    imageNote:
      'Owners decide how premium, playful, or wine-led the concierge feels.',
    overlayClass:
      'bg-[linear-gradient(180deg,rgba(137,96,25,0.8),rgba(24,17,8,0.92))]',
  },
  {
    id: 'step-3',
    step: '03',
    title: 'Print Your QR Codes',
    summary:
      'Generate table-ready QR posters that look elegant in the dining room.',
    detail:
      'Download polished QR assets for each table, print them, and place them exactly where guests naturally reach for answers.',
    bullets: [
      'Generate table-specific QR codes in one place',
      'Download, print, and place polished displays',
      'Keep the paper menu while adding a smarter layer',
    ],
    accent: 'Emerald green',
    label: 'Operationally simple',
    imageUrl:
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1400&q=80',
    imageKicker: 'Ready for service',
    imageNote:
      'A discreet QR display invites questions without disrupting the table.',
    overlayClass:
      'bg-[linear-gradient(180deg,rgba(18,99,74,0.82),rgba(8,22,18,0.92))]',
  },
  {
    id: 'step-4',
    step: '04',
    title: 'Guests Enjoy',
    summary:
      'Guests scan, chat, and order while your team focuses on the human side of service.',
    detail:
      'When the concierge handles routine questions, staff can stay attentive to the room, deliver faster, and spend more energy on hospitality.',
    bullets: [
      'Guests scan, ask naturally, and chat in their language',
      'The concierge recommends dishes, wines, and pairings',
      'Staff stays free to welcome, serve, and upsell in person',
    ],
    accent: 'Burgundy wine',
    label: 'The service payoff',
    imageUrl:
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1400&q=80',
    imageKicker: 'Guests feel guided',
    imageNote:
      'The table gets answers quickly, while the room still feels fully hosted.',
    overlayClass:
      'bg-[linear-gradient(180deg,rgba(103,23,48,0.84),rgba(20,8,13,0.94))]',
  },
] as const

const guestJourney = [
  {
    title: 'QR',
    subtitle: 'Scan from the table',
    colorClass: 'from-fuchsia-400/80 to-violet-500/70',
    icon: QrCode,
  },
  {
    title: 'Language',
    subtitle: 'Pick the guest language',
    colorClass: 'from-sky-400/80 to-blue-500/70',
    icon: Languages,
  },
  {
    title: 'Theme',
    subtitle: 'Choose a concierge vibe',
    colorClass: 'from-amber-300/85 to-orange-400/70',
    icon: Wine,
  },
  {
    title: 'Sphere',
    subtitle: 'Enter the AI conversation',
    colorClass: 'from-rose-500/80 to-fuchsia-600/70',
    icon: Sparkles,
  },
] as const

const smoothEase = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: smoothEase },
  },
}

function SectionShell({
  id,
  overlayClass,
  children,
  className = '',
}: {
  id?: string
  overlayClass: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      id={id}
      className={`relative isolate overflow-hidden border-t border-white/10 ${className}`}
    >
      <div className={`absolute inset-0 ${overlayClass}`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_34%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.12),transparent_26%,transparent_74%,rgba(255,255,255,0.08))] opacity-35" />
      <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        {children}
      </div>
    </section>
  )
}

function ChevronDownHint() {
  return (
    <span className="inline-flex items-center gap-2 text-white/50">
      Scroll
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/8">
        <motion.span
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowRight className="h-4 w-4 rotate-90" />
        </motion.span>
      </span>
    </span>
  )
}

function StepSection({
  step,
  reverse,
}: {
  step: (typeof ownerSteps)[number]
  reverse: boolean
}) {
  const shouldReduceMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const mediaY = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [34, -34]
  )
  const copyY = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [16, -16]
  )

  return (
    <SectionShell
      id={step.id}
      overlayClass={step.overlayClass}
      className="min-h-[82svh] scroll-mt-28"
    >
      <div
        ref={ref}
        className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center"
      >
        <motion.div
          style={{ y: mediaY }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={fadeUp}
          className={reverse ? 'lg:order-2' : ''}
        >
          <div className="glass-panel-soft relative min-h-[23rem] overflow-hidden rounded-[2rem] sm:min-h-[28rem]">
            <div
              className="absolute inset-0 scale-105 bg-cover bg-center"
              style={{ backgroundImage: `url("${step.imageUrl}")` }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,7,10,0.04),rgba(7,7,10,0.7))]" />
            <div className="relative flex h-full flex-col justify-between p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <span className="glass-chip-muted rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.32em] text-white/82">
                  {step.imageKicker}
                </span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-white/78">
                  {step.accent}
                </span>
              </div>

              <div className="glass-panel-soft max-w-xs rounded-[1.5rem] p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-white/58">
                  Gustia setup
                </p>
                <p className="mt-3 text-base font-medium leading-7 text-white">
                  {step.imageNote}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          style={{ y: copyY }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={fadeUp}
          className={`max-w-xl ${reverse ? 'lg:order-1' : ''}`}
        >
          <p className="text-[11px] uppercase tracking-[0.34em] text-white/70">
            Step {step.step}
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
            {step.title}
          </h2>
          <p className="mt-5 text-lg leading-8 text-white/84">{step.summary}</p>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/68 sm:text-base">
            {step.detail}
          </p>

          <div className="mt-8 space-y-3">
            {step.bullets.map((bullet) => (
              <div
                key={bullet}
                className="glass-panel-soft flex items-start gap-3 rounded-[1.35rem] px-4 py-4"
              >
                <span className="mt-0.5 rounded-full border border-white/15 bg-white/12 p-1 text-white">
                  <Check className="h-4 w-4" />
                </span>
                <p className="text-sm leading-7 text-white/78">{bullet}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#start"
              className="glass-button inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/12"
            >
              See pricing
              <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="glass-chip inline-flex min-h-11 items-center rounded-full px-4 py-3 text-sm text-white/70">
              {step.label}
            </span>
          </div>
        </motion.div>
      </div>
    </SectionShell>
  )
}

export default function HomePage() {
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const heroCardY = useTransform(
    scrollYProgress,
    [0, 0.35],
    shouldReduceMotion ? [0, 0] : [0, -48]
  )
  const heroCardRotate = useTransform(
    scrollYProgress,
    [0, 0.35],
    shouldReduceMotion ? [0, 0] : [0, -3]
  )

  return (
    <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-x-clip text-white">
      <SectionShell
        overlayClass="bg-[linear-gradient(180deg,rgba(99,58,154,0.74),rgba(22,14,34,0.92))]"
        className="border-t-0"
      >
        <div className="grid min-h-[calc(100svh-8rem)] items-end gap-10 pt-4 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 lg:pt-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="max-w-2xl"
          >
            <div className="glass-chip inline-flex min-h-11 items-center gap-3 rounded-full px-4 py-3 text-[11px] uppercase tracking-[0.32em] text-white/76">
              <MapPin className="h-4 w-4 text-[#f0d9ff]" />
              Luxury AI for restaurant owners
            </div>

            <h1 className="mt-6 text-5xl font-semibold tracking-[-0.065em] text-white sm:text-6xl lg:text-8xl">
              Your restaurant&apos;s AI concierge.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-white/78 sm:text-lg">
              Gustia gives restaurant owners a vertical setup flow: connect the
              menu, shape the concierge, print the QR, and let guests get fast
              answers without breaking the premium feel of service.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#start"
                className="glass-button inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/12"
              >
                Choose your plan
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#guest-preview"
                className="glass-button inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold text-white/82 transition hover:bg-white/12"
              >
                See the guest journey
              </Link>
            </div>

            <div className="mt-8 grid gap-3 text-sm text-white/72 sm:grid-cols-2">
              <div className="glass-panel-soft rounded-[1.5rem] px-4 py-4">
                Answers tourist questions, allergens, and pairing doubts.
              </div>
              <div className="glass-panel-soft rounded-[1.5rem] px-4 py-4">
                Keeps your team focused on service, not repetitive explaining.
              </div>
            </div>
          </motion.div>

          <motion.div
            style={{ y: heroCardY, rotate: heroCardRotate }}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: smoothEase, delay: 0.1 }}
            className="mx-auto w-full max-w-md lg:mx-0 lg:justify-self-end"
          >
            <div className="glass-panel relative overflow-hidden rounded-[2.2rem] p-4">
              <div className="absolute inset-x-6 top-0 h-36 rounded-full bg-white/16 blur-3xl" />
              <div className="glass-panel-soft relative rounded-[1.8rem] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.32em] text-white/55">
                      Owner tutorial
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                      Four setup moves to go live.
                    </p>
                  </div>
                  <div className="rounded-full border border-white/15 bg-white/8 p-3 text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {heroJourney.map((item, index) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.55,
                        delay: 0.18 + index * 0.1,
                        ease: smoothEase,
                      }}
                      className="glass-panel-soft flex items-start gap-4 rounded-[1.4rem] px-4 py-4"
                    >
                      <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full border border-white/15 bg-white/12 text-xs font-semibold text-white">
                        0{index + 1}
                      </span>
                      <p className="text-sm leading-7 text-white/80">{item}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="glass-panel-soft mt-5 flex items-center justify-between rounded-[1.4rem] px-4 py-4 text-sm text-white/72">
                  <span>Built for launch at 375px and up</span>
                  <ChevronDownHint />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </SectionShell>

      <SectionShell overlayClass="bg-[linear-gradient(180deg,rgba(29,21,49,0.68),rgba(10,10,18,0.92))]">
        <div
          id="problem"
          className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14"
        >
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeUp}
            className="max-w-lg"
          >
            <p className="text-[11px] uppercase tracking-[0.34em] text-white/65">
              Why restaurants need this
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
              The room feels busy long before the kitchen does.
            </h2>
            <p className="mt-5 text-base leading-8 text-white/74 sm:text-lg">
              Gustia exists for the questions that arrive between the menu and
              the order: what pairs with sea bass, what is gluten free, which
              wine is fuller, and whether the dish is spicy enough for this
              table.
            </p>
          </motion.div>

          <div className="space-y-4">
            {problemPoints.map((point, index) => {
              const Icon = point.icon

              return (
                <motion.article
                  key={point.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{
                    duration: 0.65,
                    delay: index * 0.08,
                    ease: smoothEase,
                  }}
                  className="glass-panel-soft rounded-[1.8rem] px-5 py-5"
                >
                  <div className="flex items-start gap-4">
                    <span className="rounded-full border border-white/12 bg-white/10 p-3 text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {point.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-white/70 sm:text-base">
                        {point.description}
                      </p>
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </div>
        </div>
      </SectionShell>

      {ownerSteps.map((step, index) => (
        <StepSection key={step.id} step={step} reverse={index % 2 === 1} />
      ))}

      <SectionShell
        id="guest-preview"
        overlayClass="bg-[linear-gradient(180deg,rgba(56,22,76,0.74),rgba(13,9,20,0.94))]"
      >
        <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeUp}
            className="max-w-xl"
          >
            <p className="text-[11px] uppercase tracking-[0.34em] text-white/68">
              Guest experience preview
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
              Market the full guest flow without making the page about the app.
            </h2>
            <p className="mt-5 text-base leading-8 text-white/76 sm:text-lg">
              Owners still need to see what guests will feel. The journey is
              simple: QR, language, theme, then a warm AI chat that recommends
              dishes and wine in the guest&apos;s language.
            </p>

            <div className="mt-8 space-y-3">
              <div className="glass-panel-soft flex items-start gap-3 rounded-[1.5rem] px-4 py-4">
                <span className="rounded-full border border-white/12 bg-white/10 p-2 text-white">
                  <QrCode className="h-4 w-4" />
                </span>
                <p className="text-sm leading-7 text-white/78">
                  Show that scanning is the first step, not an awkward detour.
                </p>
              </div>
              <div className="glass-panel-soft flex items-start gap-3 rounded-[1.5rem] px-4 py-4">
                <span className="rounded-full border border-white/12 bg-white/10 p-2 text-white">
                  <Languages className="h-4 w-4" />
                </span>
                <p className="text-sm leading-7 text-white/78">
                  Highlight language choice and theme selection as premium
                  touches for tourists and regulars alike.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, ease: smoothEase }}
            className="mx-auto w-full max-w-md"
          >
            <div className="glass-panel rounded-[2.4rem] p-4">
              <div className="glass-panel-soft rounded-[2rem] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.32em] text-white/52">
                      Guest onboarding
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                      QR to concierge in seconds.
                    </p>
                  </div>
                  <div className="rounded-full border border-white/12 bg-white/8 p-3 text-white">
                    <TabletSmartphone className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {guestJourney.map((item, index) => {
                    const Icon = item.icon

                    return (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.25 }}
                        transition={{
                          duration: 0.55,
                          delay: index * 0.08,
                          ease: smoothEase,
                        }}
                        className={`rounded-[1.4rem] border border-white/10 bg-gradient-to-r ${item.colorClass} p-[1px]`}
                      >
                        <div className="glass-panel-soft flex items-center gap-4 rounded-[1.35rem] px-4 py-4">
                          <span className="rounded-full border border-white/10 bg-white/10 p-3 text-white">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {item.title}
                            </p>
                            <p className="text-sm text-white/68">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.05] px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-white/48">
                    Demo moment
                  </p>
                  <p className="mt-3 text-sm leading-7 text-white/78">
                    &ldquo;Bonsoir. Looking for something elegant with seafood
                    tonight? I can suggest a crisp white, a richer option, or
                    the best wine by the glass.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </SectionShell>

      <SectionShell overlayClass="bg-[linear-gradient(180deg,rgba(18,18,28,0.74),rgba(8,8,12,0.94))]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={fadeUp}
          className="max-w-3xl"
        >
          <p className="text-[11px] uppercase tracking-[0.34em] text-white/65">
            Pricing
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
            One activation, then a clear monthly or annual subscription.
          </h2>
          <p className="mt-5 text-base leading-8 text-white/76 sm:text-lg">
            Keep the language simple and owner-friendly: activation to go live,
            then a subscription that stays easy to understand.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.75, ease: smoothEase }}
          className="glass-panel mt-8 rounded-[2rem] p-5 sm:p-6"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-white/60">
                Activation
              </p>
              <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
                &euro;99
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
                Everything you need to go live: menu setup, concierge
                configuration, launch guidance, and a 14-day guarantee.
              </p>
            </div>

            <div className="glass-alert-emerald inline-flex min-h-11 items-center rounded-full px-4 py-3 text-sm font-medium text-emerald-100">
              14-day guarantee
            </div>
          </div>
        </motion.div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <motion.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, ease: smoothEase }}
            className="glass-panel-soft rounded-[2rem] p-5 sm:p-6"
          >
            <p className="text-[11px] uppercase tracking-[0.32em] text-white/56">
              Monthly
            </p>
            <div className="mt-4 flex items-end gap-3">
              <h3 className="text-4xl font-semibold tracking-[-0.05em] text-white">
                &euro;49
              </h3>
              <span className="pb-1 text-white/62">/ month</span>
            </div>
            <p className="mt-4 text-sm leading-7 text-white/74 sm:text-base">
              Cancel anytime. Best when you want the easiest path to launch a
              single venue and start learning from live tables fast.
            </p>
            <div className="mt-6 space-y-3 text-sm text-white/76">
              <div className="flex items-start gap-3">
                <Check className="mt-1 h-4 w-4 flex-none text-white" />
                Multilingual concierge with menu and pairing guidance
              </div>
              <div className="flex items-start gap-3">
                <Check className="mt-1 h-4 w-4 flex-none text-white" />
                Owner control for FAQs, tone, and recommendations
              </div>
              <div className="flex items-start gap-3">
                <Check className="mt-1 h-4 w-4 flex-none text-white" />
                Cancel anytime after activation
              </div>
            </div>
            <Link
              href="/auth/login?plan=monthly"
              className="glass-button-amber mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold text-amber-50 transition hover:bg-amber-300/24"
            >
              Start Monthly
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              duration: 0.7,
              delay: 0.08,
              ease: smoothEase,
            }}
            className="rounded-[2rem] border border-amber-200/18 bg-[linear-gradient(180deg,rgba(255,214,122,0.13),rgba(0,0,0,0.18))] p-5 backdrop-blur-sm sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.32em] text-amber-100/72">
                  Annual
                </p>
                <div className="mt-4 flex items-end gap-3">
                  <h3 className="text-4xl font-semibold tracking-[-0.05em] text-white">
                    &euro;470
                  </h3>
                  <span className="pb-1 text-white/62">/ year</span>
                </div>
              </div>
              <span className="inline-flex min-h-11 items-center rounded-full border border-amber-200/18 bg-amber-200/12 px-4 py-3 text-sm font-medium text-amber-50">
                Save &euro;118
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-white/78 sm:text-base">
              Two months free, with the same activation at launch. Ideal when
              you already know the concierge should stay part of the dining
              experience year-round.
            </p>
            <div className="mt-6 space-y-3 text-sm text-white/78">
              <div className="flex items-start gap-3">
                <Check className="mt-1 h-4 w-4 flex-none text-amber-50" />
                &euro;470 per year, billed once
              </div>
              <div className="flex items-start gap-3">
                <Check className="mt-1 h-4 w-4 flex-none text-amber-50" />
                Two months free versus paying monthly
              </div>
              <div className="flex items-start gap-3">
                <Check className="mt-1 h-4 w-4 flex-none text-amber-50" />
                Clear activation plus predictable subscription
              </div>
            </div>
            <Link
              href="/auth/login?plan=annual"
              className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-amber-200/18 bg-amber-200/12 px-6 py-4 text-sm font-semibold text-amber-50 transition hover:bg-amber-200/18"
            >
              Start Annual
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.article>
        </div>
      </SectionShell>

      <SectionShell overlayClass="bg-[linear-gradient(180deg,rgba(32,17,21,0.76),rgba(10,9,12,0.94))]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={fadeUp}
          className="max-w-3xl"
        >
          <p className="text-[11px] uppercase tracking-[0.34em] text-white/65">
            Pilot Program
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
            Gustia is opening its first owner pilots now.
          </h2>
          <p className="mt-5 text-base leading-8 text-white/74 sm:text-lg">
            We are not publishing made-up testimonials. Early partner venues
            will shape the first public case studies once live service data is
            available.
          </p>
        </motion.div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {[
            {
              title: 'First-wave onboarding',
              body: 'Pilot partners get the fastest path to live menu import, concierge tuning, and QR deployment.',
            },
            {
              title: 'Operational feedback loop',
              body: 'Every pilot helps refine recommendations, guest onboarding, and the owner dashboard before broader rollout.',
            },
            {
              title: 'Honest launch posture',
              body: 'Proof points will be published only after real restaurants report measurable results from live service.',
            },
          ].map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: 0.65,
                delay: index * 0.08,
                ease: smoothEase,
              }}
              className="glass-panel-soft rounded-[1.8rem] p-5"
            >
              <p className="text-lg font-semibold text-white">{item.title}</p>
              <p className="mt-4 text-base leading-8 text-white/78">
                {item.body}
              </p>
            </motion.article>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        id="start"
        overlayClass="bg-[linear-gradient(180deg,rgba(70,40,119,0.72),rgba(18,11,28,0.94))]"
      >
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeUp}
            className="max-w-3xl"
          >
            <p className="text-[11px] uppercase tracking-[0.34em] text-white/65">
              Start
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
              Launch Gustia with a clean activation and no long contract.
            </h2>
            <p className="mt-5 text-base leading-8 text-white/76 sm:text-lg">
              Pick monthly or annual, create your owner account, and continue
              into Stripe with the right email and plan already selected.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="glass-panel-soft rounded-[1.5rem] px-4 py-4">
                <div className="flex items-center gap-3 text-white">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Activation: &euro;99
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-white/70">
                  Everything you need to go live, with a 14-day guarantee.
                </p>
              </div>
              <div className="glass-panel-soft rounded-[1.5rem] px-4 py-4">
                <div className="flex items-center gap-3 text-white">
                  <PhoneCall className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Then &euro;49/month or &euro;470/year
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-white/70">
                  Clear pricing, cancel-anytime monthly, or annual savings.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.75, ease: smoothEase }}
            className="flex w-full max-w-sm flex-col gap-3"
          >
            <Link
              href="/auth/login?plan=monthly"
              className="glass-button inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/12"
            >
              Start Monthly
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth/login?plan=annual"
              className="glass-button inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold text-white/82 transition hover:bg-white/12"
            >
              Start Annual
            </Link>
          </motion.div>
        </div>
      </SectionShell>

      <footer className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-8 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div>
            <p className="text-sm font-medium text-white">Gustia</p>
            <p className="mt-1 text-sm text-white/58">
              A premium AI concierge for restaurant owners.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-white/72">
            <Link
              href="/privacy"
              className="inline-flex min-h-11 items-center rounded-full border border-white/10 px-4 py-3 transition hover:bg-white/10"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="inline-flex min-h-11 items-center rounded-full border border-white/10 px-4 py-3 transition hover:bg-white/10"
            >
              Terms
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center rounded-full border border-white/10 px-4 py-3 transition hover:bg-white/10"
            >
              Contact
            </Link>
            <span className="inline-flex min-h-11 items-center rounded-full border border-white/10 px-4 py-3 text-white/52">
              Pilot updates shared privately with partner venues
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
