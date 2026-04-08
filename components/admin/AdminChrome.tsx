'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  ClipboardList,
  Gift,
  Link2,
  LayoutDashboard,
  MapPinned,
  MenuSquare,
  QrCode,
  Receipt,
  Sparkles,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AdminSignOutButton } from '@/components/admin/AdminSignOutButton'

const navigation = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/analytics',
    label: 'Analytics',
    icon: BarChart3,
  },
  {
    href: '/admin/onboarding',
    label: 'Training',
    icon: MapPinned,
  },
  {
    href: '/admin/menu',
    label: 'Menu',
    icon: MenuSquare,
  },
  {
    href: '/admin/referral',
    label: 'Referral',
    icon: Gift,
  },
  {
    href: '/admin/leads',
    label: 'Leads',
    icon: Users,
  },
  {
    href: '/admin/waitlist',
    label: 'Waitlist',
    icon: ClipboardList,
  },
  {
    href: '/admin/invite',
    label: 'Invites',
    icon: Link2,
  },
  {
    href: '/admin/quiz',
    label: 'Quiz',
    icon: Sparkles,
  },
  {
    href: '/admin/qr',
    label: 'QR',
    icon: QrCode,
  },
  {
    href: '/admin/billing',
    label: 'Billing',
    icon: Receipt,
  },
  {
    href: '/admin/changelog',
    label: 'Changelog',
    icon: ClipboardList,
  },
] satisfies ReadonlyArray<{
  href: string
  label: string
  icon: typeof LayoutDashboard
}>

interface AdminChromeProps {
  children: React.ReactNode
  latestChangelogVersion?: string
}

export function AdminChrome({
  children,
  latestChangelogVersion,
}: AdminChromeProps) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'

  function isActiveRoute(href: string) {
    if (href === '/admin') {
      return pathname === '/admin' || pathname === '/admin/dashboard'
    }

    return pathname === href || pathname.startsWith(`${href}/`)
  }

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-8 rounded-[30px] border border-white/10 bg-white/6 px-5 py-5 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.34em] text-amber-200/70">
              Gustia Owner Console
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white">
              Run your restaurant concierge
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const showBadge =
                item.href === '/admin/changelog' && latestChangelogVersion

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition',
                    isActiveRoute(item.href)
                      ? 'border-amber-300/40 bg-amber-300/15 text-amber-100'
                      : 'border-white/10 bg-black/20 text-white/70 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {showBadge ? (
                    <span className="rounded-full border border-violet-300/25 bg-violet-300/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-violet-100">
                      v{latestChangelogVersion}
                    </span>
                  ) : null}
                </Link>
              )
            })}
            <AdminSignOutButton />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  )
}
