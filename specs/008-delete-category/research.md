# Research: Atelier Delete Category

## Metadata

- Date: 2026-04-29
- Feature: `008-delete-category`
- Spec: `/Users/haidv7/Desktop/Workspace/Perrsonal/lush-ledger/specs/008-delete-category/spec.md`

## Decision 1: Delete Strategy

- Decision: Soft-delete category via `deletedAt` and hide from active Atelier list.
- Rationale: Aligns with clarified requirement, safer data lifecycle, reversible operationally if needed, lower accidental data-loss risk.
- Alternatives considered:
  - Hard delete row permanently (higher irreversibility risk).
  - Soft delete + timed purge (extra lifecycle complexity not required now).

## Decision 2: Linked Transaction Continuity

- Decision: Reassign linked transactions to user-scoped system `Uncategorized` category during delete transaction.
- Rationale: Preserves historical reporting continuity and avoids null-category ambiguity.
- Alternatives considered:
  - Set `categoryId` to null (simpler but weaker reporting categorization).
  - Block delete if linked transactions exist (poor UX, conflicts with cleanup goal).

## Decision 3: Not-Found Semantics

- Decision: Return `404 Not Found` when target category is missing or already soft-deleted.
- Rationale: Clear client behavior, idempotency ambiguity avoided, matches clarified FR-012.
- Alternatives considered:
  - `200 OK` idempotent success (hides stale-client issues).
  - `409 Conflict` (less standard for missing resource semantics).

## Decision 4: Mutation/Refresh Pattern

- Decision: Keep TanStack Query mutation with Atelier query invalidation + `router.refresh()` after success.
- Rationale: Existing repository pattern, consistent state refresh behavior.
- Alternatives considered:
  - Manual optimistic local mutation only (higher drift risk).
  - Full page reload (UX regression).

## Decision 5: Test Coverage Shape

- Decision: Contract + integration tests mandatory; targeted E2E optional for regression hardening.
- Rationale: Meets constitution testing gate at smallest effective levels and keeps feedback loop fast.
- Alternatives considered:
  - E2E-only (slower, over-broad).
  - Manual-only verification (insufficient).
