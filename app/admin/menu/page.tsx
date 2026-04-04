import { AdminPageShell } from '@/components/admin/AdminPageShell'
import { EmptyRestaurantState } from '@/components/admin/EmptyRestaurantState'
import { MenuEditor } from '@/components/admin/MenuEditor'
import { normalizeMenuItems, requireAdminContext } from '@/lib/admin/server'

export default async function AdminMenuPage() {
  const { restaurant, userEmail } = await requireAdminContext()

  if (!restaurant) {
    return <EmptyRestaurantState email={userEmail} />
  }

  return (
    <AdminPageShell
      eyebrow="Menu Editor"
      title="Shape what the concierge knows"
      description="Keep pricing, categories, allergens, and dietary tags accurate so recommendations stay trustworthy."
    >
      <MenuEditor initialItems={normalizeMenuItems(restaurant.menu_json)} />
    </AdminPageShell>
  )
}
