---
description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

## Metadata

- **Name**: [FEATURE NAME]
- **Last Updated**: [DATE]
- **Updated By**: [NAME/ROLE]
- **Version**: [e.g., v1.0.0]

**Input**: Design documents from `/specs/[###-feature-name]/`  
**Prerequisites**: `plan.md` (required), `spec.md` (required for user stories), `research.md`, `data-model.md`, `contracts/`

**Tests**: Test tasks are REQUIRED for each user story and for any changed shared behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions
- Reference related functional requirements when applicable, e.g. `(FR-001, FR-004)`
- Reference related API contract files when applicable, e.g. `(contracts/post-products.md)`

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `frontend/src/`, `backend/src/`, `frontend/tests/`, `backend/tests/`, `tests/e2e/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Always align paths with the actual structure defined in `plan.md`

<!--
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.

  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/
  - UI ↔ API Mapping from plan.md

  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered independently

  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and base structure required by all stories

### Shared
- [ ] SHARED-T001 Create feature directories per `plan.md`
- [ ] SHARED-T002 Initialize or update frontend/backend dependencies required for this feature
- [ ] SHARED-T003 [P] Configure linting, formatting, and type-checking tools if changed by this feature
- [ ] SHARED-T004 [P] Create base test directories and test runner configuration for FE, BE, and E2E if needed

**Checkpoint**: Base structure is ready for foundational work

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before user story work begins

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on actual feature scope):

### Backend
- [ ] BE-FOUND-T005 Setup or update shared data models referenced in `data-model.md`
- [ ] BE-FOUND-T006 [P] Setup or extend authentication / authorization framework required by the feature
- [ ] BE-FOUND-T007 [P] Setup or extend API routing, middleware, and shared error handling
- [ ] BE-FOUND-T008 Create shared contract helpers / validation schema foundations if required


### Frontend
- [ ] FE-FOUND-T009 [P] Setup shared frontend data-fetching, API client, or query utilities

### Shared
- [ ] SHARED-T010 Configure environment variables / runtime configuration required by the feature
- [ ] SHARED-T011 Configure logging / monitoring hooks used across user stories

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (REQUIRED) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

#### Frontend Tests
- [ ] TEST-FE-US1-T012 [P] Add component / interaction test for [user flow] in `frontend/tests/integration/test_[name].tsx`
- [ ] TEST-FE-US1-T013 [P] Add frontend validation / state test for [form/component] in `frontend/tests/unit/test_[name].tsx` (FR-001, FR-002)

#### Backend Tests
- [ ] TEST-BE-US1-T014 [P] Add contract test for [METHOD] [endpoint] in `backend/tests/contract/test_[name].py` (`contracts/[file].md`)
- [ ] TEST-BE-US1-T015 [P] Add backend integration test for [user journey] in `backend/tests/integration/test_[name].py`

#### End-to-End Test
- [ ] TEST-E2E-US1-T016 [P] Add E2E test for [story flow] in `tests/e2e/test_[name].spec.ts`

### Implementation for User Story 1

#### Frontend
- [ ] FE-US1-T017 [P] Build [Page/View] in `frontend/src/features/[feature-name]/pages/[Page].tsx`
- [ ] FE-US1-T018 [P]  Build [Component A] in `frontend/src/features/[feature-name]/components/[ComponentA].tsx`
- [ ] FE-US1-T019 Implement form / interaction validation in `frontend/src/features/[feature-name]/components/[Component].tsx` (FR-001, FR-002)
- [ ] FE-US1-T020 Implement UI state handling (loading / error / success) in `frontend/src/features/[feature-name]/hooks/[hook].ts`
- [ ] FE-US1-T021  Wire UI action to API client in `frontend/src/features/[feature-name]/services/[service].ts` (see `UI ↔ API Mapping` in `plan.md`, `contracts/[file].md`)

#### Backend
- [ ] BE-US1-T022 [P]  Create / update [Entity] model in `backend/src/features/[feature-name]/models/[entity].py` (`data-model.md`)
- [ ] BE-US1-T023 [P]  Create / update request / response schema in `backend/src/features/[feature-name]/schemas/[schema].py` (`contracts/[file].md`)
- [ ] BE-US1-T024  Implement validation rules in `backend/src/features/[feature-name]/services/[service].py` (FR-001, FR-002)
- [ ] BE-US1-T025 Implement business rules in `backend/src/features/[feature-name]/services/[service].py` (FR-003, FR-004)
- [ ] BE-US1-T026 Implement permission checks in `backend/src/features/[feature-name]/services/[service].py` (FR-005)
- [ ] BE-US1-T027 Implement [METHOD] [endpoint] in `backend/src/features/[feature-name]/routes/[route].py` (`contracts/[file].md`)
- [ ] BE-US1-T028 Persist and retrieve data in `backend/src/features/[feature-name]/services/[service].py` (FR-006, FR-007)

#### Integration
- [ ] INT-US1-T029  Connect frontend submission flow to [METHOD] [endpoint] via `frontend/src/features/[feature-name]/services/[service].ts` (`contracts/[file].md`) (FE-owned)
- [ ] INT-US1-T030  Map API success response to UI update in `frontend/src/features/[feature-name]/pages/[Page].tsx` (FE-owned)
- [ ] INT-US1-T031  Map structured API errors to UI field / global error states in `frontend/src/features/[feature-name]/components/[Component].tsx`  (FE-owned)
- [ ] INT-US1-T032  Verify data returned by backend matches UI expectations from `plan.md` and `contracts/[file].md` (shared validation)

### Done Criteria for User Story 1
- [ ] All FE, BE, and E2E tests for US1 pass
- [ ] API contract for US1 is satisfied
- [ ] UI behavior matches spec and plan
- [ ] Story is independently testable and demoable

**Checkpoint**: User Story 1 should now be fully functional and independently testable

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (REQUIRED) ⚠️

#### Frontend Tests
- [ ] TEST-FE-US2-T033 [P]  Add component / interaction test for [user flow] in `frontend/tests/integration/test_[name].tsx`
- [ ] TEST-FE-US2-T034 [P]  Add frontend validation / state test in `frontend/tests/unit/test_[name].tsx`

#### Backend Tests
- [ ] TEST-BE-US2-T035 [P]  Add contract test for [METHOD] [endpoint] in `backend/tests/contract/test_[name].py` (`contracts/[file].md`)
- [ ] TEST-BE-US2-T036 [P]  Add backend integration test in `backend/tests/integration/test_[name].py`

#### End-to-End Test
- [ ] TEST-E2E-US2-T037 [P]  Add E2E test for [story flow] in `tests/e2e/test_[name].spec.ts`

### Implementation for User Story 2

#### Frontend
- [ ] FE-US2-T038 [P]  Build / update [Page/View] in `frontend/src/features/[feature-name]/pages/[Page].tsx`
- [ ] FE-US2-T039 [P]  Build / update [Component] in `frontend/src/features/[feature-name]/components/[Component].tsx`
- [ ] FE-US2-T040  Implement frontend validation / state handling (FR-xxx)
- [ ] FE-US2-T041  Wire UI action to API client (`contracts/[file].md`)

#### Backend
- [ ] BE-US2-T042 [P]  Create / update model or schema in `backend/src/features/[feature-name]/models/[entity].py`
- [ ] BE-US2-T043  Implement service logic in `backend/src/features/[feature-name]/services/[service].py` (FR-xxx)
- [ ] BE-US2-T044  Implement endpoint in `backend/src/features/[feature-name]/routes/[route].py` (`contracts/[file].md`)

#### Integration
- [ ] INT-US2-T045  Connect frontend with backend contract (`contracts/[file].md`)
- [ ] INT-US2-T046  Map response and error states to UI
- [ ] INT-US2-T047  Verify this story remains independently testable

### Done Criteria for User Story 2
- [ ] All FE, BE, and E2E tests for US2 pass
- [ ] API contract for US2 is satisfied
- [ ] UI behavior matches spec and plan
- [ ] Story is independently testable and demoable

**Checkpoint**: User Stories 1 and 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (REQUIRED) ⚠️

#### Frontend Tests
- [ ] TEST-FE-US3-T048 [P]  Add component / interaction test for [user flow] in `frontend/tests/integration/test_[name].tsx`
- [ ] TEST-FE-US3-T049 [P]  Add frontend validation / state test in `frontend/tests/unit/test_[name].tsx`

#### Backend Tests
- [ ] TEST-BE-US3-T050 [P]  Add contract test for [METHOD] [endpoint] in `backend/tests/contract/test_[name].py` (`contracts/[file].md`)
- [ ] TEST-BE-US3-T051 [P]  Add backend integration test in `backend/tests/integration/test_[name].py`

#### End-to-End Test
- [ ] TEST-E2E-US3-T052 [P]  Add E2E test for [story flow] in `tests/e2e/test_[name].spec.ts`

### Implementation for User Story 3

#### Frontend
- [ ] FE-US3-T053 [P] Build / update [Page/View] in `frontend/src/features/[feature-name]/pages/[Page].tsx`
- [ ] FE-US3-T054 [P]  Build / update [Component] in `frontend/src/features/[feature-name]/components/[Component].tsx`
- [ ] FE-US3-T055  Implement frontend validation / state handling (FR-xxx)
- [ ] FE-US3-T056  Wire UI action to API client (`contracts/[file].md`)

#### Backend
- [ ] BE-US3-T057 [P]  Create / update model or schema in `backend/src/features/[feature-name]/models/[entity].py`
- [ ] BE-US3-T058  Implement service logic in `backend/src/features/[feature-name]/services/[service].py` (FR-xxx)
- [ ] BE-US3-T059  Implement endpoint in `backend/src/features/[feature-name]/routes/[route].py` (`contracts/[file].md`)

#### Integration
- [ ] INT-US3-T060  Connect frontend with backend contract (`contracts/[file].md`)
- [ ] INT-US3-T061  Map response and error states to UI
- [ ] INT-US3-T062  Verify this story remains independently testable

### Done Criteria for User Story 3
- [ ] All FE, BE, and E2E tests for US3 pass
- [ ] API contract for US3 is satisfied
- [ ] UI behavior matches spec and plan
- [ ] Story is independently testable and demoable

**Checkpoint**: All user stories should now be independently functional

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Shared
- [ ] SHARED-T063 [P] Update shared documentation
- [ ] SHARED-T064 Refactor duplicated FE / BE logic
- [ ] TEST-REGRESSION-T065 [P] Add regression tests
- [ ] SHARED-T066 Apply performance optimization
- [ ] SHARED-T067 Apply security hardening
- [ ] SHARED-T068 Run quickstart validation

---

## Execution Rules

- Frontend agent:
  - Execute FE-* and TEST-FE-* tasks
  - Then execute FE-owned INT-* tasks

- Backend agent:
  - Execute BE-* and TEST-BE-* tasks

- Integration tasks:
  - Executed after FE and BE are complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3+)**: Depend on Foundational completion
  - Stories can proceed in parallel if team capacity allows
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational — no dependency on other stories
- **User Story 2 (P2)**: Starts after Foundational — may reuse shared components but must remain independently testable
- **User Story 3 (P3)**: Starts after Foundational — may reuse shared components but must remain independently testable

### Within Each User Story

- Tests MUST be written and fail before implementation
- Frontend UI structure before interaction wiring
- Schemas / models before service logic
- Service logic before endpoint completion
- Integration after FE and BE pieces exist
- Story complete before moving to next priority when working sequentially

### Parallel Opportunities

- All Setup tasks marked `[P]` can run in parallel
- All Foundational tasks marked `[P]` can run in parallel
- Once Foundational completes, different user stories can proceed in parallel
- FE and BE tasks inside a story can often proceed in parallel once contract and model shape are stable
- Tests marked `[P]` can run in parallel
- Independent components / models marked `[P]` can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch FE / BE / E2E tests for User Story 1 together:
Task: "Add component / interaction test for [user flow]"
Task: "Add contract test for [METHOD] [endpoint]"
Task: "Add E2E test for [story flow]"

# Launch independent FE / BE build tasks together:
Task: "Build [Component A] in frontend/src/features/[feature-name]/components/[ComponentA].tsx"
Task: "Create / update [Entity] model in backend/src/features/[feature-name]/models/[entity].py"
Task: "Create / update request / response schema in backend/src/features/[feature-name]/schemas/[schema].py"

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy / demo if ready

### Incremental Delivery

1. Complete Setup + Foundational
2. Add User Story 1 → test independently → deploy / demo
3. Add User Story 2 → test independently → deploy / demo
4. Add User Story 3 → test independently → deploy / demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:

   * Developer A: User Story 1
   * Developer B: User Story 2
   * Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

* `[P]` tasks = different files, no dependencies
* `[Story]` label maps task to specific user story for traceability
* Functional requirements should be referenced where relevant
* API contract files should be referenced for endpoint / integration tasks
* UI ↔ API Mapping in `plan.md` should drive FE/BE integration tasks
* Each user story should be independently completable and testable
* Verify tests fail before implementing
* Commit after each task or logical group
* Stop at checkpoints to validate independently
* Avoid vague tasks, same-file conflicts, and hidden cross-story dependencies

## Changelog

| Version | Date   | Updated By  | Change Summary                             |
| ------- | ------ | ----------- | ------------------------------------------ |
| v1.0.0  | [DATE] | [NAME/ROLE] | Initial task list generated from template. |
