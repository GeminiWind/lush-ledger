# Quickstart: Export Transaction CSV

## Goal

Validate the end-to-end CSV export flow for authenticated ledger users, including filter parity, access control, empty exports, and CSV integrity.

## Prerequisites

- Development database has at least two users with different transaction data.
- At least one user has transactions spanning multiple categories/types and dates.
- Project dependencies are installed.

## Implementation Steps

1. Add export API contract implementation under ledger API namespace.
2. Add CSV serialization utility for stable column order and escaping behavior.
3. Add export trigger in ledger UI aligned with existing controls and translation patterns.
4. Add automated tests for auth guard, user scoping, filter parity, empty export, and escaping.
5. Update architecture and roadmap docs for the new ledger export capability.

## Verification Steps

1. Run lint and build gates:

```bash
npm run lint
npm run build
```

2. Run automated tests for this feature scope (contract + integration).

3. Manual verification in browser:
   - Sign in as User A and export full ledger.
   - Apply filters (type/account/category/date range), export again, and verify row parity with visible ledger list.
   - Export where no rows match and confirm header-only CSV.
   - Validate text escaping with notes containing commas, quotes, and newlines.
   - Sign in as User B and verify User A data cannot be exported.

## Expected Outcomes

- Export always returns a downloadable `.csv` file for authenticated users.
- Exported rows are fully user-scoped and filter-consistent.
- CSV opens in spreadsheet tools without manual column correction.
- Empty result exports contain headers and zero data rows.

## Latest Validation Log (2026-04-06)

- `npm run test` -> pass (contract + integration coverage for export behavior)
- `npm run lint` -> pass with one pre-existing warning in unrelated savings view
- `npm run build` -> pass

## Stitch Design Assets Used

- Screen HTML reference downloaded to `specs/001-export-transaction-csv/design/transaction-ledger-no-budgets.html`
- Screen image URL available via Stitch metadata for `Transaction Ledger (No Budgets)` (ID `d44005aeb0e24f618c509b28c79432c2`)
