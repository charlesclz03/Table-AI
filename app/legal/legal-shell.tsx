import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, Scale, ShieldCheck } from 'lucide-react'

type LegalPageShellProps = {
  eyebrow: string
  title: string
  summary: string
  updatedOn: string
  children: ReactNode
}

type LegalSectionProps = {
  title: string
  children: ReactNode
}

const legalLinks = [
  {
    href: '/privacy',
    label: 'Privacy Policy',
    icon: ShieldCheck,
  },
  {
    href: '/terms',
    label: 'Terms of Service',
    icon: Scale,
  },
  {
    href: 'mailto:support@tableia.com',
    label: 'support@tableia.com',
    icon: Mail,
  },
] as const

export function LegalPageShell({
  eyebrow,
  title,
  summary,
  updatedOn,
  children,
}: LegalPageShellProps) {
  return (
    <div className="relative isolate overflow-hidden rounded-[36px] border border-white/12 bg-[linear-gradient(160deg,rgba(255,255,255,0.1),rgba(255,255,255,0.03))] px-5 py-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:px-8 sm:py-8 lg:px-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-56 w-56 rounded-full bg-[#b85a2f]/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[#0ea5e9]/12 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 self-start rounded-full border border-white/12 bg-black/20 px-4 py-2 text-sm font-medium text-white/82 transition hover:border-white/20 hover:bg-black/30 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              {legalLinks.map((item) => {
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-medium text-white/70 transition hover:border-white/18 hover:bg-white/[0.08] hover:text-white"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-black/20 px-5 py-6 sm:px-7">
            <p className="text-[11px] uppercase tracking-[0.34em] text-amber-100/72">
              {eyebrow}
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72 sm:text-base">
              {summary}
            </p>
            <p className="mt-5 text-xs uppercase tracking-[0.28em] text-white/42">
              Last updated {updatedOn}
            </p>
          </div>
        </div>

        <div className="relative mt-6 space-y-4">{children}</div>
      </div>
    </div>
  )
}

export function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl sm:p-6">
      <h2 className="text-xl font-semibold text-white sm:text-2xl">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-7 text-white/72 sm:text-[15px]">
        {children}
      </div>
    </section>
  )
}
