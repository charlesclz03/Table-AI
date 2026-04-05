import { RouteLoadingShell } from '@/components/ui/RouteLoadingShell'

export default function AuthLoading() {
  return (
    <RouteLoadingShell
      eyebrow="Auth"
      message="Preparing sign-in and checkout access..."
    />
  )
}
