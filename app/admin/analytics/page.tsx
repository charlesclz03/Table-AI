import { AdminAnalyticsDashboard } from '@/components/admin/AdminAnalyticsDashboard'
import { AdminPageShell } from '@/components/admin/AdminPageShell'
import { EmptyRestaurantState } from '@/components/admin/EmptyRestaurantState'
import { getRestaurantAnalytics, parseAnalyticsRange } from '@/lib/analytics'
import { requireAdminContext } from '@/lib/admin/server'

export default async function AdminAnalyticsPage() {
  const { restaurant, userEmail } = await requireAdminContext()

  if (!restaurant) {
    return <EmptyRestaurantState email={userEmail} />
  }

  const initialData = await getRestaurantAnalytics(
    restaurant,
    parseAnalyticsRange('7')
  )

  return (
    <AdminPageShell
      eyebrow="Owner Analytics"
      title={`${restaurant.name} performance at a glance`}
      description="Track guest usage, common questions, recommendation traction, and engagement without storing any personal guest identifiers."
    >
      <AdminAnalyticsDashboard initialData={initialData} />
    </AdminPageShell>
  )
}
