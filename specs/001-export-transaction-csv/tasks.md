# Tasks: Export Transaction CSV

**Input**: Design documents from `/specs/001-export-transaction-csv/`
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/ledger-export.openapi.yaml`, `quickstart.md`

**Tests**: Test tasks are required by `spec.md` (NFR-002) and included per user story.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependency)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare test and export scaffolding required by all stories.

- [X] T001 Add test scripts for feature coverage in `package.json`
- [X] T002 Create Vitest configuration for API and integration tests in `vitest.config.ts`
- [X] T003 [P] Add shared test bootstrap for route-handler mocks in `tests/setup/vitest.setup.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared export foundations that all user stories depend on.

**⚠️ CRITICAL**: No user story work starts before this phase is complete.

- [X] T004 Define export request/response types used by UI and service code in `src/features/ledger/types.ts`
- [X] T005 [P] Add client export API helper contract in `src/features/ledger/services/index.ts`
- [X] T006 [P] Create shared export query + CSV serializer module in `src/lib/ledger-export.ts`
- [X] T007 Add authenticated export route handler scaffold in `src/app/api/ledger/export/route.ts`

**Checkpoint**: Foundation complete - user stories can proceed.

---

## Phase 3: User Story 1 - Export visible transactions (Priority: P1) 🎯 MVP

**Goal**: Let authenticated users export the currently visible ledger transaction set.

**Independent Test**: From `/app/ledger`, export CSV and verify rows match the visible transactions for the signed-in user only.

### Tests for User Story 1

- [X] T008 [P] [US1] Add contract test for `GET /api/ledger/export` auth and user-scoping in `tests/contract/ledger-export.contract.test.ts`
- [X] T009 [P] [US1] Add integration test for export download from ledger view in `tests/integration/ledger-export.integration.test.ts`

### Implementation for User Story 1

- [X] T010 [US1] Implement authenticated export endpoint with `query/type/accountId/categoryId` filters in `src/app/api/ledger/export/route.ts`
- [X] T011 [US1] Implement user-scoped transaction projection for export rows in `src/lib/ledger-export.ts`
- [X] T012 [P] [US1] Implement `exportTransactionsCsv` client request helper in `src/features/ledger/services/index.ts`
- [X] T013 [US1] Add export button and loading state in ledger actions area in `src/features/ledger/pages/LedgerPageView.tsx`
- [X] T014 [P] [US1] Add English export labels/messages in `src/features/i18n/locales/en.json`
- [X] T015 [P] [US1] Add Vietnamese export labels/messages in `src/features/i18n/locales/vi.json`

**Checkpoint**: US1 is independently functional (MVP export flow).

---

## Phase 4: User Story 2 - Export by time window (Priority: P2)

**Goal**: Support date-range exports, including valid header-only CSV for empty result windows.

**Independent Test**: Export with known date ranges and confirm only in-range rows are returned; empty ranges return header-only CSV.

### Tests for User Story 2

- [X] T016 [P] [US2] Extend contract coverage for `startDate/endDate` validation and bad input responses in `tests/contract/ledger-export.contract.test.ts`
- [X] T017 [P] [US2] Extend integration coverage for date-range and empty-result exports in `tests/integration/ledger-export.integration.test.ts`

### Implementation for User Story 2

- [X] T018 [US2] Add `startDate/endDate` handling to export input types in `src/features/ledger/types.ts`
- [X] T019 [US2] Validate and normalize inclusive date-range filters in `src/app/api/ledger/export/route.ts`
- [X] T020 [US2] Apply date-range filtering and header-only empty output behavior in `src/lib/ledger-export.ts`
- [X] T021 [US2] Send date-range query params in export request builder in `src/features/ledger/services/index.ts`

**Checkpoint**: US2 is independently functional with time-window exports.

---

## Phase 5: User Story 3 - Trustworthy, reusable output (Priority: P3)

**Goal**: Deliver spreadsheet-safe CSV with fixed schema, robust escaping, and retry-friendly failure messaging.

**Independent Test**: Open exported CSV in spreadsheet software and verify stable column order, valid escaping, and clear retry path on failures.

### Tests for User Story 3

- [X] T022 [P] [US3] Add contract assertions for fixed column schema and CSV escaping rules in `tests/contract/ledger-export.contract.test.ts`
- [X] T023 [P] [US3] Add integration assertions for special-character rows and retry feedback in `tests/integration/ledger-export.integration.test.ts`

### Implementation for User Story 3

- [X] T024 [US3] Implement RFC-4180 escaping and deterministic column order in `src/lib/ledger-export.ts`
- [X] T025 [US3] Align date/amount/currency rendering with ledger conventions in `src/lib/ledger-export.ts`
- [X] T026 [US3] Return clear export failure payloads and status codes for retry UX in `src/app/api/ledger/export/route.ts`
- [X] T027 [US3] Show export error feedback and retry action in ledger UI in `src/features/ledger/pages/LedgerPageView.tsx`

**Checkpoint**: US3 is independently functional and output is spreadsheet-ready.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Complete documentation and final verification across stories.

- [X] T028 [P] Document export endpoint and behavior in `docs/codebase-summary.md`
- [X] T029 [P] Document export flow and data path updates in `docs/system-architecture.md`
- [X] T030 [P] Update delivery status for CSV export in `docs/project-roadmap.md`
- [X] T031 Record feature verification commands/results in `specs/001-export-transaction-csv/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1) -> no dependencies
- Foundational (Phase 2) -> depends on Setup; blocks all user stories
- User Stories (Phases 3-5) -> depend on Foundational completion
- Polish (Phase 6) -> depends on all target user stories being complete

### User Story Dependency Graph

- US1 (P1) -> independent after Phase 2
- US2 (P2) -> depends on shared export foundation; does not require US1 completion for coding, but is sequenced after US1 for MVP-first delivery
- US3 (P3) -> depends on shared export foundation; can be developed after US1/US2 baseline behavior is in place

Recommended completion order: `US1 -> US2 -> US3`

### Within Each User Story

- Write tests first and confirm they fail for the new behavior
- Implement route/service logic next
- Integrate UI behavior and translations
- Re-run story-specific tests before moving on

---

## Parallel Execution Opportunities

- Phase 1: T003 can run in parallel with T001-T002 once test strategy is selected
- Phase 2: T005 and T006 can run in parallel; T007 starts after shared modules are in place
- US1: T008 and T009 run in parallel; T014 and T015 run in parallel after UI copy keys are finalized
- US2: T016 and T017 run in parallel; T018-T021 can split between API and client threads
- US3: T022 and T023 run in parallel; T024-T027 can split between API and UI threads
- Phase 6: T028-T030 run in parallel

## Parallel Example: User Story 1

```bash
# Parallel test work
Task: "T008 [US1] contract test in tests/contract/ledger-export.contract.test.ts"
Task: "T009 [US1] integration test in tests/integration/ledger-export.integration.test.ts"

# Parallel localization work
Task: "T014 [US1] English strings in src/features/i18n/locales/en.json"
Task: "T015 [US1] Vietnamese strings in src/features/i18n/locales/vi.json"
```

## Parallel Example: User Story 2

```bash
# Parallel test updates
Task: "T016 [US2] contract test updates in tests/contract/ledger-export.contract.test.ts"
Task: "T017 [US2] integration test updates in tests/integration/ledger-export.integration.test.ts"

# Parallel implementation split
Task: "T019 [US2] date validation in src/app/api/ledger/export/route.ts"
Task: "T021 [US2] date params wiring in src/features/ledger/services/index.ts"
```

## Parallel Example: User Story 3

```bash
# Parallel test updates
Task: "T022 [US3] schema/escaping checks in tests/contract/ledger-export.contract.test.ts"
Task: "T023 [US3] retry UX checks in tests/integration/ledger-export.integration.test.ts"

# Parallel implementation split
Task: "T024 [US3] CSV escaping in src/lib/ledger-export.ts"
Task: "T027 [US3] retry feedback UI in src/features/ledger/pages/LedgerPageView.tsx"
```

---

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1 and Phase 2
2. Deliver Phase 3 (US1) end-to-end
3. Validate US1 independent test criteria before expanding scope

### Incremental Delivery

1. Add US2 date-window behavior without regressing US1 exports
2. Add US3 output hardening and retry UX
3. Finish polish/docs and run full validation from quickstart

### Suggested MVP Scope

- Complete through Phase 3 (US1) only for first releasable increment.
