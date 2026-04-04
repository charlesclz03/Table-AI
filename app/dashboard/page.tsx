import { Card, CardHeader, CardSection } from '@/components/ui/Card'
import { getRuntimeStatus, type RuntimeCheckStatus } from '@/lib/runtime-status'

export default function DashboardPage() {
  const runtimeStatus = getRuntimeStatus()

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-accent-tertiary">
          Dashboard
        </p>
        <h1 className="text-4xl font-semibold text-text-primary">
          Integration status at a glance
        </h1>
        <p className="max-w-2xl text-text-secondary">
          TableIA keeps integrations observable as the product moves from demo
          to live service. Currently {runtimeStatus.summary.configured} of{' '}
          {runtimeStatus.summary.total} runtime checks are fully configured.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {runtimeStatus.integrations.map((integration) => (
          <Card key={integration.id} className="bg-surface-elevated/70">
            <CardHeader
              title={integration.title}
              action={<StatusPill status={integration.status} />}
            />
            <CardSection>
              <p className="text-sm leading-6 text-text-secondary">
                {integration.detail}
              </p>
            </CardSection>
          </Card>
        ))}
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: RuntimeCheckStatus }) {
  const tone =
    status === 'Configured'
      ? 'bg-accent-success/15 text-accent-success'
      : status === 'Fallback'
        ? 'bg-accent-brand/15 text-accent-brand'
        : status === 'Development'
          ? 'bg-accent-warning/15 text-accent-warning'
          : 'bg-stroke-soft text-text-secondary'

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${tone}`}
    >
      {status}
    </span>
  )
}
