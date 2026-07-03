# Savings Plan Status Flow

This document defines the expected lifecycle for a savings plan in Lush Ledger, and explicitly separates what is **persisted in the database** from what is **derived in the UI only**.

## Persisted vs. derived states

`SavingsPlan.status` (`prisma/schema.prisma`) is a free-text string column, not an enum. Only three values are ever written to it:

| Value | Meaning |
|---|---|
| `active` | Default state on creation; plan accepts contributions and participates in auto-transfer |
| `cancelled` | Terminal state; plan is closed and refunded |
| `archive` | Terminal state for a plan that reached its target and was archived |

`funded` and `completed` are **not** persisted anywhere. They are transient labels computed client-side in `src/features/savings/pages/SavingsPageView.tsx` from saved-amount-vs-target progress, applied only while the underlying `status` is still `active`:

- `active` (no contributions yet) -> label stays `active`
- `active` + at least one contribution, saved < target -> label becomes `funded`
- `active` + saved >= target -> label becomes `completed`

Once a plan is cancelled or archived, its persisted `status` (`cancelled` / `archive`) is shown as-is — the derived labels only apply on top of `active`.

## Status lifecycle diagram

```
[persisted: active] --(contribution added, saved < target)--> [derived label: funded]
[persisted: active] --(saved >= target)-------------------> [derived label: completed]
[persisted: active | derived funded] --(cancel)-----------> [persisted: cancelled]  (terminal)
[persisted: active, derived completed] --(archive)---------> [persisted: archive]    (terminal)
```

Everything left of `-->` in the derived-label branches is still `status = "active"` in the database; the bracket labels distinguish real column values from UI-only progress labels.

## Transition rules

1. **Create plan**
   - A newly created plan starts with persisted `status = "active"`.

2. **Add contribution**
   - Adding a contribution does not change persisted `status`. It only changes the UI-derived label to `funded` once `savedAmount > 0` and `savedAmount < targetAmount`.

3. **Reach target**
   - When saved amount reaches or exceeds target amount (still `status = "active"`), the UI-derived label becomes `completed`.

4. **Archive**
   - A plan showing the derived `completed` label should only transition to persisted `status = "archive"`. It cannot be cancelled once completed.

5. **Cancel eligibility**
   - Cancellation (`PATCH /api/savings/plans/[id]` with `status: "cancelled"`) is allowed only while the plan is persisted `active` (regardless of whether the UI is currently showing it as `funded`).
   - `cancelled` is a terminal state for that plan.

## `isPrimary`

- `isPrimary` is a separate boolean column, independent of `status`. It marks the single "spotlight" plan shown on `/app/savings`.
- Only one plan per user can have `isPrimary = true` among `active` plans; the API enforces this by clearing `isPrimary` on other active plans in the same transaction when a new primary is set.
- Cancelling or archiving the current primary plan auto-reassigns `isPrimary` to another `active` plan (ordered by `isPrimary desc, targetDate asc, createdAt asc`), handled inside `PATCH /api/savings/plans/[id]` (`src/app/api/savings/plans/[id]/route.ts`).
- Setting `status` away from `"active"` always clears `isPrimary` on that plan itself.

## Auto-transfer eligibility

- Month-end auto-transfer (`src/lib/savings-auto-transfer.ts`) selects destination plans using an `ELIGIBLE_PLAN_STATUSES` set of `{"active", "funded"}`.
- Because `"funded"` is never actually persisted (it is UI-only, see above), only plans with persisted `status = "active"` are ever real auto-transfer destinations in practice. `cancelled` and `archive` plans are never eligible.
- Eligibility is re-checked against the live `SavingsPlan.status` at execution time (not the `AutoTransferRule` allocation snapshot), so a plan cancelled after the rule was configured is skipped rather than funded.

## UX/API behavior notes

- Cancel action is shown only for plans in persisted `active` state (displayed as `active` or derived `funded`).
- Cancel flow creates a `refund` transaction that returns the saved amount to the default wallet, linked to the plan via `savingsPlanId`.
- `funded` and `completed` are derived entirely from saved progress on the savings view (`SavingsPageView.tsx`) — they do not exist as `SavingsPlan.status` values and must not be sent as a `status` value to `PATCH /api/savings/plans/[id]`.
