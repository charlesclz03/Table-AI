import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { AdminPageShell } from '@/components/admin/AdminPageShell'
import { buttonVariants } from '@/components/atoms/Button'

export default function BillingSuccessPage() {
  return (
    <AdminPageShell
      eyebrow="Billing"
      title="Payment received! Welcome to TableIA."
      description="Your founding setup payment is in. We can now move into onboarding, customization, and launch."
    >
      <section className="rounded-[28px] border border-emerald-400/20 bg-emerald-500/10 p-6 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-emerald-400/15 p-3 text-emerald-200">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-white">
                Payment received! Welcome to TableIA.
              </p>
              <p className="max-w-2xl text-sm leading-7 text-white/70">
                Your restaurant is ready for the next onboarding steps. Head
                back to billing if you want to review your plan status.
              </p>
            </div>
          </div>
          <Link
            href="/admin/billing"
            className={buttonVariants({ variant: 'brand' })}
          >
            Back to billing
          </Link>
        </div>
      </section>
    </AdminPageShell>
  )
}
