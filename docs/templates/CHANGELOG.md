# Changelog

All notable changes to this starter should be recorded here.

## [Unreleased]

### Added

- App Router starter shell under `app/`
- `/api/onboarding/suggestions` shared backend route
- InsForge-aware onboarding discovery and suggestion flow
- Local onboarding suggestion script
- Safe integration helpers for Prisma, NextAuth, Supabase, and Stripe

### Changed

- Replaced deprecated `next lint` usage with ESLint CLI
- Normalized repo formatting to LF-friendly tooling
- Updated onboarding skill to inspect docs before asking setup questions

### Fixed

- Repaired the broken `next.config.js` baseline
- Restored a runnable build, test, and route scaffold
- Removed stale product-specific audit assumptions from starter code and docs
