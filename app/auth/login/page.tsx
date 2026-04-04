import { redirect } from 'next/navigation'
import { PricingAuthForm } from '@/components/auth/PricingAuthForm'
import {
  ACTIVATION_FEE_AMOUNT,
  BILLING_DELAY_DAYS,
  formatEuroAmount,
  getCheckoutPlan,
} from '@/lib/billing/plans'
import { getSupabaseServerComponentClient } from '@/lib/supabase/server'

interface PricingLoginPageProps {
  searchParams?: Promise<{
    canceled?: string
    error?: string
    plan?: string
  }>
}

export default async function PricingLoginPage({
  searchParams,
}: PricingLoginPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const plan =
    getCheckoutPlan(resolvedSearchParams?.plan) || getCheckoutPlan('monthly')

  if (!plan) {
    redirect('/#start')
  }

  const client = await getSupabaseServerComponentClient()
  const {
    data: { user },
  } = client ? await client.auth.getUser() : { data: { user: null } }

  if (user?.email) {
    redirect(`/auth/checkout?plan=${plan.id}`)
  }

  const noticeMessage =
    resolvedSearchParams?.canceled === 'true'
      ? 'Checkout was canceled. Your account is still ready whenever you want to continue.'
      : null
  const errorMessage =
    typeof resolvedSearchParams?.error === 'string'
      ? resolvedSearchParams.error
      : null

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[0.94fr_1.06fr]">
        <div className="glass-panel rounded-[36px] p-8 text-white">
          <p className="text-[11px] uppercase tracking-[0.34em] text-amber-200/70">
            Pricing checkout
          </p>
          <h1 className="mt-4 text-4xl font-semibold">
            You&apos;re purchasing the {plan.name} plan.
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/72">
            Sign in first so Stripe Checkout is tied to the right restaurant
            owner account from the start.
          </p>

          <div className="glass-panel-soft mt-8 rounded-[28px] p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">
              Price summary before Stripe
            </p>
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-white/72">Activation fee</span>
                <span className="font-medium text-white">
                  {formatEuroAmount(ACTIVATION_FEE_AMOUNT)} today
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-white/72">{plan.name} subscription</span>
                <span className="font-medium text-white">
                  {formatEuroAmount(plan.recurringAmount)}
                  {plan.interval === 'month' ? ' / month' : ' / year'}
                </span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-white/72">Due today</span>
                <span className="font-semibold text-white">
                  {formatEuroAmount(ACTIVATION_FEE_AMOUNT)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 text-sm text-white/72 sm:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              Stripe will be pre-filled with the email from your authenticated
              owner account.
            </div>
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              The {plan.name.toLowerCase()} subscription begins after the{' '}
              {BILLING_DELAY_DAYS}-day activation period.
            </div>
          </div>

          {plan.savingsLabel ? (
            <div className="mt-6 inline-flex rounded-full border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100">
              {plan.savingsLabel}
            </div>
          ) : null}
        </div>

        <div className="glass-panel rounded-[36px] p-8 text-white">
          <PricingAuthForm
            plan={plan.id}
            errorMessage={errorMessage}
            noticeMessage={noticeMessage}
          />
        </div>
      </div>
    </div>
  )
}
