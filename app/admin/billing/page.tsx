import { format } from 'date-fns'
import { AdminPageShell } from '@/components/admin/AdminPageShell'
import { BillingCheckoutButton } from '@/components/admin/BillingCheckoutButton'
import { BillingPortalButton } from '@/components/admin/BillingPortalButton'
import { EmptyRestaurantState } from '@/components/admin/EmptyRestaurantState'
import { RefundInvoiceButton } from '@/components/admin/RefundInvoiceButton'
import { getBillingOverview, requireAdminContext } from '@/lib/admin/server'

function formatDateLabel(value?: string | null) {
  if (!value) {
    return 'Not available'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Not available' : format(date, 'PPP')
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat('en-PT', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}

interface AdminBillingPageProps {
  searchParams?: Promise<{
    canceled?: string
    success?: string
  }>
}

export default async function AdminBillingPage({
  searchParams,
}: AdminBillingPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const { restaurant, userEmail } = await requireAdminContext()

  if (!restaurant) {
    return <EmptyRestaurantState email={userEmail} />
  }

  const billing = await getBillingOverview(restaurant)
  const hasSuccessState = resolvedSearchParams?.success === 'true'
  const hasCanceledState = resolvedSearchParams?.canceled === 'true'
  const showCheckoutCta = !['active', 'trialing'].includes(
    billing.subscriptionStatus
  )

  return (
    <AdminPageShell
      eyebrow="Subscription"
      title="Billing and subscription control"
      description="Review the current plan, billing timing, payment method, and the latest invoice history without leaving the owner dashboard."
      actions={
        <div className="flex flex-col gap-3">
          {showCheckoutCta ? (
            <BillingCheckoutButton
              restaurantId={restaurant.id}
              restaurantName={restaurant.name}
            />
          ) : null}
          <BillingPortalButton disabled={!billing.hasPortalAccess} />
        </div>
      }
    >
      {hasSuccessState ? (
        <section className="rounded-[28px] border border-emerald-400/20 bg-emerald-500/10 p-5 backdrop-blur">
          <p className="text-sm font-semibold text-white">
            Payment received! Welcome to Gustia.
          </p>
          <p className="mt-2 text-sm leading-7 text-white/70">
            Your founding setup payment is complete. We&apos;ll use the saved
            customer record for future billing and subscription management.
          </p>
        </section>
      ) : null}

      {hasCanceledState ? (
        <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-sm font-semibold text-white">
            Payment canceled. Ready when you are.
          </p>
          <p className="mt-2 text-sm leading-7 text-white/70">
            No problem. When you&apos;re ready, you can restart the Gustia setup
            from this page.
          </p>
        </section>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
            Current Plan
          </p>
          <p className="mt-4 text-3xl font-semibold text-white">
            {billing.planName}
          </p>
          <p className="mt-2 text-sm text-white/65">
            Status: {billing.subscriptionStatus}
          </p>
        </article>

        <article className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
            Setup Date
          </p>
          <p className="mt-4 text-2xl font-semibold text-white">
            {formatDateLabel(billing.setupDate)}
          </p>
          <p className="mt-2 text-sm text-white/65">
            When the restaurant was first activated.
          </p>
        </article>

        <article className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
            Next Billing Date
          </p>
          <p className="mt-4 text-2xl font-semibold text-white">
            {formatDateLabel(billing.nextBillingDate)}
          </p>
          <p className="mt-2 text-sm text-white/65">
            Payment method:{' '}
            {billing.paymentMethodLast4
              ? `**** ${billing.paymentMethodLast4}`
              : 'Not available'}
          </p>
        </article>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
        <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
          Invoice History
        </p>
        <div className="mt-4 space-y-3">
          {billing.invoices.length > 0 ? (
            billing.invoices.map((invoice) => (
              <article
                key={invoice.id}
                className="flex flex-col gap-3 rounded-[24px] border border-white/10 bg-black/20 p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    {formatMoney(invoice.amountPaid, invoice.currency)}
                  </p>
                  <p className="mt-1 text-sm text-white/60">
                    {format(new Date(invoice.created * 1000), 'PPP')}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/70">
                    {invoice.status}
                  </span>
                  {invoice.status.toLowerCase() === 'paid' ? (
                    <RefundInvoiceButton
                      refundTargetId={invoice.paymentIntentId || invoice.id}
                    />
                  ) : null}
                  {invoice.hostedInvoiceUrl ? (
                    <a
                      href={invoice.hostedInvoiceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
                    >
                      Open invoice
                    </a>
                  ) : null}
                </div>
              </article>
            ))
          ) : (
            <p className="rounded-[24px] border border-dashed border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/65">
              No Stripe invoices were found yet. If Stripe isn&apos;t configured
              for this owner, the page still shows plan status from the
              restaurant record.
            </p>
          )}
        </div>
      </section>
    </AdminPageShell>
  )
}
