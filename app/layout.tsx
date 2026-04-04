import type { Metadata } from 'next'
import Link from 'next/link'
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import { Providers } from '@/app/providers'
import { getPublicEnv } from '@/lib/env'
import './globals.css'

const sans = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

const publicEnv = getPublicEnv()

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.siteUrl),
  title: {
    default: 'TableIA',
    template: '%s | TableIA',
  },
  description: 'AI Concierge for Restaurants',
}

const navigation = [
  { href: '/', label: 'Home' },
  { href: '/chat/demo', label: 'Demo Chat' },
  { href: '/admin', label: 'Owner Dashboard' },
]

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sans.variable} ${mono.variable} bg-surface-base font-sans text-text-primary antialiased`}
      >
        <Providers>
          <div className="relative min-h-screen overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-gradient-aurora opacity-20 blur-3xl" />
            <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
              <header className="mb-10 flex flex-col gap-6 rounded-full border border-stroke-soft bg-surface-elevated/60 px-6 py-4 backdrop-blur-medium md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-text-secondary">
                    TableIA
                  </p>
                  <p className="mt-1 text-sm text-text-secondary">
                    AI Concierge for Restaurants
                  </p>
                </div>
                <nav className="flex items-center gap-3 text-sm text-text-secondary">
                  {navigation.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-full px-4 py-2 transition hover:bg-surface-base hover:text-text-primary"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </header>
              <main className="flex-1">{children}</main>
              <footer className="mt-10 border-t border-stroke-soft pt-6 text-sm text-text-secondary">
                Built for guest conversations, menu guidance, and owner control.
              </footer>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
