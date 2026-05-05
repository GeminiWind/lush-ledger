# Quickstart: Ledger Transaction Display Groups

## Goal

Implement and verify flat date-header grouping in ledger activity view:
- `Today`
- `Yesterday`
- Older locale-formatted calendar dates

## Prerequisites

- Branch: `009-group-transactions-date`
- Seed or fixture data including:
  - at least one `today` transaction
  - at least one `yesterday` transaction
  - at least two older-day transactions on different dates
- User language setting available for locale validation

## Spec Artifact Verification

Verified feature artifacts and references:
- `specs/009-group-transactions-date/plan.md`
- `specs/009-group-transactions-date/spec.md`
- `specs/009-group-transactions-date/research.md`
- `specs/009-group-transactions-date/data-model.md`
- `specs/009-group-transactions-date/contracts/get-ledger.md`
- `specs/009-group-transactions-date/quickstart.md`

All paths above are present and aligned with task prerequisites.

## Implementation Steps

1. Update ledger view grouping logic in `src/features/ledger/pages/LedgerPageView.tsx`.
2. Ensure headers remain flat (no nested remaining section).
3. Keep existing search/filter/export/edit/delete behavior unchanged.
4. Ensure older date labels use current user locale formatting.
5. Preserve existing empty/error state behavior.

## Verification Steps

1. Load `/app/ledger` with mixed-date records.
2. Confirm header order is `Today`, `Yesterday`, then older dates descending by day.
3. Confirm older date labels change with user language (e.g., EN vs VI).
4. Confirm hidden empty groups and existing empty-state message behavior.
5. Confirm row actions (edit/delete) and export still work.

## Suggested Test Coverage

- Integration tests for grouping and ordering logic.
- Locale rendering assertions for older date headers.
- Empty-state test when filtered result is zero rows.
- Regression checks for existing row action controls.

## Constitution Gate Checks

- Run lint/build.
- Run targeted automated tests for changed ledger behavior.
- Verify UX consistency against Stitch reference and design guidelines.
- Record any docs updates needed in:
  - `docs/codebase-summary.md`
  - `docs/system-architecture.md`
  - `docs/project-roadmap.md`

## Execution Results

### TEST-FE-REG-T001

- Command: `npm run test -- tests/integration/ledger-page-grouping.integration.test.tsx`
- Result: PASS (`7/7` tests)

- Command: `npm run test:e2e -- tests/e2e/ledger-date-grouping.spec.ts`
- Result: BLOCKED in local environment (`http://127.0.0.1:3000 is already used`)

### SHARED-T007

- Command: `npm run lint`
- Result: FAIL with existing repo lint errors unrelated to this feature scope:
  - `src/app/(auth)/login/page.tsx` (`react-hooks/set-state-in-effect`)
  - `src/app/(auth)/register/page.tsx` (`react-hooks/set-state-in-effect`)

- Command: `npm run build`
- Result: PASS (production build completed successfully)
