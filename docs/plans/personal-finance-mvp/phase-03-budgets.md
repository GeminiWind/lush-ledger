## Context links

- Plan: `docs/plans/personal-finance-mvp/plan.md`
- Tech stack: `docs/tech-stack.md`

## Overview

- Date: 2026-03-20
- Priority: medium
- Status: completed (reviewed 2026-03-30)

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

- `src/app/(dashboard)/app/atelier/page.tsx`
- `src/features/atelier/components/CategoryAtelierGrid.tsx`
- `src/features/atelier/dialogs/AddCategoryModal.tsx`
- `src/features/atelier/dialogs/EditCategoryModal.tsx`
- `src/features/atelier/dialogs/DeleteCategoryDialog.tsx`
- `src/app/api/categories/route.ts`
- `src/app/api/categories/[id]/route.ts`
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

## Review summary (2026-03-30)

- Completed: Category create + edit flows are implemented in Atelier UI (`AddCategoryModal`, `EditCategoryModal`).
- Completed: Category delete flow is implemented in UI + API (`DeleteCategoryDialog`, `DELETE /api/categories/[id]`) with transaction reassignment to uncategorized.
- Completed: Category update API exists (`PATCH /api/categories/[id]`) and updates name, icon, monthly limit, warning settings, and next-month carry-over behavior.
- Completed: Category icon is now modeled and persisted (`Category.icon`) and reused across budget and transaction UI.
- Completed: Budget vs actual aggregation and over-limit/at-risk visual states remain active in dashboard + atelier.
- Completed: Monthly snapshot model (`CategoryMonthlyLimit`, `UserMonthlyCap`) remains in place and is updated for current/next month.
- Note: Warning behavior is currently visual/status-based; dedicated notification pipeline can be treated as post-MVP enhancement.

## Recommendation

- Mark Phase 03 as complete and continue with reports implementation.

## Risk Assessment

- Month boundaries and time zones can skew totals
- Over-limit logic may confuse if transactions are edited retroactively

## Security Considerations

- Enforce per-user data isolation

## Next steps

- Build reports
