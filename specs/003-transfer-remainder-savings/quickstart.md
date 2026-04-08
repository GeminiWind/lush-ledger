# Quickstart: Month-End Remainder Transfer to Savings Plan

## Prerequisites

- Install dependencies: `npm install`
- Ensure environment variables are set (including `DATABASE_URL` and `JWT_SECRET`)
- Generate Prisma client: `npm run prisma:generate`

## 1) Start the app

- Run: `npm run dev`
- Open authenticated app routes in browser.

## 2) Configure auto-transfer

- Navigate to `/app/atelier` (settings entry) or linked savings settings entry.
- Enable month-end auto-transfer.
- Add one or more eligible savings plan allocations (`active` or `funded`).
- Enter per-plan percentages (1..100 each) with total allocation from 1 to 100.
- Save and confirm success state.

## 3) Verify API behaviors

- Read config: `GET /api/savings/auto-transfer`
- Update config: `PUT /api/savings/auto-transfer`
- Read latest run outcome: `GET /api/savings/auto-transfer/latest-run`

Expected:
- Invalid inputs return structured validation errors.
- Valid updates persist and are returned on subsequent reads.

## 4) Verify month-end scenarios

Validate business-critical outcomes in integration tests:

- Positive remainder + valid config -> one transfer created
- Non-positive remainder -> skipped with reason
- Calculated over-target amount -> capped transfer
- Re-run same month -> no duplicate transfer

## 5) Run quality gates

- Lint: `npm run lint`
- Build: `npm run build`
- Tests: `npm run test`

## 6) Documentation updates before merge

When implementation is done, update these source-of-truth docs in the same change:

- `docs/codebase-summary.md`
- `docs/system-architecture.md`
- `docs/project-roadmap.md`

## Latest verification snapshot (2026-04-08)

- `npm run test -- tests/contract/savings-auto-transfer-api.contract.test.ts tests/integration/savings-auto-transfer-month-end.integration.test.ts` -> pass
- `npm run lint` -> pass (existing non-blocking warning: `@next/next/no-img-element` in cancelled savings detail page)
- `npm run build` -> pass (warning from BullMQ dynamic dependency import in webpack output)
- `npm run test` -> pass (84 tests)
