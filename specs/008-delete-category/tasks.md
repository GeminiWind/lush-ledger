# Tasks: Atelier Delete Category

## Metadata

- **Name**: Atelier Delete Category
- **Last Updated**: 2026-04-29
- **Updated By**: OpenCode Agent
- **Version**: v1.0.0

**Input**: Design documents from `/specs/008-delete-category/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`

**Tests**: Test tasks are REQUIRED for each user story and changed shared behavior (NFR-002).

**Organization**: Tasks grouped by user story for independent implementation and validation.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Ensure runtime/test scaffolding for delete-category slice is ready.

- [x] SHARED-T001 Verify feature docs and design assets exist in `specs/008-delete-category/` and `specs/008-delete-category/assets/`
- [x] SHARED-T002 Confirm Playwright + Vitest commands for this feature in `package.json` and `playwright.config.ts`
- [ ] SHARED-T003 [P] Add/confirm generated artifact ignore rules in `.gitignore`

**Checkpoint**: Shared scaffolding verified.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend/frontend prerequisites required before user stories.

**⚠️ CRITICAL**: No user story work starts before this phase completes.

### Backend
- [x] BE-FOUND-T001 Add soft-delete support fields/guards for category model usage in `src/app/api/categories/[id]/route.ts` and Prisma query filters (FR-003)
- [x] BE-FOUND-T002 [P] Add helper to resolve/create user system `Uncategorized` category in `src/lib/` or `src/features/atelier/` service module (FR-004)
- [x] BE-FOUND-T003 [P] Standardize delete error response helpers for `401/404/400/500` in `src/app/api/categories/[id]/route.ts` (`contracts/delete-categories-id.md`)

### Frontend
- [x] FE-FOUND-T001 [P] Confirm shared delete-dialog state wiring points in `src/features/atelier/components/CategoryAtelierGrid.tsx` and related props contracts

### Shared
- [x] SHARED-T004 Define/verify localization keys for delete dialog copy and recoverable errors in `src/features/i18n/locales/en.json` and `src/features/i18n/locales/vi.json`

**Checkpoint**: Foundation complete; user stories can proceed.

---

## Phase 3: User Story 1 - Delete an Existing Category (Priority: P1) 🎯 MVP

**Goal**: User confirms deletion and category is removed from active Atelier list.

**Independent Test**: From `/app/atelier`, open delete dialog for a category, confirm delete, category disappears from active list, API returns success.

### Tests for User Story 1 (REQUIRED)

- [x] TEST-BE-US1-T001 [P] [US1] Add contract test for successful `DELETE /api/categories/{id}` in `tests/contract/category-api.contract.test.ts` (`contracts/delete-categories-id.md`)
- [x] TEST-FE-US1-T001 [P] [US1] Add integration test for confirm-delete success flow in `tests/integration/atelier-delete-category-dialog.integration.test.tsx` (FR-001, FR-010)
- [x] TEST-E2E-US1-T001 [P] [US1] Add/extend E2E success delete flow in `tests/e2e/delete-category.spec.ts`

### Implementation for User Story 1

- [x] FE-US1-T001 [US1] Implement delete trigger action on category row in `src/features/atelier/components/CategoryAtelierGrid.tsx` (FR-008)
- [x] FE-US1-T002 [US1] Implement Stitch-aligned delete confirmation modal shell in `src/features/atelier/dialogs/DeleteCategoryDialog.tsx`
- [x] FE-US1-T003 [US1] Wire confirm action to delete mutation and success-close refresh behavior in `src/features/atelier/dialogs/DeleteCategoryDialog.tsx` and related query invalidation hooks (FR-010)
- [x] BE-US1-T001 [US1] Implement successful delete route transaction flow in `src/app/api/categories/[id]/route.ts` (`contracts/delete-categories-id.md`) (FR-003, FR-005)
- [x] INT-US1-T001 [US1] Map backend success payload to frontend list refresh/update behavior in `src/features/atelier/components/CategoryAtelierGrid.tsx` and `src/features/atelier/dialogs/DeleteCategoryDialog.tsx`

### Done Criteria for User Story 1
- [ ] TEST-BE-US1-T001, TEST-FE-US1-T001, TEST-E2E-US1-T001 pass
- [ ] Category removed from active list after confirm
- [ ] API contract success path satisfied

**Checkpoint**: MVP delete flow works independently.

---

## Phase 4: User Story 2 - Prevent Accidental Deletion (Priority: P1)

**Goal**: Cancel/dismiss paths never delete data and pending requests block duplicate submissions.

**Independent Test**: Open dialog then cancel via cancel button, close button, outside click, Esc; verify no deletion. During pending, confirm action is disabled.

### Tests for User Story 2 (REQUIRED)

- [x] TEST-FE-US2-T001 [P] [US2] Add integration tests for cancel/close/outside/Esc dismiss paths in `tests/integration/atelier-delete-category-dialog.integration.test.tsx` (FR-011)
- [x] TEST-FE-US2-T002 [P] [US2] Add pending-state duplicate-submit prevention test in `tests/integration/atelier-delete-category-dialog.integration.test.tsx` (FR-009)
- [x] TEST-E2E-US2-T001 [P] [US2] Add E2E no-delete-on-cancel test in `tests/e2e/delete-category.spec.ts`

### Implementation for User Story 2

- [x] FE-US2-T001 [US2] Implement cancel and close button behaviors in `src/features/atelier/dialogs/DeleteCategoryDialog.tsx` (FR-011)
- [x] FE-US2-T002 [US2] Implement outside-click and Esc dismiss behavior in `src/features/atelier/dialogs/DeleteCategoryDialog.tsx` (FR-011)
- [x] FE-US2-T003 [US2] Disable repeat confirm while mutation pending in `src/features/atelier/dialogs/DeleteCategoryDialog.tsx` (FR-009)
- [x] INT-US2-T001 [US2] Ensure dismiss actions do not call delete API in `src/features/atelier/dialogs/DeleteCategoryDialog.tsx`

### Done Criteria for User Story 2
- [ ] All US2 tests pass
- [ ] No deletion on any dismiss/cancel path
- [ ] Duplicate submit blocked while pending

**Checkpoint**: Safety guardrails independently validated.

---

## Phase 5: User Story 3 - Preserve Transaction Continuity (Priority: P2)

**Goal**: Deleting in-use category keeps transactions accessible by reassigning them to system `Uncategorized` category.

**Independent Test**: Delete category linked to transactions; verify transactions remain visible and category mapping moved to `Uncategorized`.

### Tests for User Story 3 (REQUIRED)

- [x] TEST-BE-US3-T001 [P] [US3] Add contract/integration test for reassignment behavior in `tests/contract/category-api.contract.test.ts` (FR-004)
- [x] TEST-BE-US3-T002 [P] [US3] Add backend not-found/already-soft-deleted contract test in `tests/contract/category-api.contract.test.ts` (FR-012)
- [x] TEST-FE-US3-T001 [P] [US3] Add integration test for recoverable failure rendering in delete dialog in `tests/integration/atelier-delete-category-dialog.integration.test.tsx` (FR-013, FR-014)
- [x] TEST-E2E-US3-T001 [P] [US3] Add E2E flow for delete in-use category and verify ledger continuity in `tests/e2e/delete-category.spec.ts`

### Implementation for User Story 3

- [x] BE-US3-T001 [US3] Implement transaction reassignment to user system `Uncategorized` category in `src/app/api/categories/[id]/route.ts` (FR-004)
- [x] BE-US3-T002 [US3] Implement `404` behavior for missing/already-soft-deleted category in `src/app/api/categories/[id]/route.ts` (FR-012)
- [x] BE-US3-T003 [US3] Implement ownership/auth guards for delete endpoint in `src/app/api/categories/[id]/route.ts` (FR-006, FR-007)
- [x] FE-US3-T001 [US3] Map structured backend error payloads to retryable dialog messages in `src/features/atelier/dialogs/DeleteCategoryDialog.tsx` (FR-013, FR-014)
- [x] INT-US3-T001 [US3] Verify response contract mapping for reassignment metadata in frontend mutation handling in `src/features/atelier/dialogs/DeleteCategoryDialog.tsx` (`contracts/delete-categories-id.md`)

### Done Criteria for User Story 3
- [ ] All US3 tests pass
- [ ] Transactions remain accessible after delete
- [ ] Reassignment + `404` semantics conform to contract

**Checkpoint**: Data continuity and error semantics independently validated.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening, docs, and quality gates.

- [ ] SHARED-T005 [P] Update `docs/codebase-summary.md` with delete-category behavior and new flow
- [ ] SHARED-T006 [P] Update `docs/system-architecture.md` with soft-delete + reassignment semantics
- [ ] SHARED-T007 [P] Update `docs/project-roadmap.md` with feature status and delivered scope
- [ ] SHARED-T008 Run full quality gates in repo root: `npm run lint`, `npm run build`, and targeted tests from `specs/008-delete-category/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 -> Phase 2 -> Phase 3/4/5 -> Phase 6
- User stories depend on foundational completion.
- Preferred implementation order for risk: US1 -> US2 -> US3.

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories after foundational.
- **US2 (P1)**: Depends on US1 modal trigger/shell being present.
- **US3 (P2)**: Depends on US1 endpoint/mutation baseline.

---

## Parallel Execution Opportunities

- Setup parallel: `SHARED-T003`
- Foundational parallel: `BE-FOUND-T002`, `BE-FOUND-T003`, `FE-FOUND-T001`
- US1 parallel tests: `TEST-BE-US1-T001`, `TEST-FE-US1-T001`, `TEST-E2E-US1-T001`
- US2 parallel tests: all `TEST-*US2*`
- US3 parallel tests: all `TEST-*US3*`
- Polish parallel docs: `SHARED-T005`, `SHARED-T006`, `SHARED-T007`

### Parallel Example: User Story 1

```bash
# Parallel test authoring
TEST-BE-US1-T001
TEST-FE-US1-T001
TEST-E2E-US1-T001

# Parallel implementation on different files
FE-US1-T001
FE-US1-T002
BE-US1-T001
```

---

## Implementation Strategy

### MVP First

1. Complete Phases 1-2
2. Deliver Phase 3 (US1)
3. Validate US1 independently, demo

### Incremental Delivery

1. Add US2 safety behaviors
2. Add US3 continuity + edge semantics
3. Run Phase 6 polish and docs gates

### Suggested MVP Scope

- US1 only (delete confirm success path) after foundation.
