# Code Standards

This document defines practical standards for this repository so feature work stays consistent with the current architecture.

## Scope Rules

- Use `src/app/app/*` for new authenticated pages and app navigation.
- Keep `src/app/(app)/*` as legacy unless explicitly refactoring/deprecating.
- Keep docs in sync with actual routes/APIs in the same PR.

## API Design

- Prefer resource-oriented routes under `src/app/api`.
- Require authenticated user context for all non-auth APIs.
- Scope every query/mutation by current `userId`.
- Validate request input server-side before DB writes.
- Return clear status codes (`200`, `201`, `400`, `401`, `404`, `409`, `500`).

Current naming convention examples:
- auth: `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`
- domain resources: `/api/accounts`, `/api/categories`, `/api/ledger`, `/api/atelier`

## Data and Domain Rules

- Prisma schema is authoritative for model and field naming.
- Currency-sensitive values use decimal-safe storage (`Decimal` in Prisma).
- Monthly cap/category limits must preserve month snapshots (`UserMonthlyCap`, `CategoryMonthlyLimit`).
- Recurring transaction behavior must route through shared recurring logic (`src/lib/recurring.ts`) rather than duplicated page-level logic.

## Auth and Session

- Session token lives in httpOnly cookie (`pf_session`).
- `JWT_SECRET` is required in all environments.
- Middleware should continue to guard private pages and private APIs.
- Avoid exposing sensitive auth details in API responses.

## UI and Routing

- Keep URL hierarchy aligned with user tasks (`/app/ledger/new`, `/app/ledger/reports`).
- Avoid duplicate page ownership across canonical and legacy route trees.
- When migrating legacy pages, update links and docs in the same change.

## Testing and Validation (Minimum)

Before merging feature changes:
- run lint/build locally
- verify auth guard behavior on page and API routes
- verify user-scoped reads/writes for changed endpoints
- verify budget snapshot and recurring paths if touched

## Documentation Standards

- Update these docs when behavior changes:
  - `docs/codebase-summary.md`
  - `docs/system-architecture.md`
  - `docs/project-roadmap.md`
- Explicitly mark known gaps/tech debt instead of hiding them.
- Keep docs concise and implementation-accurate.
