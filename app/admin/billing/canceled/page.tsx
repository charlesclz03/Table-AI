import Link from 'next/link'
import { CircleSlash2 } from 'lucide-react'
import { AdminPageShell } from '@/components/admin/AdminPageShell'
import { buttonVariants } from '@/components/atoms/Button'

export default function BillingCanceledPage() {
  return (
    <AdminPageShell
      eyebrow="Billing"
      title="Payment canceled. Ready when you are."
      description="Nothing was charged. You can return to the billing page any time and restart the setup flow."
    >
      <section className="rounded-[28px] border border-white/10 bg-white/6 p-6 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-white/10 p-3 text-amber-200">
              <CircleSlash2 className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-white">
                Payment canceled. Ready when you are.
              </p>
              <p className="max-w-2xl text-sm leading-7 text-white/70">
                When you want to continue, head back to billing and start the
                checkout flow again.
              </p>
            </div>
          </div>
          <Link
            href="/admin/billing"
            className={buttonVariants({ variant: 'outline' })}
          >
            Back to billing
          </Link>
        </div>
      </section>
    </AdminPageShell>
  )
}
