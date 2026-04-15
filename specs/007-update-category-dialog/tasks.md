# Tasks: Atelier Category Update Dialog

## Metadata

- **Name**: Atelier Category Update Dialog
- **Last Updated**: 2026-04-15
- **Updated By**: OpenCode Agent
- **Version**: v1.0.0

**Input**: Design documents from `/specs/007-update-category-dialog/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/patch-categories-id.md`, `quickstart.md`

**Tests**: Test tasks are REQUIRED for each user story and for changed shared behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions
- Reference related functional requirements when applicable
- Reference related API contract files when applicable

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm baseline assets, translation surfaces, and test surfaces before feature changes

### Shared
- [x] SHARED-T001 Confirm update dialog assets exist in `specs/007-update-category-dialog/assets/update-category-modal.png` and `specs/007-update-category-dialog/assets/update-category-modal.html`
- [x] SHARED-T002 Audit existing Atelier edit flow touchpoints in `src/features/atelier/pages/AtelierPageView.tsx`, `src/features/atelier/components/CategoryAtelierGrid.tsx`, and `src/features/atelier/dialogs/EditCategoryModal.tsx`
- [x] SHARED-T003 [P] Inventory i18n keys for edit-category updates in `src/features/i18n/locales/en.json` and `src/features/i18n/locales/vi.json`
- [x] SHARED-T004 [P] Prepare new integration test file scaffold at `tests/integration/atelier-edit-category-modal.integration.test.tsx`

**Checkpoint**: Setup context is ready for foundational implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared request/response and validation foundations used by all stories

**⚠️ CRITICAL**: No user story work begins before this phase is complete

### Backend
- [x] BE-FOUND-T001 Add shared PATCH field-error helper for category updates in `src/app/api/categories/[id]/route.ts` (FR-017, FR-018, FR-020)
- [x] BE-FOUND-T002 Add normalized-name helper and reusable uniqueness lookup for PATCH in `src/app/api/categories/[id]/route.ts` (FR-008)
- [x] BE-FOUND-T003 Finalize PATCH validation helpers and duplicate-name protection in `src/app/api/categories/[id]/route.ts` (`contracts/patch-categories-id.md`) (FR-016, FR-020)

### Frontend
- [x] FE-FOUND-T001 Add update-category error parsing helper with field/global mapping in `src/features/atelier/services/index.ts` (`contracts/patch-categories-id.md`)
- [x] FE-FOUND-T002 [P] Extend edit payload and service error types in `src/features/atelier/types.ts` and `src/features/atelier/services/index.ts` (`data-model.md`)

### Shared
- [x] SHARED-T005 [P] Add/refresh shared copy keys for edit success and validation messages in `src/features/i18n/locales/en.json` and `src/features/i18n/locales/vi.json` (FR-017, FR-018, FR-020)

**Checkpoint**: Shared foundations are complete; user stories can now be implemented independently

---

## Phase 3: User Story 1 - Update an Existing Category (Priority: P1) 🎯 MVP

**Goal**: User opens edit dialog from Atelier list, sees prefilled values, submits valid changes, and sees refreshed category data.

**Independent Test**: From `/app/atelier`, open a category edit dialog, change values, submit once, and verify updated card values after refresh.

### Tests for User Story 1 (REQUIRED) ⚠️

> **NOTE: Write these tests FIRST and ensure they fail before implementation**

#### Frontend Tests
- [x] TEST-FE-US1-T001 [P] [US1] Add modal-open and prefill interaction test in `tests/integration/atelier-edit-category-modal.integration.test.tsx` (FR-005, FR-012)
- [x] TEST-FE-US1-T002 [P] [US1] Add successful submit UI-state test (saving -> success close -> refresh intent) in `tests/integration/atelier-edit-category-modal.integration.test.tsx` (FR-007, FR-013)

#### Backend Tests
- [x] TEST-BE-US1-T001 [P] [US1] Add PATCH success-path contract coverage in `tests/contract/category-api.contract.test.ts` (`contracts/patch-categories-id.md`) (FR-006, FR-007)

### Implementation for User Story 1

#### Frontend
- [x] FE-US1-T001 [US1] Wire category row edit action to open edit dialog in `src/features/atelier/components/CategoryAtelierGrid.tsx` and `src/features/atelier/pages/AtelierPageView.tsx` (FR-012)
- [x] FE-US1-T002 [US1] Update edit dialog title/action copy to explicit update semantics in `src/features/atelier/dialogs/EditCategoryModal.tsx` (FR-013)
- [x] FE-US1-T003 [US1] Ensure dialog prefill/reset behavior uses selected category data on open in `src/features/atelier/dialogs/EditCategoryModal.tsx` (FR-005)
- [x] FE-US1-T004 [US1] Keep loading/disable submit behavior and success close flow on valid update in `src/features/atelier/dialogs/EditCategoryModal.tsx` (FR-015)

#### Backend
- [x] BE-US1-T002 [US1] Enforce positive monthly limit for PATCH and keep existing ownership checks in `src/app/api/categories/[id]/route.ts` (FR-002, FR-010, FR-011)
- [x] BE-US1-T003 [US1] Return updated category payload contract for successful PATCH in `src/app/api/categories/[id]/route.ts` (`contracts/patch-categories-id.md`) (FR-007)

#### Integration
- [x] INT-US1-T001 [US1] Submit typed update payload via service helper in `src/features/atelier/dialogs/EditCategoryModal.tsx` and `src/features/atelier/services/index.ts` (`contracts/patch-categories-id.md`)
- [x] INT-US1-T002 [US1] Invalidate atelier query and refresh route after successful PATCH in `src/features/atelier/dialogs/EditCategoryModal.tsx` (FR-007)

### Done Criteria for User Story 1
- Done: All US1 FE and BE tests pass
- Done: Valid category update path works from list edit trigger to refreshed card data
- Done: Story is independently testable and demoable

**Checkpoint**: MVP edit-update flow is functional

---

## Phase 4: User Story 2 - Handle Validation and Save Failures (Priority: P2)

**Goal**: User receives clear, recoverable feedback for invalid inputs, duplicate names, and server-side failures while retaining entered form data.

**Independent Test**: Trigger each failure mode from edit dialog and verify the modal remains open, message is clear, and user-entered values remain intact.

### Tests for User Story 2 (REQUIRED) ⚠️

#### Frontend Tests
- [x] TEST-FE-US2-T001 [P] [US2] Add inline field-validation error mapping test in `tests/integration/atelier-edit-category-modal.integration.test.tsx` (FR-017)
- [x] TEST-FE-US2-T002 [P] [US2] Add non-field server-error retry guidance rendering test in `tests/integration/atelier-edit-category-modal.integration.test.tsx` (FR-020)

#### Backend Tests
- [x] TEST-BE-US2-T001 [P] [US2] Add case-insensitive PATCH uniqueness test excluding current category in `tests/contract/category-api.contract.test.ts` (FR-008)
- [x] TEST-BE-US2-T002 [P] [US2] Add PATCH contract coverage that update succeeds without original category fields in `tests/contract/category-api.contract.test.ts` (`contracts/patch-categories-id.md`) (FR-016)
- [x] TEST-BE-US2-T003 [P] [US2] Add warn-threshold validation behavior tests for enabled/disabled states in `tests/contract/category-api.contract.test.ts` (FR-003, FR-004, FR-009)

### Implementation for User Story 2

#### Backend
- [x] BE-US2-T001 [US2] Implement case-insensitive duplicate-name protection for PATCH excluding same category in `src/app/api/categories/[id]/route.ts` (FR-008)
- [x] BE-US2-T002 [US2] Remove original-field dependency from PATCH request handling in `src/app/api/categories/[id]/route.ts` (`contracts/patch-categories-id.md`) (FR-016)
- [x] BE-US2-T003 [US2] Implement warning threshold preservation and disabled-state handling in `src/app/api/categories/[id]/route.ts` (FR-003, FR-004, FR-009)
- [x] BE-US2-T004 [US2] Return structured `error` + `errors` payloads for field/business failures in `src/app/api/categories/[id]/route.ts` (FR-017, FR-018)

#### Frontend
- [x] FE-US2-T001 [US2] Map backend field errors to Formik field surfaces in `src/features/atelier/dialogs/EditCategoryModal.tsx` and `src/features/atelier/services/index.ts` (FR-017)
- [x] FE-US2-T002 [US2] Show non-field recoverable global message and preserve user input in `src/features/atelier/dialogs/EditCategoryModal.tsx` (FR-018, FR-020)
- [x] FE-US2-T003 [US2] Keep warning threshold value while warning toggle is off and treat input as inactive in `src/features/atelier/dialogs/EditCategoryModal.tsx` (FR-004, FR-009)

#### Integration
- [x] INT-US2-T001 [US2] Submit PATCH request payload without original category fields from `src/features/atelier/dialogs/EditCategoryModal.tsx` (`contracts/patch-categories-id.md`)
- [x] INT-US2-T002 [US2] Ensure non-success responses do not close dialog and preserve edited state in `src/features/atelier/dialogs/EditCategoryModal.tsx` (FR-018, FR-019)

### Done Criteria for User Story 2
- Done: All US2 FE and BE tests pass
- Done: Validation, duplicate, and save-failure paths are recoverable and clear
- Done: Story is independently testable and demoable

**Checkpoint**: Failure-handling behavior is robust and user-recoverable

---

## Phase 5: User Story 3 - Dismiss Without Changes (Priority: P3)

**Goal**: User can cancel/close editing safely through cancel button, close button, Esc key, and backdrop click without persisting changes.

**Independent Test**: Open edit dialog, modify values, dismiss via each close mechanism, and confirm no category changes are saved.

### Tests for User Story 3 (REQUIRED) ⚠️

#### Frontend Tests
- [x] TEST-FE-US3-T001 [P] [US3] Add dismiss-without-save test for cancel and close button in `tests/integration/atelier-edit-category-modal.integration.test.tsx` (FR-014)
- [x] TEST-FE-US3-T002 [P] [US3] Add Esc/backdrop dismissal behavior test in `tests/integration/atelier-edit-category-modal.integration.test.tsx` (FR-014)

#### Backend Tests
- [x] TEST-BE-US3-T001 [P] [US3] Add no-PATCH-on-dismiss regression assertion via client interaction mock in `tests/integration/atelier-list.integration.test.tsx` (FR-014)

### Implementation for User Story 3

#### Frontend
- [x] FE-US3-T001 [US3] Ensure dismiss handlers reset dialog error and local editing state in `src/features/atelier/dialogs/EditCategoryModal.tsx` (FR-014)
- [x] FE-US3-T002 [US3] Ensure close pathways (cancel/close/Esc/backdrop) are wired consistently in `src/features/atelier/dialogs/EditCategoryModal.tsx` (FR-014)

#### Integration
- [x] INT-US3-T001 [US3] Guard submit path so no API mutation is sent when dialog is dismissed without submit in `src/features/atelier/dialogs/EditCategoryModal.tsx` (FR-006, FR-014)

### Done Criteria for User Story 3
- Done: All US3 tests pass
- Done: All dismiss paths close modal without persistence
- Done: Story is independently testable and demoable

**Checkpoint**: Safe-exit behavior is complete across all dismissal paths

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality gates, docs, and regression coverage updates across stories

### Shared
- [x] SHARED-T006 [P] Update behavior notes in `docs/codebase-summary.md` for edit-category flow, uniqueness, and warning-threshold preservation
- [x] SHARED-T007 [P] Update architecture/API behavior notes in `docs/system-architecture.md` for PATCH validation behavior
- [x] SHARED-T008 [P] Update delivery status and scope notes in `docs/project-roadmap.md` for Atelier category edit capability
- [x] TEST-REGRESSION-T001 [P] Add regression coverage for any discovered cross-story defects in `tests/integration/atelier-edit-category-modal.integration.test.tsx` and `tests/contract/category-api.contract.test.ts`
- [x] SHARED-T009 Run lint and build gates via `npm run lint` and `npm run build` and record outcomes in `specs/007-update-category-dialog/quickstart.md` (NFR-001)
- [x] SHARED-T010 Run quickstart verification checklist in `specs/007-update-category-dialog/quickstart.md` and capture completion notes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Starts immediately
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks all user stories
- **Phase 3 (US1)**: Depends on Phase 2; MVP slice
- **Phase 4 (US2)**: Depends on Phase 3 baseline edit flow and Phase 2 foundations
- **Phase 5 (US3)**: Depends on Phase 3 modal wiring; can run after US1 completion
- **Phase 6 (Polish)**: Depends on completion of all targeted stories

### User Story Dependencies

- **US1 (P1)**: Independent after foundations; required MVP
- **US2 (P2)**: Builds on US1 submit path
- **US3 (P3)**: Builds on US1 dialog open/close wiring, independent from US2 validation logic

### Within Each User Story

- Write tests first and confirm fail state
- Implement FE/BE changes
- Complete integration tasks
- Validate independent test criteria before moving on

---

## Parallel Opportunities

- **Phase 1**: `SHARED-T003` and `SHARED-T004` can run in parallel
- **Phase 2**: `FE-FOUND-T002` and `SHARED-T005` can run in parallel with backend helper setup once utility signatures are agreed
- **US1**: `TEST-FE-US1-T001`, `TEST-FE-US1-T002`, and `TEST-BE-US1-T001` can run in parallel
- **US2**: all three backend test tasks plus two frontend test tasks are parallelizable
- **US3**: both frontend tests and regression assertion task can run in parallel
- **Polish**: documentation updates and regression task can run in parallel before final gates

---

## Parallel Example: User Story 1

```bash
# Parallel test authoring
Task: TEST-FE-US1-T001
Task: TEST-FE-US1-T002
Task: TEST-BE-US1-T001

# Parallel implementation split after tests are committed
Task: FE-US1-T001
Task: BE-US1-T002
```

## Parallel Example: User Story 2

```bash
# Parallel backend validation test work
Task: TEST-BE-US2-T001
Task: TEST-BE-US2-T002
Task: TEST-BE-US2-T003

# Parallel frontend failure-state work
Task: FE-US2-T001
Task: FE-US2-T002
```

## Parallel Example: User Story 3

```bash
# Parallel dismissal-path verification
Task: TEST-FE-US3-T001
Task: TEST-FE-US3-T002
Task: TEST-BE-US3-T001
```

---

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1 and Phase 2
2. Complete Phase 3 (US1)
3. Validate US1 independently on `/app/atelier`
4. Demo MVP update flow

### Incremental Delivery

1. Add US2 for validation and failure resilience
2. Validate US2 independently
3. Add US3 dismiss-without-save behavior
4. Finish polish and gates

### Team Parallel Strategy

1. One engineer handles backend route + contract tests
2. One engineer handles modal/grid UI + integration tests
3. One engineer handles i18n/docs/regression tasks

---

## Notes

- `[P]` tasks are scoped to separate files to reduce merge overlap
- Story labels (`[US1]`, `[US2]`, `[US3]`) preserve traceability to spec stories
- Contract-sensitive tasks reference `contracts/patch-categories-id.md`
- Functional requirements are included on relevant tasks for validation mapping

## Changelog

| Version | Date | Updated By | Change Summary |
|---------|------|------------|----------------|
| v1.0.0 | 2026-04-15 | OpenCode Agent | Initial executable task list generated from spec, plan, data model, research, contracts, and quickstart. |
