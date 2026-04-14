# Tasks: Atelier List

## Metadata

- **Name**: Atelier List
- **Last Updated**: 2026-04-14
- **Updated By**: OpenCode Agent
- **Version**: v1.0.0

**Input**: Design documents from `/specs/005-atelier-list/`  
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/get-api-atelier.md`, `quickstart.md`

**Tests**: Include FE and BE automated tests for each user story per `spec.md` NFR-002 and `plan.md` testing strategy (no E2E required for this increment).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- `[P]` means the task is parallelizable (different files, no dependency on incomplete tasks)
- `[Story]` is included only in user-story phases (`[US1]`, `[US2]`, `[US3]`)
- Every task includes an exact file path

## Path Conventions

- Application code is under `src/`
- Tests are under `tests/`
- Feature docs are under `specs/005-atelier-list/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare test and feature scaffolding used by all stories.

### Shared
- [x] SHARED-T001 Create Atelier list contract fixture builder in `tests/fixtures/atelier-list-fixtures.ts`
- [x] SHARED-T002 [P] Create Atelier list mock-data helpers in `tests/fixtures/atelier-list-scenarios.ts`
- [x] SHARED-T003 [P] Create feature-level test constants for month keys/timezones in `tests/fixtures/atelier-list-constants.ts`
- [x] SHARED-T004 Add Stitch screen reference note for implementers in `specs/005-atelier-list/tasks.md`

Implementation note for UI work: use Stitch screen `3115724136774fe4a1b628580d8d3383` from `specs/005-atelier-list/assets/atelier-list.png` / `specs/005-atelier-list/assets/atelier-list.html` as the screen-level source of truth during FE implementation.

**Checkpoint**: Shared fixtures and constants are ready for foundational and story work.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core month-context and read-model foundations that block all stories.

**⚠️ CRITICAL**: No user story work starts until this phase is complete.

### Backend
- [x] BE-FOUND-T001 Add month query parsing/validation helper (`YYYY-MM`) in `src/lib/date.ts`
- [x] BE-FOUND-T002 [P] Add month range resolver with timezone fallback support in `src/lib/date.ts`
- [x] BE-FOUND-T003 Extend Atelier list row domain type (`healthy|warning|overspent|pending`, carry-forward) in `src/features/atelier/types.ts`
- [x] BE-FOUND-T004 [P] Add shared Atelier list row mapper for API/page reuse in `src/lib/atelier.ts`

### Frontend
- [x] FE-FOUND-T001 Add read-only Atelier list view model types (month + risk labels) in `src/features/atelier/types.ts`

### Shared
- [x] SHARED-T005 Add Atelier list i18n keys for month selector, pending status, and risk text in `src/features/i18n/locales/en.json`
- [x] SHARED-T006 [P] Mirror Atelier list i18n keys in Vietnamese locale in `src/features/i18n/locales/vi.json`

**Checkpoint**: Month parsing, timezone handling, row typing, and shared locale labels are ready.

---

## Phase 3: User Story 1 - Review All Category Limits (Priority: P1) 🎯 MVP

**Goal**: Show all user categories with name, icon, selected-month limit, carry-forward visibility, warning percentage, and month-refresh behavior.

**Independent Test**: Seed multiple categories and verify each row returns/displays required fields for default and switched month contexts.

### Tests for User Story 1

- [x] TEST-BE-US1-T001 [P] [US1] Add contract test for `GET /api/atelier?month=YYYY-MM` auth + response shape in `tests/contract/atelier-list-api.contract.test.ts` (`contracts/get-api-atelier.md`)
- [x] TEST-BE-US1-T002 [P] [US1] Add backend integration test for month switching and canonical row ordering in `tests/integration/atelier-list-month-switch.integration.test.ts` (FR-001, FR-002, FR-006, FR-007, FR-009)
- [x] TEST-FE-US1-T001 [P] [US1] Add Atelier list rendering test for required row fields in `tests/integration/atelier-list.integration.test.tsx` (FR-001, FR-002)
- [x] TEST-FE-US1-T002 [P] [US1] Add month-selector refresh behavior test in `tests/integration/atelier-list.integration.test.tsx` (FR-007)

### Implementation for User Story 1

#### Backend
- [x] BE-US1-T001 [US1] Update `GET /api/atelier` to accept optional `month` query and validate errors in `src/app/api/atelier/route.ts` (`contracts/get-api-atelier.md`)
- [x] BE-US1-T002 [US1] Implement month-scoped category snapshot loading (selected month + next month carry comparison) in `src/lib/atelier.ts` (FR-002, FR-005, FR-007)
- [x] BE-US1-T003 [US1] Enforce user-scoped category ordering by name A-Z and id tie-break in `src/lib/atelier.ts` (FR-006, FR-009)
- [x] BE-US1-T004 [US1] Return default row values when selected-month snapshot is missing in `src/lib/atelier.ts` (FR-008)

#### Frontend
- [x] FE-US1-T001 [US1] Update Atelier dashboard page to resolve selected month from route/query context in `src/app/(dashboard)/app/atelier/page.tsx` (FR-007)
- [x] FE-US1-T002 [US1] Implement read-only month selector and month label rendering in `src/features/atelier/pages/AtelierPageView.tsx` (FR-007)
- [x] FE-US1-T003 [US1] Refactor category list rows to show required list attributes (name/icon/limit/carry-forward/warnAt) in `src/features/atelier/components/CategoryAtelierGrid.tsx` (FR-002, FR-005)
- [x] FE-US1-T004 [US1] Remove create/edit/delete affordances from list-only scope in `src/features/atelier/components/CategoryAtelierGrid.tsx` and `src/features/atelier/pages/AtelierPageView.tsx`

#### Integration
- [x] INT-US1-T001 [US1] Map API month-scoped payload to `AtelierPageView` props in `src/app/(dashboard)/app/atelier/page.tsx` and `src/features/atelier/pages/AtelierPageView.tsx` (`contracts/get-api-atelier.md`)
- [x] INT-US1-T002 [US1] Implement loading/error/empty list states with retry affordance in `src/features/atelier/pages/AtelierPageView.tsx` (FR-010)

**Checkpoint**: User Story 1 is independently demoable as MVP.

---

## Phase 4: User Story 3 - Receive At-Risk and Overspend Signals (Priority: P1)

**Goal**: Compute and display healthy/warning/overspent/pending status correctly for each row.

**Independent Test**: Prepare category spend at below-threshold, threshold-crossed, and overspent levels; verify status text and non-color cues.

### Tests for User Story 3

- [x] TEST-BE-US3-T001 [P] [US3] Add backend integration test for risk precedence `overspent > warning > healthy` in `tests/integration/atelier-list-risk-status.integration.test.ts` (FR-003, FR-004)
- [x] TEST-BE-US3-T002 [P] [US3] Add backend integration test for partial-data pending status fallback in `tests/integration/atelier-list-risk-status.integration.test.ts` (FR-011)
- [x] TEST-FE-US3-T001 [P] [US3] Add UI test for status label rendering (not color-only) in `tests/integration/atelier-list-risk-ui.integration.test.tsx` (NFR-005)
- [x] TEST-FE-US3-T002 [P] [US3] Add UI test for explicit `Pending data` row status in `tests/integration/atelier-list-risk-ui.integration.test.tsx` (FR-011)

### Implementation for User Story 3

#### Backend
- [x] BE-US3-T001 [US3] Implement risk-status evaluation and pending-state fallback per row in `src/lib/atelier.ts` (FR-003, FR-004, FR-011)
- [x] BE-US3-T002 [US3] Add usage percent bounding and deterministic threshold handling in `src/lib/atelier.ts` (FR-003, FR-004)

#### Frontend
- [x] FE-US3-T001 [US3] Render explicit row status text (`healthy`, `warning`, `overspent`, `Pending data`) in `src/features/atelier/components/CategoryAtelierGrid.tsx` (FR-011, NFR-005)
- [x] FE-US3-T002 [US3] Add iconography/assistive labels for warning and overspent states in `src/features/atelier/components/CategoryAtelierGrid.tsx` (NFR-005)

#### Integration
- [x] INT-US3-T001 [US3] Ensure API status values map to localized UI labels in `src/features/atelier/pages/AtelierPageView.tsx` and `src/features/atelier/components/CategoryAtelierGrid.tsx`

**Checkpoint**: User Story 3 status semantics are independently testable and accessible.

---

## Phase 5: User Story 2 - Understand Warning Threshold Context (Priority: P2)

**Goal**: Show warning percentage context per category and keep per-category thresholds stable across month changes.

**Independent Test**: Load categories with different warnAt values and verify each row displays its own warning threshold and related risk interpretation.

### Tests for User Story 2

- [x] TEST-BE-US2-T001 [P] [US2] Add contract/integration test for per-category `warnAt` values in API response rows in `tests/contract/atelier-list-api.contract.test.ts` (FR-002)
- [x] TEST-FE-US2-T001 [P] [US2] Add UI test that each row shows its own warning percentage value in `tests/integration/atelier-list-warning-threshold.integration.test.tsx` (FR-002)
- [x] TEST-FE-US2-T002 [P] [US2] Add UI test for month refresh preserving per-category threshold context in `tests/integration/atelier-list-warning-threshold.integration.test.tsx` (FR-007)

### Implementation for User Story 2

#### Backend
- [x] BE-US2-T001 [US2] Ensure month snapshot warning fields (`warningEnabled`, `warnAt`) are loaded per category row in `src/lib/atelier.ts` (FR-002)
- [x] BE-US2-T002 [US2] Preserve configured warnAt values instead of shared defaults when snapshot data exists in `src/lib/atelier.ts` (FR-002)

#### Frontend
- [x] FE-US2-T001 [US2] Add warning-threshold presentation in each category row in `src/features/atelier/components/CategoryAtelierGrid.tsx` (FR-002)
- [x] FE-US2-T002 [US2] Update list row copy to clarify threshold context in `src/features/atelier/pages/AtelierPageView.tsx` (FR-002)

#### Integration
- [x] INT-US2-T001 [US2] Verify row threshold fields from API contract are mapped without flattening/shared fallback in `src/app/(dashboard)/app/atelier/page.tsx` and `src/features/atelier/pages/AtelierPageView.tsx` (`contracts/get-api-atelier.md`)

**Checkpoint**: User Story 2 threshold context is independently verifiable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening, docs sync, and quality gates across all stories.

- [x] SHARED-T007 [P] Update Atelier feature exports/types cleanup in `src/features/atelier/index.ts` and `src/features/atelier/pages/index.ts`
- [x] SHARED-T008 [P] Update architecture and behavior documentation for Atelier list in `docs/codebase-summary.md` and `docs/system-architecture.md`
- [x] SHARED-T009 [P] Update roadmap delivery status for atelier-list in `docs/project-roadmap.md`
- [x] SHARED-T010 Run full quality gate commands and record outcomes in `specs/005-atelier-list/quickstart.md` (`npm run lint`, `npm run test`, `npm run build`)

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 (Setup) has no dependencies.
- Phase 2 (Foundational) depends on Phase 1 and blocks all user stories.
- Phase 3 (US1) depends on Phase 2.
- Phase 4 (US3) depends on Phase 2 and reuses US1 list payload.
- Phase 5 (US2) depends on Phase 2 and reuses US1 month-scoped list payload.
- Phase 6 (Polish) depends on completion of selected user stories.

### User Story Dependency Graph

- `US1 (P1) -> US3 (P1)`
- `US1 (P1) -> US2 (P2)`
- `US3` and `US2` can proceed in parallel once `US1` payload baseline is merged.

### Within Each User Story

- Tests first (expected to fail before implementation).
- Backend month/data logic before final UI wiring.
- Integration tasks after FE and BE pieces are in place.

---

## Parallel Execution Examples

### User Story 1

```bash
# Parallel test authoring
TEST-BE-US1-T001
TEST-BE-US1-T002
TEST-FE-US1-T001
TEST-FE-US1-T002

# Parallel implementation chunks after tests are in place
BE-US1-T001
FE-US1-T002
FE-US1-T003
```

### User Story 3

```bash
# Parallel tests
TEST-BE-US3-T001
TEST-BE-US3-T002
TEST-FE-US3-T001
TEST-FE-US3-T002

# Parallel implementation
BE-US3-T001
FE-US3-T001
```

### User Story 2

```bash
# Parallel tests
TEST-BE-US2-T001
TEST-FE-US2-T001
TEST-FE-US2-T002

# Parallel implementation
BE-US2-T001
FE-US2-T001
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1 (Setup).
2. Complete Phase 2 (Foundational).
3. Complete Phase 3 (US1).
4. Validate US1 independently against its test criteria.
5. Demo/merge MVP before extending to additional stories.

### Incremental Delivery

1. Deliver US1 (P1) first for baseline list visibility.
2. Deliver US3 (P1) next for risk signaling value.
3. Deliver US2 (P2) for threshold clarity refinements.
4. Finish with Phase 6 polish and documentation updates.

### Team Parallelization

1. One engineer handles BE month/status pipeline (`src/lib/atelier.ts`, `src/app/api/atelier/route.ts`).
2. One engineer handles FE list UI/read-only transitions (`src/features/atelier/pages/AtelierPageView.tsx`, `src/features/atelier/components/CategoryAtelierGrid.tsx`).
3. One engineer handles contract/integration tests in `tests/contract/` and `tests/integration/`.

---

## Notes

- `[P]` tasks touch different files and can be executed concurrently.
- All story tasks include `[USx]` labels for traceability.
- Contract references are included on endpoint-aligned tasks.
- E2E test tasks are intentionally omitted because `plan.md` marks E2E as not required for this increment.

## Changelog

| Version | Date       | Updated By     | Change Summary |
|---------|------------|----------------|----------------|
| v1.0.0  | 2026-04-14 | OpenCode Agent | Initial executable task list generated from plan/spec/research/data-model/contracts. |
