import { formatDistanceToNow } from 'date-fns'
import {
  ArrowRight,
  Gift,
  MessageSquare,
  MapPinned,
  QrCode,
  Receipt,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { AdminPageShell } from '@/components/admin/AdminPageShell'
import { EmptyRestaurantState } from '@/components/admin/EmptyRestaurantState'
import { getDashboardStats, requireAdminContext } from '@/lib/admin/server'

const quickActions = [
  {
    href: '/admin/onboarding',
    label: 'Import Demo',
    description: 'Paste a Google Maps URL and generate concierge markdown.',
    icon: MapPinned,
  },
  {
    href: '/admin/menu',
    label: 'Edit Menu',
    description: 'Update dishes, allergens, and sort order.',
    icon: MessageSquare,
  },
  {
    href: '/admin/referral',
    label: 'Referral Rewards',
    description: 'Share your code and track free-month rewards.',
    icon: Gift,
  },
  {
    href: '/admin/quiz',
    label: 'Take Quiz Again',
    description: 'Refresh the concierge personality and FAQs.',
    icon: Sparkles,
  },
  {
    href: '/admin/qr',
    label: 'Download QR Code',
    description: 'Generate table posters for print and WhatsApp.',
    icon: QrCode,
  },
  {
    href: '/admin/billing',
    label: 'Manage Subscription',
    description: 'Review plan status, invoices, and Stripe access.',
    icon: Receipt,
  },
] as const

export default async function AdminDashboardPage() {
  const { restaurant, userEmail } = await requireAdminContext()

  if (!restaurant) {
    return <EmptyRestaurantState email={userEmail} />
  }

  const stats = await getDashboardStats(restaurant.id)

  return (
    <AdminPageShell
      eyebrow="Dashboard Home"
      title={`Welcome back, ${restaurant.name}`}
      description="Everything the owner needs to keep the concierge accurate, printable, and billable lives here."
    >
      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
            Conversations This Week
          </p>
          <p className="mt-4 text-4xl font-semibold text-white">
            {stats.conversationsThisWeek}
          </p>
          <p className="mt-2 text-sm text-white/65">
            Guest chats recorded since the start of this week.
          </p>
        </article>

        <article className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
            Most Asked Questions
          </p>
          <div className="mt-4 space-y-2 text-sm leading-6 text-white/75">
            {stats.mostAskedQuestions.length > 0 ? (
              stats.mostAskedQuestions.map((question) => (
                <p
                  key={question}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                >
                  {question}
                </p>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-3">
                No question patterns yet. As guests chat, we&apos;ll surface the
                top asks here.
              </p>
            )}
          </div>
        </article>

        <article className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
            Subscription Status
          </p>
          <p className="mt-4 inline-flex rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm uppercase tracking-[0.2em] text-amber-100">
            {restaurant.subscription_status || 'inactive'}
          </p>
          <p className="mt-3 text-sm leading-6 text-white/65">
            Plan: {restaurant.plan_name || 'Founding Restaurant'}
          </p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
            Quick Actions
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {quickActions.map((action) => {
              const Icon = action.icon

              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="rounded-[24px] border border-white/10 bg-black/20 p-4 transition hover:border-amber-300/30 hover:bg-amber-300/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {action.label}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-white/65">
                        {action.description}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 p-3 text-white/70">
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm text-amber-100">
                    Open <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
            Recent Conversations
          </p>
          <div className="mt-4 space-y-3">
            {stats.recentConversations.length > 0 ? (
              stats.recentConversations.map((conversation) => (
                <article
                  key={conversation.id}
                  className="rounded-[24px] border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">
                      {conversation.tableNumber}
                    </p>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                      {conversation.createdAt
                        ? formatDistanceToNow(
                            new Date(conversation.createdAt),
                            {
                              addSuffix: true,
                            }
                          )
                        : 'Unknown time'}
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/80">
                    Guest: {conversation.lastQuestion}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    Concierge: {conversation.lastReply}
                  </p>
                </article>
              ))
            ) : (
              <p className="rounded-[24px] border border-dashed border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/65">
                No guest conversations yet. Once the QR posters are live, this
                list will show the five most recent tables.
              </p>
            )}
          </div>
        </div>
      </section>
    </AdminPageShell>
  )
}
