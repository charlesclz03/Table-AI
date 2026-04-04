export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-accent-tertiary">
        404
      </p>
      <h1 className="mt-4 text-4xl font-semibold text-text-primary">
        Page not found
      </h1>
      <p className="mt-4 text-text-secondary">
        The route you requested does not exist yet.
      </p>
    </div>
  )
}
