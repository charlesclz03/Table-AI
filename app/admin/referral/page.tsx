import { formatDistanceToNow } from 'date-fns'
import { AdminPageShell } from '@/components/admin/AdminPageShell'
import { EmptyRestaurantState } from '@/components/admin/EmptyRestaurantState'
import { requireAdminContext } from '@/lib/admin/server'
import { getPublicEnv } from '@/lib/env'
import { getReferralOverview } from '@/lib/referrals'

function formatRelativeDate(value?: string | null) {
  if (!value) {
    return 'Just now'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Unknown time'
  }

  return formatDistanceToNow(date, {
    addSuffix: true,
  })
}

export default async function AdminReferralPage() {
  const { restaurant, userEmail } = await requireAdminContext()

  if (!restaurant) {
    return <EmptyRestaurantState email={userEmail} />
  }

  const referral = await getReferralOverview({
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    siteUrl: getPublicEnv().siteUrl,
  })

  return (
    <AdminPageShell
      eyebrow="Referral Rewards"
      title="Give 1 month free, get 1 month free"
      description="Share your code with another restaurant. Their first checkout earns them an extra month before subscription billing starts, and the successful referral becomes a tracked reward for your account."
    >
      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
            Referral code
          </p>
          <p className="mt-4 text-2xl font-semibold tracking-[0.08em] text-white">
            {referral.code.code}
          </p>
          <p className="mt-3 text-sm leading-6 text-white/65">
            Share this code or the direct link below with the next restaurant
            owner you introduce to Gustia.
          </p>
        </article>

        <article className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
            Pending rewards
          </p>
          <p className="mt-4 text-4xl font-semibold text-white">
            {referral.pendingMonths}
          </p>
          <p className="mt-2 text-sm text-white/65">
            {referral.pendingCount} restaurant
            {referral.pendingCount === 1 ? '' : 's'} still need to finish
            checkout before the reward is earned.
          </p>
        </article>

        <article className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
            Earned free months
          </p>
          <p className="mt-4 text-4xl font-semibold text-white">
            {referral.rewardedMonths}
          </p>
          <p className="mt-2 text-sm text-white/65">
            {referral.rewardedCount} rewarded referral
            {referral.rewardedCount === 1 ? '' : 's'} tracked so far.
          </p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <article className="rounded-[28px] border border-white/10 bg-white/6 p-6 backdrop-blur">
          <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
            Shareable link
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-white">
            Send prospects straight into signup
          </h3>
          <p className="mt-3 text-sm leading-7 text-white/70">
            The link preserves your referral code through sign-in and checkout,
            so the extra month is applied before the new restaurant reaches
            Stripe.
          </p>

          <div className="mt-6 overflow-x-auto rounded-[24px] border border-white/10 bg-black/20 px-4 py-4 text-sm text-white/85">
            {referral.shareUrl}
          </div>

          <div className="mt-5 rounded-[24px] border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm leading-7 text-emerald-50">
            Referred restaurants receive one extra month before subscription
            billing starts. Once their first checkout succeeds, the referral
            moves from pending to rewarded automatically.
          </div>
        </article>

        <article className="rounded-[28px] border border-white/10 bg-white/6 p-6 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
                Referral tracking
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-white">
                Pending and rewarded restaurants
              </h3>
            </div>
            <p className="text-sm text-white/50">Signed in as {userEmail}</p>
          </div>

          <div className="mt-6 space-y-4">
            {referral.referrals.length > 0 ? (
              referral.referrals.map((entry) => (
                <article
                  key={entry.id}
                  className="rounded-[24px] border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {entry.referred_restaurant_name}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/45">
                        Applied{' '}
                        {formatRelativeDate(
                          entry.applied_at || entry.created_at
                        )}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] ${
                        entry.status === 'rewarded'
                          ? 'border border-emerald-300/20 bg-emerald-400/10 text-emerald-100'
                          : entry.status === 'completed'
                            ? 'border border-sky-300/20 bg-sky-400/10 text-sky-100'
                            : 'border border-amber-300/20 bg-amber-300/10 text-amber-100'
                      }`}
                    >
                      {entry.status}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-white/70 sm:grid-cols-2">
                    <div className="rounded-[18px] border border-white/10 bg-white/5 px-4 py-3">
                      Reward: {entry.reward_months} free month
                      {entry.reward_months === 1 ? '' : 's'}
                    </div>
                    <div className="rounded-[18px] border border-white/10 bg-white/5 px-4 py-3">
                      New restaurant bonus: {entry.referred_bonus_months} month
                      {entry.referred_bonus_months === 1 ? '' : 's'}
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-white/10 bg-black/20 p-5 text-sm leading-7 text-white/65">
                No restaurants have used this referral link yet. Once someone
                signs up with your code, their progress will appear here.
              </div>
            )}
          </div>
        </article>
      </section>
    </AdminPageShell>
  )
}
