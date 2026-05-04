# Tasks: Ledger Transaction Display Groups

## Metadata

- **Name**: Ledger Transaction Display Groups
- **Last Updated**: 2026-05-04
- **Updated By**: OpenCode (AI Agent)
- **Version**: v1.0.0

**Input**: Design documents from `/specs/009-group-transactions-date/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/get-ledger.md`, `quickstart.md`

**Tests**: Test tasks are REQUIRED for each user story and for changed shared behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions
- Reference related functional requirements when applicable, e.g. `(FR-001, FR-004)`
- Reference related API contract files when applicable, e.g. ``(`contracts/get-ledger.md`)``

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Ensure feature docs and test target files exist and are aligned with plan structure.

- [x] SHARED-T001 Create ledger grouping test file scaffold at `tests/integration/ledger-page-grouping.integration.test.tsx`
- [x] SHARED-T002 [P] Create optional E2E smoke scaffold at `tests/e2e/ledger-date-grouping.spec.ts`
- [x] SHARED-T003 [P] Verify spec artifact paths and references in `specs/009-group-transactions-date/quickstart.md`

**Checkpoint**: Base files exist for implementation and validation.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Prepare shared grouping helpers and localization keys required by all stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] FE-FOUND-T001 Refactor date-group labeling helper in `src/features/ledger/pages/LedgerPageView.tsx` to centralize Today/Yesterday/date label derivation (FR-003, FR-005, FR-013)
- [x] FE-FOUND-T002 [P] Add/confirm locale-safe ledger day-label dictionary keys in `src/features/i18n/locales/en.json` and `src/features/i18n/locales/vi.json` (FR-013)
- [x] FE-FOUND-T003 [P] Add deterministic date-grouping test utilities/fixtures in `tests/integration/ledger-page-grouping.integration.test.tsx` (FR-001, FR-002)

**Checkpoint**: Shared grouping primitives and localization baseline are ready.

---

## Phase 3: User Story 1 - View today's transactions first (Priority: P1) 🎯 MVP

**Goal**: Show `Today` section first with all same-day transactions.

**Independent Test**: Render ledger with mixed dates and verify all today transactions appear under `Today` header at top.

### Tests for User Story 1 (REQUIRED)

- [x] TEST-FE-US1-T001 [P] [US1] Add integration test for `Today` header and membership in `tests/integration/ledger-page-grouping.integration.test.tsx` (FR-001, FR-003, SC-001)
- [x] TEST-E2E-US1-T001 [P] [US1] Add optional ledger smoke coverage for `Today` visibility in `tests/e2e/ledger-date-grouping.spec.ts`

### Implementation for User Story 1

- [x] FE-US1-T001 [US1] Implement `Today` header prioritization and grouping in `src/features/ledger/pages/LedgerPageView.tsx` (FR-003, FR-005, FR-008)
- [x] FE-US1-T002 [US1] Ensure today group rendering uses existing transaction row cards without behavior regression in `src/features/ledger/pages/LedgerPageView.tsx` (FR-006)
- [x] INT-US1-T001 [US1] Verify `GET /api/ledger` date field mapping is consumed without contract change in `src/features/ledger/pages/LedgerPageView.tsx` (`contracts/get-ledger.md`)

### Done Criteria for User Story 1

- [x] TEST-FE-US1-T002 [US1] Confirm US1 tests pass in `tests/integration/ledger-page-grouping.integration.test.tsx`
- [x] INT-US1-T002 [US1] Confirm `Today` appears first with mixed-day fixture data in `src/features/ledger/pages/LedgerPageView.tsx`

**Checkpoint**: `Today` grouping works independently and is demoable.

---

## Phase 4: User Story 2 - View yesterday's transactions (Priority: P2)

**Goal**: Show `Yesterday` as second section with correct membership and stable ordering.

**Independent Test**: Render ledger with today+yesterday+older transactions and verify `Yesterday` appears directly after `Today`.

### Tests for User Story 2 (REQUIRED)

- [x] TEST-FE-US2-T001 [P] [US2] Add integration test for `Yesterday` placement/order in `tests/integration/ledger-page-grouping.integration.test.tsx` (FR-003, FR-008, SC-002)
- [x] TEST-FE-US2-T002 [P] [US2] Add integration test for empty-group suppression when yesterday is absent in `tests/integration/ledger-page-grouping.integration.test.tsx` (FR-009, FR-010)

### Implementation for User Story 2

- [x] FE-US2-T001 [US2] Implement yesterday date-boundary matching in grouping reducer in `src/features/ledger/pages/LedgerPageView.tsx` (FR-003, FR-005)
- [x] FE-US2-T002 [US2] Implement hide-empty-group behavior while preserving non-empty groups in `src/features/ledger/pages/LedgerPageView.tsx` (FR-009, FR-010)
- [x] INT-US2-T001 [US2] Validate filter/search refresh re-runs grouping and preserves `Today` -> `Yesterday` order in `src/features/ledger/pages/LedgerPageView.tsx` (FR-008)

### Done Criteria for User Story 2

- [x] TEST-FE-US2-T003 [US2] Confirm US2 tests pass in `tests/integration/ledger-page-grouping.integration.test.tsx`
- [x] INT-US2-T002 [US2] Confirm grouped order remains stable after filter/search update in `src/features/ledger/pages/LedgerPageView.tsx`

**Checkpoint**: `Yesterday` grouping and order work independently from older-date formatting.

---

## Phase 5: User Story 3 - View older transactions by date (Priority: P3)

**Goal**: Show older transactions under direct locale-formatted calendar date headers after `Today` and `Yesterday`.

**Independent Test**: Render ledger with two older dates and verify each older day has its own locale-formatted header and correct rows.

### Tests for User Story 3 (REQUIRED)

- [x] TEST-FE-US3-T001 [P] [US3] Add integration test for older-date header splitting by calendar day in `tests/integration/ledger-page-grouping.integration.test.tsx` (FR-004, SC-003)
- [x] TEST-FE-US3-T002 [P] [US3] Add integration test for locale-specific older-date labels (EN/VI) in `tests/integration/ledger-page-grouping.integration.test.tsx` (FR-013, SC-005)
- [x] TEST-FE-US3-T003 [P] [US3] Add integration test for invalid/missing-date fallback handling in `tests/integration/ledger-page-grouping.integration.test.tsx` (FR-002, FR-011)

### Implementation for User Story 3

- [x] FE-US3-T001 [US3] Implement direct calendar-date header grouping for older entries in `src/features/ledger/pages/LedgerPageView.tsx` (FR-004, FR-005)
- [x] FE-US3-T002 [US3] Implement locale-formatted older-date labels using current user language in `src/features/ledger/pages/LedgerPageView.tsx` (FR-013)
- [x] FE-US3-T003 [US3] Implement stable handling for invalid/missing dates so rows are not mis-grouped in `src/features/ledger/pages/LedgerPageView.tsx` (FR-002, FR-011, FR-012)
- [x] INT-US3-T001 [US3] Verify grouping logic still preserves existing row actions and export controls in `src/features/ledger/pages/LedgerPageView.tsx` (FR-006)

### Done Criteria for User Story 3

- [x] TEST-FE-US3-T004 [US3] Confirm US3 tests pass in `tests/integration/ledger-page-grouping.integration.test.tsx`
- [x] INT-US3-T002 [US3] Confirm older headers are locale-formatted and appear after `Yesterday` in `src/features/ledger/pages/LedgerPageView.tsx`

**Checkpoint**: Full date-header model is complete and independently testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, documentation, and non-functional checks across stories.

- [x] SHARED-T004 Update ledger behavior notes in `docs/codebase-summary.md` (Constitution documentation gate)
- [x] SHARED-T005 [P] Update architecture flow note for ledger display grouping in `docs/system-architecture.md` (if behavior documentation changes)
- [x] SHARED-T006 [P] Update roadmap/status note if feature completion affects milestone tracking in `docs/project-roadmap.md`
- [x] TEST-FE-REG-T001 [P] Run full frontend/integration ledger tests and record results in `specs/009-group-transactions-date/quickstart.md`
- [x] SHARED-T007 Run lint and build verification commands and record outputs in `specs/009-group-transactions-date/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks all story phases.
- **Phase 3 (US1)**: Depends on Phase 2.
- **Phase 4 (US2)**: Depends on Phase 2; can run after or alongside US1, but recommended after US1 for MVP-first flow.
- **Phase 5 (US3)**: Depends on Phase 2; recommended after US1+US2 to reduce grouping regression risk.
- **Phase 6 (Polish)**: Depends on all selected story phases.

### User Story Dependencies

- **US1 (P1)**: Independent after foundational tasks.
- **US2 (P2)**: Independent after foundational tasks; reuses same grouping helper.
- **US3 (P3)**: Independent after foundational tasks; builds on same grouping helper and locale rules.

---

## Parallel Execution Opportunities

### US1

- `TEST-FE-US1-T001` and `TEST-E2E-US1-T001` can run in parallel.

### US2

- `TEST-FE-US2-T001` and `TEST-FE-US2-T002` can run in parallel.

### US3

- `TEST-FE-US3-T001`, `TEST-FE-US3-T002`, and `TEST-FE-US3-T003` can run in parallel.

### Cross-cutting

- `SHARED-T005` and `SHARED-T006` can run in parallel.

---

## Parallel Example: User Story 3

```bash
# Run US3 test authoring tasks together
Task: "Add older-date splitting test in tests/integration/ledger-page-grouping.integration.test.tsx"
Task: "Add locale-format header test in tests/integration/ledger-page-grouping.integration.test.tsx"
Task: "Add invalid-date fallback test in tests/integration/ledger-page-grouping.integration.test.tsx"

# Then implement grouped logic tasks
Task: "Implement older-date direct headers in src/features/ledger/pages/LedgerPageView.tsx"
Task: "Implement locale-formatted date labels in src/features/ledger/pages/LedgerPageView.tsx"
```

---

## Implementation Strategy

### MVP First (US1)

1. Complete Setup + Foundational phases.
2. Deliver US1 (`Today` grouping) and validate independently.
3. Demo MVP on `/app/ledger`.

### Incremental Delivery

1. Add US2 (`Yesterday`) without regressing US1.
2. Add US3 (older locale date headers) with full locale validation.
3. Finish polish gates (docs + lint/build + test evidence).

### Validation Rule

- Do not mark story complete unless its independent test criteria pass and related task checkboxes are complete.
