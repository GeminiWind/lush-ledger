# Research: Atelier List

## Decision 1: Month Context Should Be Request-Driven

- Decision: Represent selected month explicitly in request context (`YYYY-MM`) and use it to drive month-scoped list retrieval.
- Rationale: The spec requires list refresh by month; request-driven context keeps server and UI aligned and avoids stale mixed-month values.
- Alternatives considered:
  - Client-only filtering after loading current month data: insufficient because other months require different snapshots and totals.
  - Implicit current-month-only behavior: violates month-switch requirement.

## Decision 2: Keep Existing Snapshot Models as Source of Truth

- Decision: Use `CategoryMonthlyLimit` and `UserMonthlyCap` snapshots for list limits and warning thresholds, with monthly transaction totals for spent/usage.
- Rationale: Repository domain rules already define monthly snapshots as authoritative for budget behavior.
- Alternatives considered:
  - Introduce new list-specific storage table: unnecessary duplication and migration overhead.
  - Compute limits directly from category base fields: loses month-specific correctness.

## Decision 3: Carry-Next-Month Visibility Is Derived from Snapshot Outcome

- Decision: Expose carry-next-month as a derived list field by comparing selected-month and next-month limit continuity for each category.
- Rationale: Current schema stores monthly outcomes, not a durable per-month intent flag; derived visibility reflects operational behavior without schema changes.
- Alternatives considered:
  - Add a new persisted carry-intent field: larger scope than list-only feature.
  - Omit carry-next information: conflicts with required list columns in spec.

## Decision 4: Risk State Precedence Uses Overspent > Warning > Healthy

- Decision: Evaluate spend status in this order: overspent when spent > limit, warning when warning is enabled and usage >= warnAt, otherwise healthy.
- Rationale: This matches existing Atelier status semantics and keeps risk messaging deterministic.
- Alternatives considered:
  - Warning supersedes overspent: hides critical overspend signal.
  - Numeric-only output with no status bucket: weaker scanability for users.

## Decision 5: Partial Data Should Render with Explicit Pending Status

- Decision: If spend or snapshot inputs are incomplete for a row, return available fields and mark risk status as pending rather than failing the entire list.
- Rationale: Spec requires non-blocking behavior for partial data and user-visible recoverability.
- Alternatives considered:
  - Hard-fail whole list on partial row data: degrades reliability and user trust.
  - Silent fallback to healthy: risks incorrect financial interpretation.
