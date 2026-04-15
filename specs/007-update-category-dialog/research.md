# Research: Atelier Category Update Dialog

## Metadata

- Date: 2026-04-15
- Feature: `007-update-category-dialog`
- Spec: `/Users/haidv7/Desktop/Workspace/Perrsonal/lush-ledger/specs/007-update-category-dialog/spec.md`

## Decision 1: Conflict Detection Mechanism for Category Updates

- Decision: Use optimistic concurrency by sending original category snapshot values in PATCH payload and rejecting update with `409` when current persisted values no longer match that snapshot.
- Rationale: The current schema has no explicit revision/version field on `Category`; snapshot matching prevents silent overwrite without requiring schema migration in this scoped feature.
- Alternatives considered:
  - Add `version` column and enforce compare-and-swap at DB level (stronger long-term, but requires migration and broader rollout).
  - Last-write-wins (simpler but violates clarified requirement to reject stale edits).

## Decision 2: Name Uniqueness Enforcement on PATCH

- Decision: Apply case-insensitive per-user uniqueness checks on category name during PATCH, excluding the currently edited category ID.
- Rationale: This matches clarified spec and existing POST behavior expectations, preventing duplicate labels that degrade report and list clarity.
- Alternatives considered:
  - Case-sensitive uniqueness (allows confusing near-duplicates).
  - Allow duplicates (violates clarified requirement and creates ambiguous UI labels).

## Decision 3: Warning Threshold Behavior When Warning Is Disabled

- Decision: Preserve the current `warnAt` value in storage while treating it as inactive for validation and runtime behavior when `warningEnabled` is false.
- Rationale: Preserves user intent and avoids unnecessary re-entry when warning is re-enabled.
- Alternatives considered:
  - Reset to default on disable (data loss of user preference).
  - Clear value on disable (extra UX friction when re-enabling).

## Decision 4: Error Payload Shape for Dialog UX

- Decision: Keep structured error responses (`error` + optional `errors`) for validation and business rule failures, and add a conflict-specific `409` message for stale edits.
- Rationale: Existing client-side services already parse this shape; preserving it minimizes UI regression risk and supports inline errors.
- Alternatives considered:
  - Single generic error only (insufficient for field-level recovery).
  - Separate conflict schema divergent from existing route conventions (adds avoidable complexity).

## Decision 5: Reuse Existing Edit Modal vs New Dialog Component

- Decision: Reuse and adapt `EditCategoryModal.tsx` as the implementation vehicle for `EditCategoryDialog` behavior in the spec.
- Rationale: Existing file already includes most interaction mechanics (prefill, validation, dismiss behaviors, mutation integration); adapting is lower-risk than introducing a second modal implementation.
- Alternatives considered:
  - Build a new dialog from scratch (higher duplication and migration overhead).
  - Keep current modal unchanged and only wire trigger (would miss clarified requirements and naming updates).

## Setup Audit Notes (Phase 1 Shared Tasks)

### SHARED-T001: Asset Presence Confirmation

- Confirmed both required design assets exist:
  - `specs/007-update-category-dialog/assets/update-category-modal.png`
  - `specs/007-update-category-dialog/assets/update-category-modal.html`

### SHARED-T002: Existing Edit Flow Touchpoint Audit

- `src/features/atelier/pages/AtelierPageView.tsx`
  - Current page wiring passes `addCategoryTrigger` into `CategoryAtelierGrid`.
  - No selected-category state or edit-dialog state is currently owned at page level.
- `src/features/atelier/components/CategoryAtelierGrid.tsx`
  - Grid currently renders a visual edit icon (`edit_square`) inside each card.
  - The icon is not currently wired as an interactive trigger for edit dialog open.
- `src/features/atelier/dialogs/EditCategoryModal.tsx`
  - Modal currently owns a self-trigger button (`Edit`) and internal open/close state.
  - Update mutation already targets `PATCH /api/categories/:id` and refreshes atelier query + route on success.
  - Existing behavior includes prefill, Esc/backdrop dismissal, icon picker, warning toggle, and top-level error rendering.

### SHARED-T003: i18n Key Inventory for Edit-Category Updates

- Existing `atelier` namespace keys are already present in both `en.json` and `vi.json` for current edit modal surfaces:
  - `atelierCategoryNameRequired`
  - `atelierCategoryNameTooLong`
  - `atelierCategoryNameDuplicate`
  - `atelierMonthlyLimitRequired`
  - `atelierMonthlyLimitNonNegative`
  - `atelierWarnAtValidation`
  - `atelierCategoryNameLabel`
  - `atelierCategoryNamePlaceholder`
  - `atelierMonthlySpendingLimit`
  - `atelierOverExpenseWarning`
  - `atelierWarnAt`
  - `atelierWarnAtLimitContext`
  - `atelierEditCategoryTitleTemplate`
  - `atelierEditCategorySubtitle`
  - `atelierEditCategoryFailed`
  - `atelierEditCategorySuccess`
  - `atelierKeepLimitNextMonth`
  - `atelierKeepLimitNextMonthHint`
  - `atelierWarningHint`

- Gap for later foundational task (`SHARED-T005`): no explicit conflict/reload guidance key is currently defined for `FR-020`; add dedicated copy in both locales during Phase 2.
