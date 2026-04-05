import { RouteLoadingShell } from '@/components/ui/RouteLoadingShell'

export default function AdminLoading() {
  return (
    <RouteLoadingShell
      eyebrow="Admin"
      message="Loading the owner dashboard and restaurant controls..."
    />
  )
}
