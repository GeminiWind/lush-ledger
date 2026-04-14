# Quickstart: Atelier List

## Prerequisites

- Install dependencies: `npm install`
- Ensure env variables are configured (including `JWT_SECRET`)
- Ensure local database is initialized and contains category + transaction sample data

## 1) Start application

- Run: `npm run dev`
- Open: `/app/atelier`

## 2) Validate default month list

- Confirm all user categories are displayed.
- Confirm each row shows: name, icon, monthly limit, warning threshold, carry-next-month visibility, and spend status.
- Confirm no create/update interactions are required for this feature scope.

## 3) Validate month switching

- Change month context to another month.
- Confirm list refreshes and row values/statuses reflect selected month snapshots.
- Confirm month refresh does not leak data from other users.

## 4) Validate risk states

- Prepare category data where:
  - spent < warning threshold,
  - spent >= warning threshold and <= limit,
  - spent > limit.
- Confirm statuses are rendered as healthy, warning, and overspent respectively.
- Confirm status communication is not color-only.

## 5) Validate error and partial-data handling

- Simulate invalid month query and confirm validation error response shape.
- Simulate temporary list-fetch failure and confirm recoverable retry state.
- Simulate partial spend-status inputs and confirm pending indicator behavior.

## 6) Validate contract behavior

- `GET /api/atelier?month=YYYY-MM`

Expected:
- Success returns month-scoped category rows with all list-required fields.
- Unauthorized requests return auth error.
- Invalid month values return validation errors.

## 7) Run quality gates

- Lint: `npm run lint`
- Build: `npm run build`
- Tests: `npm run test`

## 8) Documentation updates before merge

If behavior changes during implementation, update in the same change:

- `docs/codebase-summary.md`
- `docs/system-architecture.md`
- `docs/project-roadmap.md`

## 9) Latest quality gate run (Phase 6)

Executed on 2026-04-14:

- `npm run lint` -> pass with 1 warning (`@next/next/no-img-element`) at `src/features/savings/pages/CancelledSavingsPlanDetailPageView.tsx:189`
- `npm run test` -> pass (`25` files, `129` tests)
- `npm run build` -> pass (Next.js build successful)

Build-time non-blocking warnings observed:

- Next.js notice: middleware file convention is deprecated in favor of proxy
- BullMQ webpack warning: `Critical dependency: the request of a dependency is an expression`
