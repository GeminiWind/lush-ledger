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

- [ ] T001 Create feature directories per `plan.md`
- [ ] T002 Initialize or update frontend/backend dependencies required for this feature
- [ ] T003 [P] Configure linting, formatting, and type-checking tools if changed by this feature
- [ ] T004 [P] Create base test directories and test runner configuration for FE, BE, and E2E if needed

**Checkpoint**: Base structure is ready for foundational work

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before user story work begins

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on actual feature scope):

- [ ] T005 Setup or update shared data models referenced in `data-model.md`
- [ ] T006 [P] Setup or extend authentication / authorization framework required by the feature
- [ ] T007 [P] Setup or extend API routing, middleware, and shared error handling
- [ ] T008 [P] Setup shared frontend data-fetching, API client, or query utilities
- [ ] T009 Configure environment variables / runtime configuration required by the feature
- [ ] T010 Create shared contract helpers / validation schema foundations if required
- [ ] T011 Configure logging / monitoring hooks used across user stories

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (REQUIRED) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

#### Frontend Tests
- [ ] T012 [P] [US1] Add component / interaction test for [user flow] in `frontend/tests/integration/test_[name].tsx`
- [ ] T013 [P] [US1] Add frontend validation / state test for [form/component] in `frontend/tests/unit/test_[name].tsx` (FR-001, FR-002)

#### Backend Tests
- [ ] T014 [P] [US1] Add contract test for [METHOD] [endpoint] in `backend/tests/contract/test_[name].py` (`contracts/[file].md`)
- [ ] T015 [P] [US1] Add backend integration test for [user journey] in `backend/tests/integration/test_[name].py`

#### End-to-End Test
- [ ] T016 [P] [US1] Add E2E test for [story flow] in `tests/e2e/test_[name].spec.ts`

### Implementation for User Story 1

#### Frontend
- [ ] T017 [P] [US1] Build [Page/View] in `frontend/src/features/[feature-name]/pages/[Page].tsx`
- [ ] T018 [P] [US1] Build [Component A] in `frontend/src/features/[feature-name]/components/[ComponentA].tsx`
- [ ] T019 [US1] Implement form / interaction validation in `frontend/src/features/[feature-name]/components/[Component].tsx` (FR-001, FR-002)
- [ ] T020 [US1] Implement UI state handling (loading / error / success) in `frontend/src/features/[feature-name]/hooks/[hook].ts`
- [ ] T021 [US1] Wire UI action to API client in `frontend/src/features/[feature-name]/services/[service].ts` (see `UI ↔ API Mapping` in `plan.md`, `contracts/[file].md`)

#### Backend
- [ ] T022 [P] [US1] Create / update [Entity] model in `backend/src/features/[feature-name]/models/[entity].py` (`data-model.md`)
- [ ] T023 [P] [US1] Create / update request / response schema in `backend/src/features/[feature-name]/schemas/[schema].py` (`contracts/[file].md`)
- [ ] T024 [US1] Implement validation rules in `backend/src/features/[feature-name]/services/[service].py` (FR-001, FR-002)
- [ ] T025 [US1] Implement business rules in `backend/src/features/[feature-name]/services/[service].py` (FR-003, FR-004)
- [ ] T026 [US1] Implement permission checks in `backend/src/features/[feature-name]/services/[service].py` (FR-005)
- [ ] T027 [US1] Implement [METHOD] [endpoint] in `backend/src/features/[feature-name]/routes/[route].py` (`contracts/[file].md`)
- [ ] T028 [US1] Persist and retrieve data in `backend/src/features/[feature-name]/services/[service].py` (FR-006, FR-007)

#### Integration
- [ ] T029 [US1] Connect frontend submission flow to [METHOD] [endpoint] via `frontend/src/features/[feature-name]/services/[service].ts` (`contracts/[file].md`)
- [ ] T030 [US1] Map API success response to UI update in `frontend/src/features/[feature-name]/pages/[Page].tsx`
- [ ] T031 [US1] Map structured API errors to UI field / global error states in `frontend/src/features/[feature-name]/components/[Component].tsx`
- [ ] T032 [US1] Verify data returned by backend matches UI expectations from `plan.md` and `contracts/[file].md`

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
- [ ] T033 [P] [US2] Add component / interaction test for [user flow] in `frontend/tests/integration/test_[name].tsx`
- [ ] T034 [P] [US2] Add frontend validation / state test in `frontend/tests/unit/test_[name].tsx`

#### Backend Tests
- [ ] T035 [P] [US2] Add contract test for [METHOD] [endpoint] in `backend/tests/contract/test_[name].py` (`contracts/[file].md`)
- [ ] T036 [P] [US2] Add backend integration test in `backend/tests/integration/test_[name].py`

#### End-to-End Test
- [ ] T037 [P] [US2] Add E2E test for [story flow] in `tests/e2e/test_[name].spec.ts`

### Implementation for User Story 2

#### Frontend
- [ ] T038 [P] [US2] Build / update [Page/View] in `frontend/src/features/[feature-name]/pages/[Page].tsx`
- [ ] T039 [P] [US2] Build / update [Component] in `frontend/src/features/[feature-name]/components/[Component].tsx`
- [ ] T040 [US2] Implement frontend validation / state handling (FR-xxx)
- [ ] T041 [US2] Wire UI action to API client (`contracts/[file].md`)

#### Backend
- [ ] T042 [P] [US2] Create / update model or schema in `backend/src/features/[feature-name]/models/[entity].py`
- [ ] T043 [US2] Implement service logic in `backend/src/features/[feature-name]/services/[service].py` (FR-xxx)
- [ ] T044 [US2] Implement endpoint in `backend/src/features/[feature-name]/routes/[route].py` (`contracts/[file].md`)

#### Integration
- [ ] T045 [US2] Connect frontend with backend contract (`contracts/[file].md`)
- [ ] T046 [US2] Map response and error states to UI
- [ ] T047 [US2] Verify this story remains independently testable

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
- [ ] T048 [P] [US3] Add component / interaction test for [user flow] in `frontend/tests/integration/test_[name].tsx`
- [ ] T049 [P] [US3] Add frontend validation / state test in `frontend/tests/unit/test_[name].tsx`

#### Backend Tests
- [ ] T050 [P] [US3] Add contract test for [METHOD] [endpoint] in `backend/tests/contract/test_[name].py` (`contracts/[file].md`)
- [ ] T051 [P] [US3] Add backend integration test in `backend/tests/integration/test_[name].py`

#### End-to-End Test
- [ ] T052 [P] [US3] Add E2E test for [story flow] in `tests/e2e/test_[name].spec.ts`

### Implementation for User Story 3

#### Frontend
- [ ] T053 [P] [US3] Build / update [Page/View] in `frontend/src/features/[feature-name]/pages/[Page].tsx`
- [ ] T054 [P] [US3] Build / update [Component] in `frontend/src/features/[feature-name]/components/[Component].tsx`
- [ ] T055 [US3] Implement frontend validation / state handling (FR-xxx)
- [ ] T056 [US3] Wire UI action to API client (`contracts/[file].md`)

#### Backend
- [ ] T057 [P] [US3] Create / update model or schema in `backend/src/features/[feature-name]/models/[entity].py`
- [ ] T058 [US3] Implement service logic in `backend/src/features/[feature-name]/services/[service].py` (FR-xxx)
- [ ] T059 [US3] Implement endpoint in `backend/src/features/[feature-name]/routes/[route].py` (`contracts/[file].md`)

#### Integration
- [ ] T060 [US3] Connect frontend with backend contract (`contracts/[file].md`)
- [ ] T061 [US3] Map response and error states to UI
- [ ] T062 [US3] Verify this story remains independently testable

### Done Criteria for User Story 3
- [ ] All FE, BE, and E2E tests for US3 pass
- [ ] API contract for US3 is satisfied
- [ ] UI behavior matches spec and plan
- [ ] Story is independently testable and demoable

**Checkpoint**: All user stories should now be independently functional

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T063 [P] Update shared documentation in `docs/` and feature docs in `specs/[###-feature-name]/`
- [ ] T064 Refactor duplicated FE / BE logic without changing feature behavior
- [ ] T065 [P] Add regression tests for shared behavior in `frontend/tests/`, `backend/tests/`, or `tests/e2e/`
- [ ] T066 Apply performance optimization across affected stories
- [ ] T067 Apply security hardening for changed routes, inputs, and permissions
- [ ] T068 Run `quickstart.md` validation and update if required

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
