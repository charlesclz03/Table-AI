# Owner Changelog Template

Use this template when adding a new owner-facing release note to `lib/changelog.ts`.

## Entry Shape

```ts
{
  version: '1.0.1',
  date: '2026-04-05',
  changes: [
    { type: 'feature', text: 'Short owner-facing feature summary' },
    { type: 'fix', text: 'Short owner-facing bug fix summary' },
    { type: 'improvement', text: 'Short owner-facing polish summary' },
  ],
}
```

## Rules

- use ISO dates: `YYYY-MM-DD`
- keep the text owner-facing, concise, and outcome-focused
- valid change types are only `feature`, `fix`, and `improvement`
- add the new entry to `lib/changelog.ts`, then sync `docs/reference/PATCH_NOTES.md`
- during release prep, confirm `/admin/changelog` shows the new version and the admin nav badge matches it
