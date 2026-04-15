# Tasks: Atelier Create Category

## Metadata

- **Name**: Atelier Create Category
- **Last Updated**: 2026-04-14
- **Updated By**: OpenCode Agent
- **Version**: v1.0.0

**Input**: Design documents from `/specs/006-atelier-create-category/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/post-api-categories.md`, `quickstart.md`

**Tests**: Test tasks are REQUIRED for each user story and any changed shared behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm scope, design references, and touched files before implementation starts.

- [x] SHARED-T001 Align clarified spec decisions in `specs/006-atelier-create-category/plan.md` (FR-007, FR-018, FR-019, FR-020)
- [x] SHARED-T002 [P] Review and annotate trigger/card reference from `specs/005-atelier-list/assets/atelier-list.html` for implementation notes in `specs/006-atelier-create-category/research.md`
- [x] SHARED-T003 [P] Review and annotate modal reference from `specs/006-atelier-create-category/assets/add-category-modal-full-icon-grid.html` for implementation notes in `specs/006-atelier-create-category/research.md`
- [x] SHARED-T004 Create integration test scaffold `tests/integration/atelier-create-category-modal.integration.test.tsx`

**Checkpoint**: Scope, design references, and implementation entry points are validated.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared API and UI foundations required by all user stories.

**⚠️ CRITICAL**: No user story work starts until this phase is complete.

- [x] BE-FOUND-T001 Add normalized category name helper for duplicate checks in `src/app/api/categories/route.ts` (FR-007)
- [x] BE-FOUND-T002 Implement duplicate-name rejection across all months for the authenticated user in `src/app/api/categories/route.ts` (FR-007)
- [x] BE-FOUND-T003 Implement structured create error payload shape with field-level `errors` and optional top-level `error` in `src/app/api/categories/route.ts` (FR-019) (`specs/006-atelier-create-category/contracts/post-api-categories.md`)
- [x] FE-FOUND-T001 [P] Add create-category response/error parsing utility in `src/features/atelier/services/index.ts` (`specs/006-atelier-create-category/contracts/post-api-categories.md`)
- [x] FE-FOUND-T002 [P] Add or update locale strings for duplicate-name inline error and recoverable create failures in `src/features/i18n/locales/en.json` and `src/features/i18n/locales/vi.json` (FR-016, FR-020)

**Checkpoint**: Completed - backend and frontend foundational tasks are complete.

---

## Phase 3: User Story 1 - Create a Category From Atelier List (Priority: P1) 🎯 MVP

**Goal**: User opens Add Category modal from Atelier list, submits valid data, and sees the new category in the refreshed list.

**Independent Test**: Open `/app/atelier`, launch modal from Add New Category card, submit valid values, verify modal closes and new category appears after refresh.

### Tests for User Story 1 (REQUIRED)

- [x] TEST-BE-US1-T001 [P] [US1] Extend create success and month-write contract coverage in `tests/contract/category-api.contract.test.ts` (FR-008, FR-013, FR-018) (`specs/006-atelier-create-category/contracts/post-api-categories.md`)
- [x] TEST-FE-US1-T001 [P] [US1] Add modal open and successful submit integration test in `tests/integration/atelier-create-category-modal.integration.test.tsx` (FR-012, FR-013)

### Implementation for User Story 1

- [x] FE-US1-T001 [US1] Render Add New Category modal trigger in Atelier list context within `src/features/atelier/pages/AtelierPageView.tsx` (FR-012)
- [x] FE-US1-T002 [US1] Update Add Category trigger card structure and styles to follow Atelier list asset in `src/features/atelier/dialogs/AddCategoryModal.tsx` (FR-012)
- [x] FE-US1-T003 [US1] Wire submit mutation through shared `createCategory` service in `src/features/atelier/dialogs/AddCategoryModal.tsx` and `src/features/atelier/services/index.ts` (`specs/006-atelier-create-category/contracts/post-api-categories.md`)
- [x] BE-US1-T001 [US1] Ensure create route always writes to real current calendar month and next month snapshot in `src/app/api/categories/route.ts` (FR-018)
- [x] BE-US1-T002 [US1] Preserve atomic create of `Category` and `CategoryMonthlyLimit` rows in `src/app/api/categories/route.ts` (FR-006, FR-008)
- [x] INT-US1-T001 [US1] Map successful API response to modal close, success feedback, and `router.refresh()` in `src/features/atelier/dialogs/AddCategoryModal.tsx` (FR-013) (`specs/006-atelier-create-category/contracts/post-api-categories.md`)

**Checkpoint**: US1 is independently functional and demoable.

---

## Phase 4: User Story 2 - Validate Inputs and Recover Quickly (Priority: P1)

**Goal**: User receives actionable validation feedback, including duplicate-name conflicts, without losing non-conflicting modal input.

**Independent Test**: Submit invalid values (blank name, invalid limit/warnAt, duplicate name), verify inline errors and preserved input state.

### Tests for User Story 2 (REQUIRED)

- [x] TEST-BE-US2-T001 [P] [US2] Add duplicate-name and structured validation-error contract coverage in `tests/contract/category-api.contract.test.ts` (FR-007, FR-019) (`specs/006-atelier-create-category/contracts/post-api-categories.md`)
- [x] TEST-FE-US2-T001 [P] [US2] Add invalid-input and duplicate-conflict modal integration scenarios in `tests/integration/atelier-create-category-modal.integration.test.tsx` (FR-001, FR-004, FR-005, FR-020)

### Implementation for User Story 2

- [x] FE-US2-T001 [US2] Implement/confirm client-side validation for name, monthly limit, and warn-at fields in `src/features/atelier/dialogs/AddCategoryModal.tsx` (FR-001, FR-002, FR-004, FR-005)
- [x] FE-US2-T002 [US2] Map API field-level `errors` to inline form errors in `src/features/atelier/dialogs/AddCategoryModal.tsx` (FR-016, FR-019)
- [x] FE-US2-T003 [US2] Handle duplicate conflict as inline category-name error while preserving non-conflicting inputs in `src/features/atelier/dialogs/AddCategoryModal.tsx` (FR-020)
- [x] BE-US2-T001 [US2] Return field-level error payloads for create validation failures in `src/app/api/categories/route.ts` (FR-019)
- [ ] INT-US2-T001 [US2] Ensure non-validation failures render recoverable top-level feedback without clearing modal state in `src/features/atelier/dialogs/AddCategoryModal.tsx` (FR-017)

**Checkpoint**: US2 is independently functional and demoable.

---

## Phase 5: User Story 3 - Exit Without Saving (Priority: P2)

**Goal**: User can dismiss the modal safely through all supported exit paths without creating a category.

**Independent Test**: Open modal and dismiss via close affordance, discard action, outside click, and `Esc`; confirm no category is created.

### Tests for User Story 3 (REQUIRED)

- [x] TEST-FE-US3-T001 [P] [US3] Add modal dismissal-path integration tests in `tests/integration/atelier-create-category-modal.integration.test.tsx` (FR-015)

### Implementation for User Story 3

- [x] FE-US3-T001 [US3] Implement explicit close button dismiss behavior in `src/features/atelier/dialogs/AddCategoryModal.tsx` (FR-015)
- [x] FE-US3-T002 [US3] Implement discard action behavior that closes modal without mutation in `src/features/atelier/dialogs/AddCategoryModal.tsx` (FR-015)
- [x] FE-US3-T003 [US3] Confirm outside-click and `Esc` dismissal preserve non-persisted behavior in `src/features/atelier/dialogs/AddCategoryModal.tsx` (FR-015)

**Checkpoint**: US3 is independently functional and demoable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency, documentation, and quality-gate validation across stories.

- [ ] SHARED-T005 Update contract examples and wording to match clarified duplicate scope and error shape in `specs/006-atelier-create-category/contracts/post-api-categories.md`
- [ ] SHARED-T006 [P] Update entity constraints to match clarified duplicate scope in `specs/006-atelier-create-category/data-model.md`
- [ ] SHARED-T007 [P] Update feature documentation deltas in `docs/codebase-summary.md`, `docs/system-architecture.md`, and `docs/project-roadmap.md`
- [ ] SHARED-T008 Run and record quality gates in `specs/006-atelier-create-category/quickstart.md` using `npm run lint`, `npm run test -- category-api.contract.test.ts atelier-create-category-modal.integration.test.tsx`, and `npm run build` (NFR-001, NFR-002)

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 -> no dependencies
- Phase 2 -> depends on Phase 1
- Phase 3 (US1) -> depends on Phase 2
- Phase 4 (US2) -> depends on Phase 2; can run after US1 or in parallel once shared foundations are stable
- Phase 5 (US3) -> depends on Phase 2; can run after US1 modal baseline exists
- Phase 6 -> depends on completion of selected user stories

### User Story Dependency Graph

- US1 (P1) -> unlocks practical baseline for US2 and US3
- US2 (P1) -> independent validation/error behavior on top of US1 create path
- US3 (P2) -> independent dismissal behavior on top of US1 modal shell

Graph: `US1 -> {US2, US3}`

---

## Parallel Execution Examples

### User Story 1

```bash
# Parallel test tasks
TEST-BE-US1-T001
TEST-FE-US1-T001

# Parallel implementation tasks after FE-US1-T001 baseline
FE-US1-T002
BE-US1-T001
```

### User Story 2

```bash
# Parallel test tasks
TEST-BE-US2-T001
TEST-FE-US2-T001

# Parallel implementation tasks
FE-US2-T001
BE-US2-T001
```

### User Story 3

```bash
# Parallelizable with non-overlapping files from other stories
TEST-FE-US3-T001
SHARED-T007
```

---

## Implementation Strategy

### MVP First (US1 only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate US1 independently before adding more scope.

### Incremental Delivery

1. Deliver US1 (create flow).
2. Deliver US2 (validation and recoverability).
3. Deliver US3 (safe dismissal paths).
4. Finish with Phase 6 polish and quality gates.

### Completeness Check

- Each user story has explicit tests and implementation tasks.
- Each user story has an independent test criterion.
- Tasks reference concrete file paths and relevant FR/contract links.
- Task lines follow required checklist format.

## Changelog

| Version | Date | Updated By | Change Summary |
|---------|------|------------|----------------|
| v1.0.0 | 2026-04-14 | OpenCode Agent | Initial story-organized executable task list generated from current spec, plan, data model, contract, and research artifacts. |
