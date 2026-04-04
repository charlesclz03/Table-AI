import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AdminPageShellProps {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
  children: ReactNode
}

export function AdminPageShell({
  eyebrow,
  title,
  description,
  actions,
  children,
}: AdminPageShellProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-white/6 px-6 py-6 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.34em] text-amber-200/70">
              {eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-white/70">
              {description}
            </p>
          </div>
          {actions ? <div className={cn('shrink-0')}>{actions}</div> : null}
        </div>
      </section>
      {children}
    </div>
  )
}
