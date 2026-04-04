'use client'

import type { ReactNode } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ToastProvider } from '@/lib/contexts/ToastContext'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <ToastProvider>{children}</ToastProvider>
    </ErrorBoundary>
  )
}
