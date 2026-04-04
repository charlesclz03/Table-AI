import type { ReactNode } from 'react'
import { AdminChrome } from '@/components/admin/AdminChrome'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-hidden bg-[#05060a] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_26%),radial-gradient(circle_at_bottom,_rgba(124,58,237,0.18),_transparent_36%),linear-gradient(180deg,_#100c08_0%,_#05060a_55%,_#03040a_100%)]" />
      <div className="relative">
        <AdminChrome>{children}</AdminChrome>
      </div>
    </div>
  )
}
