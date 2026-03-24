## Context links

- Plan: `docs/plans/personal-finance-mvp/plan.md`
- Tech stack: `docs/tech-stack.md`

## Overview

- Date: 2026-03-20
- Priority: medium
- Status: in_progress (reviewed 2026-03-24)

## Key Insights

- Keep savings logic simple: fixed monthly contribution toward a target.

## Requirements

- Create savings plans with target amount and target date
- Set required monthly contribution
- Track progress vs target

## Architecture

- SavingsPlan model with target, monthly contribution, and progress
- Aggregations to compute progress based on tagged transactions

## Related code files

- `src/app/(app)/savings/page.tsx`
- `src/app/api/savings/*`
- `prisma/schema.prisma`

## Implementation Steps

1. Add SavingsPlan model
2. CRUD endpoints
3. Savings list and edit UI
4. Compute progress and remaining amount

## Todo list

- Schema updates and migrations
- Savings plan CRUD
- Progress calculation

## Success Criteria

- User can create a savings plan with monthly amount
- Progress shows remaining amount to target

## Review summary (2026-03-24)

- Completed: `SavingsPlan` model exists in Prisma with `targetAmount`, `monthlyContribution`, and `targetDate`
- Completed: Savings dashboard/UI is implemented and computes saved/progress/remaining from tagged transactions
- Completed: Savings trend and progress visualizations are available in the app
- Gap: Savings plan CRUD is not implemented (no dedicated create/update/delete API routes)
- Gap: No explicit savings plan creation/edit UI workflow was found in current app routes
- Gap: Progress depends on transaction tagging; there is no guided tagging/assignment flow in this phase scope

## Recommendation

- Keep phase as `in_progress` until savings plan CRUD + creation/edit UI are added.

## Risk Assessment

- Progress can be unclear without clear transaction tagging

## Security Considerations

- Enforce per-user data isolation

## Next steps

- Optional visualizations and reminders
