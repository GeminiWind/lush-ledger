# Research: Month-End Remainder Transfer to Savings Plan

## Decision 1: Month-End Cutoff Uses Per-User Timezone

- Decision: Evaluate month-end using each user's configured timezone.
- Rationale: Users reason about financial months in their local context; per-user cutoff avoids transfers appearing in the wrong month/day.
- Alternatives considered:
  - Global UTC cutoff: simpler ops, but confusing for non-UTC users.
  - Server timezone cutoff: environment-dependent and inconsistent for distributed users.

## Decision 2: Idempotency Key Is User + Month

- Decision: Enforce at most one month-end auto-transfer run result per `userId + monthStart`.
- Rationale: Prevents duplicate transfers during retries and creates a stable audit trail.
- Alternatives considered:
  - No idempotency: unacceptable duplicate transfer risk.
  - Time-window lock only: weaker guarantee across process restarts.

## Decision 3: Transfer Is Capped by Remaining Target

- Decision: Calculate percentage-based transfer for each configured plan allocation, then cap each plan transfer at that plan's remaining target amount.
- Rationale: Prevents overfunding and keeps savings progress semantics aligned with plan target.
- Alternatives considered:
  - Allow overfunding: introduces unclear plan completion behavior.
  - Skip when over-target: leaves valid partial transfer value unused.

## Decision 4: Eligible Destination Plan States

- Decision: Allow destination plans only in `active` or `funded` states, with unique plan selections per allocation row.
- Rationale: Matches existing lifecycle and excludes terminal/non-actionable states.
- Alternatives considered:
  - Active only: too restrictive for in-progress plans.
  - Any non-cancelled: risks writing into completed/archive plans.

## Decision 5: Outcome Record Supports Applied and Skipped States

- Decision: Persist month-end run outcome with `applied` or `skipped` status plus skip reason when relevant.
- Rationale: Required for supportability, user trust, and UI explanation of why no transfer occurred.
- Alternatives considered:
  - Store applied only: no visibility into skipped outcomes.
  - Derive skipped state at read-time only: weaker traceability and troubleshooting.
