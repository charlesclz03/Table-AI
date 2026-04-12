'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Check,
  Globe2,
  Languages,
  MapPin,
  PhoneCall,
  QrCode,
  ShieldCheck,
  Sparkles,
  Wine,
} from 'lucide-react'

const smoothEase = [0.32, 0.72, 0, 1] as const

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const cardReveal = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: smoothEase },
  },
}

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
    icon: ShieldCheck,
  },
  {
    title: 'Great service should still feel personal',
    description:
      'Owners need help that protects premium hospitality instead of replacing the human tone of the dining room.',
    icon: Languages,
  },
] as const

const ownerSteps = [
  {
    id: 'step-1',
    step: '01',
    kicker: 'Connect Your Menu',
    summary:
      'Upload your menu and let AI learn the dishes, wines, and prices in minutes.',
    detail:
      'Start with a menu photo or PDF. Gustia turns that into a working restaurant knowledge base without making you type every line by hand.',
    bullets: [
      'Upload your restaurant menu from photo or PDF',
      'AI extracts dishes, wines, prices, and key details',
      'Review the result before going live',
    ],
    label: 'Setup begins here',
    imageUrl:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    imageNote: 'A menu capture becomes a searchable concierge brain.',
  },
  {
    id: 'step-2',
    step: '02',
    kicker: 'Customize Your Concierge',
    summary:
      'Set the personality, FAQs, and recommendations that match your house style.',
    detail:
      'Choose how the AI speaks, what it emphasizes, and how it handles the questions your staff hears every night.',
    bullets: [
      "Choose the AI's personality and wine-forward tone",
      'Add FAQs, service notes, and recommendation rules',
      'Preview the guest experience before launch',
    ],
    label: 'Tune the voice of the room',
    imageUrl:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    imageNote:
      'Owners decide how premium, playful, or wine-led the concierge feels.',
  },
  {
    id: 'step-3',
    step: '03',
    kicker: 'Print Your QR Codes',
    summary:
      'Generate table-ready QR posters that look elegant in the dining room.',
    detail:
      'Download polished QR assets for each table, print them, and place them exactly where guests naturally reach for answers.',
    bullets: [
      'Generate table-specific QR codes in one place',
      'Download, print, and place polished displays',
      'Keep the paper menu while adding a smarter layer',
    ],
    label: 'Operationally simple',
    imageUrl:
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80',
    imageNote:
      'A discreet QR display invites questions without disrupting the table.',
  },
  {
    id: 'step-4',
    step: '04',
    kicker: 'Guests Enjoy',
    summary:
      'Guests scan, chat, and order while your team focuses on the human side of service.',
    detail:
      'When the concierge handles routine questions, staff can stay attentive to the room, deliver faster, and spend more energy on hospitality.',
    bullets: [
      'Guests scan, ask naturally, and chat in their language',
      'The concierge recommends dishes, wines, and pairings',
      'Staff stays free to welcome, serve, and upsell in person',
    ],
    label: 'The service payoff',
    imageUrl:
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80',
    imageNote:
      'The table gets answers quickly, while the room still feels fully hosted.',
  },
] as const

const guestJourney = [
  {
    kicker: 'QR',
    description: 'Guest scans the table QR code',
    icon: QrCode,
  },
  {
    kicker: 'Language',
    description: 'Chooses their language — up to 12 supported',
    icon: Languages,
  },
  {
    kicker: 'Theme',
    description: 'Picks a concierge vibe: curious, formal, or wine-led',
    icon: Wine,
  },
  {
    kicker: 'Chat',
    description: 'Asks anything — the AI answers from your menu',
    icon: Sparkles,
  },
] as const

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#F7F5F0]">
      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      {/* ─── HERO — Split Screen: text LEFT, image RIGHT ─── */}
      <section className="relative min-h-[100dvh] overflow-hidden">
        {/* Ambient warm radial */}
        <div
          className="absolute -left-32 top-0 size-[40rem] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(180,120,40,0.10) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto grid min-h-[100dvh] max-w-7xl grid-cols-1 gap-0 px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
          {/* LEFT — text content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col justify-center py-24 lg:py-8"
          >
            <motion.div variants={cardReveal}>
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/50 bg-amber-50/80 px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] text-amber-800">
                <MapPin className="h-3 w-3" />
                For restaurant owners — Lisbon & beyond
              </span>
            </motion.div>

            <motion.h1
              variants={cardReveal}
              className="mt-8 max-w-xl text-5xl font-semibold tracking-[-0.04em] leading-[1.05] text-[#1C1917] lg:text-6xl"
            >
              Your restaurant&apos;s
              <br />
              <em className="not-italic text-[#B45309]">AI concierge</em>
            </motion.h1>

            <motion.p
              variants={cardReveal}
              className="mt-6 max-w-md text-lg leading-[1.7] text-[#78716C]"
            >
              Gustia gives restaurant owners a vertical setup flow: connect the
              menu, shape the concierge, print the QR, and let guests get fast
              answers — without breaking the premium feel of service.
            </motion.p>

            <motion.div
              variants={cardReveal}
              className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Link
                href="#pricing"
                className="group inline-flex items-center justify-center gap-2.5 rounded-sm bg-[#1C1917] px-7 py-4 text-sm font-medium text-white transition-all duration-300 hover:bg-[#292524] active:scale-[0.98]"
              >
                See pricing
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-[#E7E5E4] bg-white/60 px-7 py-4 text-sm font-medium text-[#44403C] transition-all duration-300 hover:bg-white active:scale-[0.98]"
              >
                See how it works
              </Link>
            </motion.div>

            <motion.div
              variants={cardReveal}
              className="mt-12 grid max-w-sm grid-cols-2 gap-3"
            >
              {[
                'Answers tourist questions instantly',
                'Keeps your team focused on service',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2.5 rounded-sm border border-[#E7E5E4] bg-white/70 p-4"
                >
                  <Check className="mt-0.5 h-4 w-4 flex-none text-[#B45309]" />
                  <p className="text-xs leading-snug text-[#57534E]">{item}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT — hero image with warm overlay */}
          <motion.div
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: smoothEase, delay: 0.05 }}
            className="relative min-h-[50dvh] lg:min-h-[100dvh]"
          >
            {/* Warm overlay tint */}
            <div
              className="absolute inset-0 z-10"
              style={{
                background:
                  'linear-gradient(to right, rgba(247,245,240,0.35) 0%, rgba(247,245,240,0.08) 40%, transparent 70%)',
              }}
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 z-20"
              style={{
                background:
                  'linear-gradient(180deg, rgba(180,120,40,0.08) 0%, transparent 50%, rgba(180,120,40,0.12) 100%)',
              }}
              aria-hidden="true"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero-restaurant.jpg"
              alt="Elegant restaurant interior with warm lighting"
              className="absolute inset-0 h-full w-full object-cover"
            />

            {/* Floating stat card — bottom right */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                ease: smoothEase,
                delay: 0.6,
              }}
              className="absolute bottom-10 right-6 left-6 z-30 rounded-sm border border-[#E7E5E4]/60 bg-white/85 backdrop-blur-md p-5 shadow-[0_8px_32px_rgba(0,0,0,0.08)] lg:left-auto lg:w-64"
            >
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#A8A29E]">
                Activation
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#1C1917]">
                €99
              </p>
              <p className="mt-1 text-xs text-[#78716C]">
                + €49/month. Cancel anytime.
              </p>
              <div className="mt-4 h-px bg-[#E7E5E4]" />
              <p className="mt-3 text-xs leading-snug text-[#57534E]">
                14-day guarantee. No long contracts.
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll chevron */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 z-30 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E7E5E4] bg-white/70 backdrop-blur-sm">
              <ArrowRight className="h-4 w-4 rotate-90 text-[#78716C]" />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── PROBLEM SECTION — Bento Grid ─── */}
      <section id="problem" className="relative border-t border-[#E7E5E4]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="grid gap-16 lg:grid-cols-[1fr_1.4fr]">
            {/* Left — label + heading */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
            >
              <motion.p
                variants={cardReveal}
                className="text-[11px] uppercase tracking-[0.22em] text-[#A8A29E]"
              >
                Why restaurants need this
              </motion.p>
              <motion.h2
                variants={cardReveal}
                className="mt-5 text-4xl font-semibold tracking-[-0.04em] leading-[1.1] text-[#1C1917] lg:text-5xl"
              >
                The room feels busy long before the kitchen does.
              </motion.h2>
              <motion.p
                variants={cardReveal}
                className="mt-6 max-w-sm text-base leading-[1.75] text-[#78716C]"
              >
                Gustia exists for the questions that arrive between the menu and
                the order: what pairs with sea bass, which wine is fuller, and
                whether the dish is gluten free.
              </motion.p>
            </motion.div>

            {/* Right — problem cards */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={staggerContainer}
              className="grid gap-3"
            >
              {problemPoints.map((point) => {
                const Icon = point.icon
                return (
                  <motion.article
                    key={point.title}
                    variants={cardReveal}
                    className="group rounded-sm border border-[#E7E5E4] bg-white/80 p-6 transition-all duration-300 hover:border-[#D6D3D1] hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
                  >
                    <div className="flex items-start gap-5">
                      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-[#E7E5E4] bg-[#F7F5F0] text-[#B45309] transition-colors duration-300 group-hover:bg-[#FEF3C7]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-base font-semibold tracking-tight text-[#1C1917]">
                          {point.title}
                        </h3>
                        <p className="mt-2 text-sm leading-[1.7] text-[#78716C]">
                          {point.description}
                        </p>
                      </div>
                    </div>
                  </motion.article>
                )
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS — 4 steps, asymmetric bento ─── */}
      <section
        id="how-it-works"
        className="relative border-t border-[#E7E5E4] bg-[#F0EDE8]"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          {/* Section header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="mb-16 max-w-2xl"
          >
            <motion.p
              variants={cardReveal}
              className="text-[11px] uppercase tracking-[0.22em] text-[#A8A29E]"
            >
              Owner setup
            </motion.p>
            <motion.h2
              variants={cardReveal}
              className="mt-4 text-4xl font-semibold tracking-[-0.04em] leading-[1.1] text-[#1C1917] lg:text-5xl"
            >
              Four moves to go live.
            </motion.h2>
          </motion.div>

          {/* Bento grid — 2 col on lg */}
          <div className="grid gap-5 lg:grid-cols-2">
            {ownerSteps.map((step, index) => (
              <StepCard key={step.id} step={step} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── GUEST PREVIEW ─── */}
      <section className="relative border-t border-[#E7E5E4]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            {/* Left — text */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
            >
              <motion.p
                variants={cardReveal}
                className="text-[11px] uppercase tracking-[0.22em] text-[#A8A29E]"
              >
                Guest experience
              </motion.p>
              <motion.h2
                variants={cardReveal}
                className="mt-4 max-w-lg text-4xl font-semibold tracking-[-0.04em] leading-[1.1] text-[#1C1917] lg:text-5xl"
              >
                QR to concierge in under 30 seconds.
              </motion.h2>
              <motion.p
                variants={cardReveal}
                className="mt-6 max-w-md text-base leading-[1.75] text-[#78716C]"
              >
                The journey is simple: QR, language, theme, then a warm AI chat
                that recommends dishes and wine in the guest&apos;s language —
                while your team stays free to serve.
              </motion.p>

              <motion.div variants={cardReveal} className="mt-10 space-y-3">
                {[
                  'Guests scan and start chatting immediately',
                  'Supports up to 12 languages',
                  'Recommendations drawn directly from your menu',
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-sm border border-[#E7E5E4] bg-white/70 px-5 py-4"
                  >
                    <Check className="h-4 w-4 flex-none text-[#B45309]" />
                    <p className="text-sm text-[#57534E]">{item}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — phone mockup bento */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, ease: smoothEase }}
              className="relative"
            >
              {/* Main device frame */}
              <div className="relative mx-auto max-w-[18rem]">
                {/* Floating label */}
                <div className="absolute -left-8 -top-6 z-10 rounded-sm border border-[#E7E5E4] bg-white/90 px-4 py-2 shadow-sm backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#A8A29E]">
                    Guest screen
                  </p>
                </div>

                {/* Phone frame */}
                <div className="rounded-[2rem] border border-[#D6D3D1] bg-[#1C1917] p-2 shadow-[0_24px_60px_rgba(0,0,0,0.15)]">
                  <div className="rounded-[1.6rem] bg-[#F7F5F0] overflow-hidden">
                    {/* Phone notch */}
                    <div className="flex justify-center py-3">
                      <div className="h-6 w-20 rounded-full bg-[#1C1917]" />
                    </div>

                    {/* App content */}
                    <div className="px-5 pb-6">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-[#A8A29E]">
                        Guest onboarding
                      </p>
                      <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#1C1917]">
                        Good evening.
                      </p>
                      <p className="mt-1 text-sm text-[#78716C]">
                        Ask about the menu, wines, or pairings.
                      </p>

                      <div className="mt-6 space-y-2">
                        {guestJourney.map((item, i) => {
                          const Icon = item.icon
                          return (
                            <motion.div
                              key={item.kicker}
                              initial={{ opacity: 0, x: 12 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{
                                duration: 0.5,
                                delay: 0.4 + i * 0.08,
                                ease: smoothEase,
                              }}
                              className="flex items-center gap-3 rounded-sm border border-[#E7E5E4] bg-white/80 px-4 py-3"
                            >
                              <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#FEF3C7] text-[#B45309]">
                                <Icon className="h-4 w-4" />
                              </span>
                              <div>
                                <p className="text-xs font-semibold text-[#1C1917]">
                                  {item.kicker}
                                </p>
                                <p className="text-[11px] leading-snug text-[#A8A29E]">
                                  {item.description}
                                </p>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>

                      {/* Chat bubble preview */}
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.5,
                          delay: 0.75,
                          ease: smoothEase,
                        }}
                        className="mt-4 rounded-sm border border-[#E7E5E4] bg-white px-4 py-3"
                      >
                        <p className="text-xs italic text-[#57534E]">
                          &ldquo;Looking for something elegant with seafood
                          tonight — can you suggest a wine?&rdquo;
                        </p>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section
        id="pricing"
        className="relative border-t border-[#E7E5E4] bg-[#1C1917]"
      >
        {/* Warm ambient glow */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(180,120,40,0.18) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          {/* Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="mb-16 max-w-2xl"
          >
            <motion.p
              variants={cardReveal}
              className="text-[11px] uppercase tracking-[0.22em] text-[#A8A29E]"
            >
              Pricing
            </motion.p>
            <motion.h2
              variants={cardReveal}
              className="mt-4 text-4xl font-semibold tracking-[-0.04em] leading-[1.1] text-white lg:text-5xl"
            >
              One activation.
              <br />
              Then a clear subscription.
            </motion.h2>
            <motion.p
              variants={cardReveal}
              className="mt-6 max-w-md text-base leading-[1.75] text-[#A8A29E]"
            >
              Keep the language simple and owner-friendly: activation to go
              live, then a subscription that stays easy to understand.
            </motion.p>
          </motion.div>

          {/* Bento pricing grid */}
          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr]">
            {/* Activation */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: smoothEase }}
              className="rounded-sm border border-white/10 bg-white/5 p-6 backdrop-blur-sm lg:row-span-2"
            >
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#A8A29E]">
                Activation
              </p>
              <p className="mt-4 text-5xl font-semibold tracking-[-0.04em] text-white">
                €99
              </p>
              <p className="mt-4 max-w-xs text-sm leading-[1.7] text-[#A8A29E]">
                Everything you need to go live: menu setup, concierge
                configuration, launch guidance, and a 14-day guarantee.
              </p>

              <div className="mt-6 h-px bg-white/10" />

              <div className="mt-6 space-y-3">
                {[
                  'Menu upload from photo or PDF',
                  'AI knowledge base generation',
                  'Concierge personality tuning',
                  'QR code assets for every table',
                  '14-day money-back guarantee',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 flex-none text-[#B45309]" />
                    <p className="text-sm text-[#D6D3D1]">{item}</p>
                  </div>
                ))}
              </div>

              <Link
                href="/auth/login?plan=activation"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-white px-6 py-4 text-sm font-semibold text-[#1C1917] transition-all duration-300 hover:bg-[#F7F5F0] active:scale-[0.98]"
              >
                Start activation
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>

            {/* Monthly */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.08, ease: smoothEase }}
              className="rounded-sm border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
            >
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#A8A29E]">
                Monthly
              </p>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-[-0.04em] text-white">
                  €49
                </span>
                <span className="text-[#A8A29E]">/ month</span>
              </div>
              <p className="mt-4 text-sm leading-[1.7] text-[#A8A29E]">
                Cancel anytime. Best for single-venue operators who want the
                simplest path to launch and learn.
              </p>

              <Link
                href="/auth/login?plan=monthly"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-sm border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-medium text-white transition-all duration-300 hover:bg-white/20 active:scale-[0.98]"
              >
                Start monthly
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>

            {/* Annual */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.16, ease: smoothEase }}
              className="rounded-sm border border-amber-200/20 bg-amber-200/8 p-6"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] uppercase tracking-[0.22em] text-amber-200/80">
                  Annual
                </p>
                <span className="rounded-sm bg-amber-200/15 px-2 py-0.5 text-[10px] font-medium text-amber-200">
                  Save €118
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-[-0.04em] text-white">
                  €470
                </span>
                <span className="text-[#A8A29E]">/ year</span>
              </div>
              <p className="mt-4 text-sm leading-[1.7] text-[#A8A29E]">
                Two months free versus monthly. Predictable annual billing.
                Ideal for venues that want the concierge to stay.
              </p>

              <Link
                href="/auth/login?plan=annual"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-amber-200 px-6 py-3.5 text-sm font-semibold text-[#1C1917] transition-all duration-300 hover:bg-amber-100 active:scale-[0.98]"
              >
                Start annual
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── CTA BAND ─── */}
      <section
        id="start"
        className="relative border-t border-[#E7E5E4] bg-[#F0EDE8]"
      >
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={staggerContainer}
            >
              <motion.p
                variants={cardReveal}
                className="text-[11px] uppercase tracking-[0.22em] text-[#A8A29E]"
              >
                Pilot program
              </motion.p>
              <motion.h2
                variants={cardReveal}
                className="mt-4 max-w-xl text-4xl font-semibold tracking-[-0.04em] leading-[1.1] text-[#1C1917] lg:text-5xl"
              >
                Gustia is opening its first owner pilots now.
              </motion.h2>
              <motion.p
                variants={cardReveal}
                className="mt-6 max-w-md text-base leading-[1.75] text-[#78716C]"
              >
                We are not publishing made-up testimonials. Early partner venues
                will shape the first public case studies once live service data
                is available.
              </motion.p>

              <motion.div
                variants={cardReveal}
                className="mt-8 grid max-w-sm grid-cols-2 gap-3"
              >
                <div className="rounded-sm border border-[#E7E5E4] bg-white/70 p-4">
                  <PhoneCall className="h-4 w-4 text-[#B45309]" />
                  <p className="mt-3 text-sm font-medium text-[#1C1917]">
                    Fast onboarding
                  </p>
                  <p className="mt-1 text-xs leading-snug text-[#78716C]">
                    Menu live in under 48 hours
                  </p>
                </div>
                <div className="rounded-sm border border-[#E7E5E4] bg-white/70 p-4">
                  <ShieldCheck className="h-4 w-4 text-[#B45309]" />
                  <p className="mt-3 text-sm font-medium text-[#1C1917]">
                    14-day guarantee
                  </p>
                  <p className="mt-1 text-xs leading-snug text-[#78716C]">
                    Cancel if it doesn&apos;t work
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right — CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: smoothEase }}
              className="flex flex-col gap-3 sm:items-start lg:items-end"
            >
              <Link
                href="/auth/login?plan=monthly"
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#1C1917] px-8 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#292524] active:scale-[0.98]"
              >
                Start monthly — €49
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auth/login?plan=annual"
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-[#E7E5E4] bg-white/70 px-8 py-4 text-sm font-medium text-[#44403C] transition-all duration-300 hover:bg-white active:scale-[0.98]"
              >
                Annual — €470 (two months free)
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

function StepCard({
  step,
  index,
}: {
  step: (typeof ownerSteps)[number]
  index: number
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.7,
        delay: index * 0.07,
        ease: smoothEase,
      }}
      className="group grid gap-0 rounded-sm border border-[#E7E5E4] bg-white/80 overflow-hidden transition-all duration-300 hover:border-[#D6D3D1] hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[16/9]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={step.imageUrl}
          alt={step.imageNote}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(180,120,40,0.1) 0%, transparent 50%, rgba(180,120,40,0.08) 100%)',
          }}
          aria-hidden="true"
        />
        {/* Step label */}
        <div className="absolute left-4 top-4">
          <span className="rounded-sm bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1C1917] backdrop-blur-sm">
            {step.step}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 p-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#A8A29E]">
            {step.label}
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-[#1C1917]">
            {step.kicker}
          </h3>
          <p className="mt-2 text-sm leading-[1.7] text-[#78716C]">
            {step.summary}
          </p>
        </div>

        <div className="h-px bg-[#E7E5E4]" />

        <p className="text-xs leading-[1.7] text-[#78716C]">{step.detail}</p>

        <ul className="space-y-2">
          {step.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2.5">
              <Check className="mt-0.5 h-3.5 w-3.5 flex-none text-[#B45309]" />
              <span className="text-xs text-[#57534E]">{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  )
}
