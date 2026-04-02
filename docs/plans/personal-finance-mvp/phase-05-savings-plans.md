## Context links

- Plan: `docs/plans/personal-finance-mvp/plan.md`
- Tech stack: `docs/tech-stack.md`

## Overview

- Date: 2026-03-20
- Priority: medium
- Status: in_progress (reviewed 2026-04-02)

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

- `src/app/(dashboard)/app/savings/page.tsx`
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
- Completed: Savings plan create API is implemented (`/api/savings/plans`)
- Completed: Savings plan update API is implemented (`PATCH /api/savings/plans/[id]`)
- Completed: Savings plan creation UI is implemented (dialog on savings page with auto-computed arrival date)
- Completed: Savings tracker supports plan state controls (cancel/activate) for active plan management
- Completed: Cancel flow now supports structured cancel reason/note capture before state transition
- Completed: Cancelled plans now have dedicated list and detail routes (`/app/savings/cancelled`, `/app/savings/cancelled/:id`)
- Completed: Savings filter dropdown now supports active/completed/archived/cancelled with deterministic close-and-select UX
- Decision: No public hard-delete API for savings plans in this phase; use archive lifecycle to preserve history and transaction integrity
- Decision: Savings progress is intentionally driven by `Add Contribution` flow only; generic `New Transaction` does not handle savings assignment in this phase

## Recommendation

- Keep phase as `in_progress` until archive lifecycle controls are finalized (archive/unarchive policy, status guards, and UI affordances).

## Risk Assessment

- If users bypass `Add Contribution` and use generic ledger entry patterns, savings progress can appear inconsistent

## Security Considerations

- Enforce per-user data isolation

## Next steps

- Optional visualizations and reminders
- Add explicit archive lifecycle controls and guardrails (instead of delete)
