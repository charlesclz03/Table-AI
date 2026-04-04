import { AdminPageShell } from '@/components/admin/AdminPageShell'
import { EmptyRestaurantState } from '@/components/admin/EmptyRestaurantState'
import { QuizEditor } from '@/components/admin/QuizEditor'
import { normalizeQuizAnswers, requireAdminContext } from '@/lib/admin/server'

export default async function AdminQuizPage() {
  const { restaurant, userEmail } = await requireAdminContext()

  if (!restaurant) {
    return <EmptyRestaurantState email={userEmail} />
  }

  return (
    <AdminPageShell
      eyebrow="Onboarding Quiz"
      title="Retune the concierge voice"
      description="Update the seven owner answers that drive recommendations, hidden gems, restaurant story, and FAQ handling."
    >
      <QuizEditor
        initialAnswers={normalizeQuizAnswers(restaurant.quiz_answers)}
        restaurantName={restaurant.name}
      />
    </AdminPageShell>
  )
}
