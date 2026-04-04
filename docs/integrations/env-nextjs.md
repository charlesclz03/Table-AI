# `@t3-oss/env-nextjs`

`lib/env.ts` is now the single typed env source of truth.

- Server-only env vars are defined in the `server` schema.
- Public env vars are defined in the `client` schema.
- Empty strings are normalized to `undefined`.
- Optional integrations remain non-breaking by keeping their env vars optional.
- `lib/server-env.ts` is now a thin compatibility layer that derives grouped status helpers from the validated env object.
