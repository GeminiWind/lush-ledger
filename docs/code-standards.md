# Code Standards

This document defines practical standards for this repository so feature work stays consistent with the current architecture.

## Scope Rules

- Use `src/app/(dashboard)/app/*` for authenticated page routes (`/app/*`).
- Keep route files thin; place feature UI/hooks in `src/features/*`.
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

## Client API State

- Use TanStack Query (`@tanstack/react-query`) for client-side API mutations/queries.
- Register providers once at app root (`src/app/QueryProvider.tsx` + `src/app/layout.tsx`).
- Prefer `useMutation`/`useQuery` over ad-hoc `fetch` state for client components.
- Define mutation callbacks (`onSuccess`, `onError`, `onSettled`) on the `useMutation` declaration by default.
- Avoid per-invocation callback overrides in `mutate(..., { onSuccess })` unless there is a hard one-off need.
- Invalidate relevant keys after successful mutations (for example `queryClient.invalidateQueries({ queryKey: ["savings"] })`).
- Keep server route handlers as source of truth for validation and user scoping.

## Dialog and Modal UX

- All dialogs/modals must support dismiss via outside click (backdrop click).
- All dialogs/modals must support dismiss via `Esc` key.
- Keep a visible close affordance (`X` button) with an accessible label.

## Form Field Conventions

- Every required input field label must include a red `(*)` indicator.
- Apply this consistently across page forms and dialog/modal forms.

## i18n and Localization

- Use `src/lib/i18n.ts` as the single source of truth for translated UI copy.
- Use `getDictionary(language)` (or section helpers) for user-facing text instead of hardcoded strings.
- Reuse existing dictionary keys and naming patterns before adding new keys.
- Keep language handling normalized through `normalizeLanguage` and supported `AppLanguage` values.
- For date/number/currency formatting, use locale-aware APIs (`Intl.*`) and align with current user language/currency settings.
- When adding or changing text, update both English and Vietnamese entries at minimum to avoid mixed-language UI.

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
