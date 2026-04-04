# `next-safe-action`

Starter-safe server action conventions live in `lib/actions/`.

- `lib/actions/safe-action.ts` defines the shared action client.
- Action metadata captures a stable `actionName` and `access` policy.
- `authenticatedActionClient` is the default pattern for future write operations that require a signed-in user.
- Validation errors are flattened by default so client consumers can render them predictably.
