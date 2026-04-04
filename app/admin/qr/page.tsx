import { AdminPageShell } from '@/components/admin/AdminPageShell'
import { EmptyRestaurantState } from '@/components/admin/EmptyRestaurantState'
import { QrStudio } from '@/components/admin/QrStudio'
import { requireAdminContext } from '@/lib/admin/server'

export default async function AdminQrPage() {
  const { restaurant, userEmail } = await requireAdminContext()

  if (!restaurant) {
    return <EmptyRestaurantState email={userEmail} />
  }

  return (
    <AdminPageShell
      eyebrow="QR Poster Studio"
      title="Generate table-ready QR posters"
      description="Preview the A4 layout, set the table number, then download PNG, save as PDF, share on WhatsApp, or print directly."
    >
      <QrStudio
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
        logoUrl={restaurant.logo_url}
      />
    </AdminPageShell>
  )
}
