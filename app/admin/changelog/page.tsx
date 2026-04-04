import { AdminPageShell } from '@/components/admin/AdminPageShell'
import { ChangelogFeed } from '@/components/admin/ChangelogFeed'
import { EmptyRestaurantState } from '@/components/admin/EmptyRestaurantState'
import { getChangelogEntries, latestChangelogVersion } from '@/lib/changelog'
import { requireAdminContext } from '@/lib/admin/server'

export default async function AdminChangelogPage() {
  const { restaurant, userEmail } = await requireAdminContext()

  if (!restaurant) {
    return <EmptyRestaurantState email={userEmail} />
  }

  const entries = getChangelogEntries()

  return (
    <AdminPageShell
      eyebrow="Product Updates"
      title="Changelog and release notes"
      description="Restaurant owners can follow every shipped feature, fix, and polish update from the newest Gustia release down to the first launch."
      actions={
        <div className="rounded-full border border-violet-300/20 bg-violet-300/10 px-4 py-3 text-sm text-violet-100">
          Latest version:{' '}
          <span className="font-semibold">v{latestChangelogVersion}</span>
        </div>
      }
    >
      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
        <p className="text-[11px] uppercase tracking-[0.3em] text-violet-200/75">
          Release Feed
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70">
          This timeline is mirrored from the internal release notes so owners
          can quickly see what was added, fixed, or polished before they test a
          new workflow in the dashboard.
        </p>
      </section>

      <ChangelogFeed entries={entries} />
    </AdminPageShell>
  )
}
