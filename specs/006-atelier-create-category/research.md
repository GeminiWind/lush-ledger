# Research: Atelier Create Category

## Decision 1: Reuse Existing Add Category Modal Entry Point

- Decision: Keep `src/features/atelier/dialogs/AddCategoryModal.tsx` as the create entry point and align its trigger UI with the Atelier list asset reference.
- Rationale: The trigger already exists in the Atelier module and is the lowest-risk path to match requested flow from list screen to modal.
- Alternatives considered:
  - Create a new page route for category creation: adds navigation complexity and conflicts with in-context modal requirement.
  - Add a second trigger component: increases UI duplication and maintenance overhead.

## Decision 2: Keep Backend Create Ownership in POST /api/categories

- Decision: Continue using `POST /api/categories` as the single authoritative create endpoint for category + monthly snapshot persistence.
- Rationale: Existing route already handles auth, cap checks, and snapshot writes; extending it is safer than adding a parallel endpoint.
- Alternatives considered:
  - Add a new `/api/atelier/categories` endpoint: unnecessary surface area and duplicate logic.
  - Perform direct client-side writes: violates current server ownership and auth/data-scope constraints.

## Decision 3: Enforce Duplicate Name Rejection at API Layer

- Decision: Add/confirm duplicate-category validation in the create API for same user and month context and return actionable error payload.
- Rationale: Spec requires duplicate prevention and server-side enforcement is the only trustworthy guard against race conditions.
- Alternatives considered:
  - Frontend-only duplicate checks: bypassable and stale when concurrent changes occur.
  - Allow duplicates and rely on icon/limit distinction: conflicts with explicit FR-007.

## Decision 4: Keep Immediate Post-Create Refresh Pattern

- Decision: Keep success path as modal close + success feedback + `router.refresh()` to sync Atelier list.
- Rationale: This matches existing repository pattern for server-rendered dashboard sections and avoids dual client caches.
- Alternatives considered:
  - Optimistic in-place list insertion: faster but adds reconciliation complexity and drift risk with server-derived list state.
  - Full hard navigation reload: higher UX cost and unnecessary scope expansion.

## Decision 5: Keep Validation Split (Client UX + Server Authority)

- Decision: Keep lightweight immediate client validation for required/range checks while server remains final validator for all create rules.
- Rationale: Users get fast feedback without sacrificing correctness and security.
- Alternatives considered:
  - Server-only validation: accurate but slower iteration for users.
  - Heavy duplicated schema in client and server: higher maintenance burden without proportionate gain for this feature.

## Design Asset Implementation Notes

### Trigger Card Reference (`specs/005-atelier-list/assets/atelier-list.html`)

- The Add New Category entry should remain inside Atelier list context and behave as an inline card trigger, not a separate page action.
- Trigger copy should remain "Add New Category" to preserve scan consistency with existing Atelier list language.
- Trigger keeps card-level affordance (icon + label) and opens the modal in-place.

### Modal Reference (`specs/006-atelier-create-category/assets/add-category-modal-full-icon-grid.html`)

- Modal content order should follow design structure: name -> icon grid -> monthly limit -> toggles -> warn-at -> actions.
- Icon selection should stay in a grid with a clear selected state and should not navigate away from modal.
- Primary action remains Add Category; secondary path remains non-destructive dismiss/discard.
