## Context links

- Plan: `docs/plans/personal-finance-mvp/plan.md`
- Tech stack: `docs/tech-stack.md`

## Overview

- Date: 2026-03-20
- Priority: medium
- Status: in_progress (reviewed 2026-04-02)

## Key Insights

- Reports now provide a unified analysis surface (monthly/yearly ranges, charts, and daily drill-down).
- One core requirement remains open: account balance snapshot.

## Requirements

- Monthly cashflow (income vs expense)
- Category spend by month
- Account balances snapshot

## Architecture

- Aggregation queries by month
- Read-only report pages

## Related code files

- `src/app/app/ledger/reports/page.tsx`
- `src/app/app/ledger/reports/ReportsView.tsx`
- `src/app/app/ledger/reports/ExpenseBudgetChart.tsx`
- `src/app/app/ledger/reports/CashflowChart.tsx`
- `src/app/app/ledger/reports/CategoryChart.tsx`
- `src/app/app/ledger/reports/DailyCalendar.tsx`
- `src/lib/ledger.ts` (`getLedgerReportsData`)

## Implementation Steps

1. Create report queries
2. Build reports UI
3. Add export (CSV) if needed

## Todo list

- Add account balances snapshot section to reports
- Add export flow (CSV/PDF) if required for MVP acceptance
- Optional: dedicated `/api/reports` endpoints if client-side export or integrations require API access

## Success Criteria

- Reports render with correct totals

## Review summary (2026-03-24)

- Completed: Reports page implemented under `ledger/reports` with month/year selection and aggregated totals
- Completed: Monthly analytics visualized (expense vs budget chart + daily expense calendar)
- Completed: User-scoped aggregation queries and guarded access via authenticated app flow
- Completed: Recharts integration for report chart rendering
- Completed: Requirement "monthly cashflow (income vs expense)" now has a dedicated monthly time-series chart on `ledger/reports`
- Gap: Requirement "category spend by month" is not explicitly implemented as a category-by-month report view
- Gap: Requirement "account balances snapshot" is not present on reports page
- Gap: Export remains placeholder (no functional CSV/PDF export API)

## Review summary (2026-04-02)

- Completed: Reports page stabilized at canonical route `/app/ledger/reports`
- Completed: Unified analysis implemented with selectable monthly/yearly ranges
- Completed: Monthly expense vs budget chart and cashflow chart are rendered from user-scoped aggregated data
- Completed: Category spend aggregation is available for selected month/year ranges
- Completed: Daily expense calendar with per-day detail dialog implemented
- Completed: Reports view refactored into focused components for maintainability
- Gap: Requirement "account balances snapshot" is still not implemented on reports page
- Gap: Export remains non-functional (no CSV/PDF generation flow)

## Recommendation

- Keep phase as `in_progress` until account snapshot and export flow are completed.

## Risk Assessment

- Performance issues on large datasets

## Security Considerations

- Aggregate data only for current user

## Next steps

- Optional export and polish
