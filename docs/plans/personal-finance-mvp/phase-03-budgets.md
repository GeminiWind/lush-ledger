## Context links

- Plan: `docs/plans/personal-finance-mvp/plan.md`
- Tech stack: `docs/tech-stack.md`

## Overview

- Date: 2026-03-20
- Priority: medium
- Status: in_progress (reviewed 2026-03-25)

## Key Insights

- Simple monthly category budgets keep MVP lean.

## Requirements

- Category management with per-category monthly limit
- Budget vs actual summary
- Warning for over-limit expenses

## Architecture

- Category model with monthly limit
- Aggregations for actual spend per month
- Over-limit warning triggered on create/edit

## Related code files

- `src/app/(app)/budgets/page.tsx`
- `src/app/api/budgets/*`
- `prisma/schema.prisma`

## Implementation Steps

1. Add Category model with monthly limit
2. CRUD endpoints for categories
3. Category list/edit UI
4. Compute actuals per category
5. Add over-limit warning logic

## Todo list

- Schema updates and migrations
- Category CRUD with limits
- Budget vs actual calculations
- Over-limit warning in UI

## Success Criteria

- User can create categories and set monthly limits
- Warnings appear when expenses exceed limits
- Budget dashboard shows actuals

## Review summary (2026-03-24)

- Completed: Category model includes `monthlyLimit` and is wired through API create flow
- Completed: Budget vs actual aggregations are implemented in dashboard and atelier views
- Completed: Over-limit state is surfaced in UI (overspent badges/alerts) for monthly category spend
- Completed: Monthly snapshot model added (`CategoryMonthlyLimit`, `UserMonthlyCap`) to preserve month-specific budget history
- Gap: Category CRUD is partial (create only; no update/delete endpoints/UI)
- Gap: Over-limit warning is computed in dashboard/visuals, but there is no dedicated warning trigger/notification pipeline on transaction create/edit
- Gap: Phase doc references `/budgets` routes, while current implementation is under `atelier` + dashboard modules

## Recommendation

- Keep phase as `in_progress` until category update/delete and explicit warning trigger flow are implemented.

## Risk Assessment

- Month boundaries and time zones can skew totals
- Over-limit logic may confuse if transactions are edited retroactively

## Security Considerations

- Enforce per-user data isolation

## Next steps

- Build reports
