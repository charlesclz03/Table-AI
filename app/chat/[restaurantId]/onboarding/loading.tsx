import { RouteLoadingShell } from '@/components/ui/RouteLoadingShell'

export default function ChatOnboardingLoading() {
  return (
    <RouteLoadingShell
      eyebrow="Onboarding"
      message="Loading language and theme setup for this table..."
    />
  )
}
