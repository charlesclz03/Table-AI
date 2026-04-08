import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CheckoutRedirectPanel } from '@/components/auth/CheckoutRedirectPanel'
import {
  ACTIVATION_FEE_AMOUNT,
  BILLING_DELAY_DAYS,
  formatEuroAmount,
  getCheckoutPlan,
} from '@/lib/billing/plans'
import { REFERRAL_BONUS_DAYS } from '@/lib/referrals'
import { getSupabaseServerComponentClient } from '@/lib/supabase/server'

interface AuthCheckoutPageProps {
  searchParams?: Promise<{
    plan?: string
    ref?: string
  }>
}

export default async function AuthCheckoutPage({
  searchParams,
}: AuthCheckoutPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const plan =
    getCheckoutPlan(resolvedSearchParams?.plan) || getCheckoutPlan('monthly')
  const referralCode =
    typeof resolvedSearchParams?.ref === 'string'
      ? resolvedSearchParams.ref.trim().toUpperCase()
      : null

  if (!plan) {
    redirect('/#start')
  }

  const client = await getSupabaseServerComponentClient()
  const {
    data: { user },
  } = client ? await client.auth.getUser() : { data: { user: null } }

  if (!user?.email) {
    const referralQuery = referralCode
      ? `&ref=${encodeURIComponent(referralCode)}`
      : ''
    redirect(`/auth/login?plan=${plan.id}${referralQuery}`)
  }

  const subscriptionStartLabel = referralCode
    ? `After ${BILLING_DELAY_DAYS + REFERRAL_BONUS_DAYS} days`
    : `After ${BILLING_DELAY_DAYS} days`

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="glass-panel w-full rounded-[36px] p-8 text-white">
        <p className="text-[11px] uppercase tracking-[0.34em] text-amber-200/70">
          Continue to Stripe
        </p>
        <h1 className="mt-4 text-4xl font-semibold">
          Your {plan.name.toLowerCase()} checkout is almost ready.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72">
          You&apos;re signed in as {user.email}. Gustia is preparing Stripe with
          that email so your account and billing stay matched from day one.
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">
              Purchase summary
            </p>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/72">Activation fee today</span>
                <span className="font-medium text-white">
                  {formatEuroAmount(ACTIVATION_FEE_AMOUNT)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/72">{plan.name} plan later</span>
                <span className="font-medium text-white">
                  {formatEuroAmount(plan.recurringAmount)}
                  {plan.interval === 'month' ? ' / month' : ' / year'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/72">Subscription start</span>
                <span className="font-medium text-white">
                  {subscriptionStartLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">
              Need a different plan?
            </p>
            <p className="mt-4 text-sm leading-7 text-white/72">
              Go back and choose the billing option that fits how you want to
              launch Gustia.
            </p>
            <Link
              href={
                referralCode
                  ? `/auth/login?plan=${plan.id}&ref=${encodeURIComponent(referralCode)}`
                  : '/#start'
              }
              className="mt-5 inline-flex text-sm text-amber-100 transition hover:text-white"
            >
              {referralCode
                ? 'Return to referral sign-in'
                : 'Return to pricing'}
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <CheckoutRedirectPanel plan={plan.id} referralCode={referralCode} />
        </div>
      </div>
    </div>
  )
}
