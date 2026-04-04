'use client'

import { createContext, useContext, type PropsWithChildren } from 'react'
import { ToastContainer } from '@/components/ui/Toast'
import { useToast } from '@/lib/hooks/useToast'

type ToastContextValue = ReturnType<typeof useToast>

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: PropsWithChildren) {
  const toast = useToast()

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </ToastContext.Provider>
  )
}

export function useAppToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useAppToast must be used within a ToastProvider')
  }

  return context
}
