# Onboarding Ingestion

The onboarding pipeline now follows a small ingest-style flow:

1. Discover user-authored text docs.
2. Parse Markdown frontmatter with `gray-matter`.
3. Parse headings/frontmatter-aware structure with `remark-frontmatter` + `remark-parse`.
4. Normalize document content and preserve source paths.
5. Chunk long documents into small prompt-safe segments.
6. Run heuristics first and then enrich with InsForge when configured.

This behavior is implemented in:

- `lib/onboarding/document-discovery.ts`
- `lib/onboarding/ingestion.ts`
- `lib/onboarding/heuristics.ts`
- `lib/onboarding/service.ts`
