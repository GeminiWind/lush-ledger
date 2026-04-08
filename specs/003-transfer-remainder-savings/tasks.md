# Tasks: Month-End Remainder Transfer to Savings Plan

## Metadata

- **Name**: Month-End Remainder Transfer to Savings Plan
- **Last Updated**: 2026-04-08
- **Updated By**: OpenCode Agent
- **Version**: v1.0.0

**Input**: Design documents from `/specs/003-transfer-remainder-savings/`  
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/`

**Tests**: Test tasks are included for each user story and changed shared behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Include exact file paths in each task

## Path Conventions

- Single project layout at repository root: `src/`, `prisma/`, `tests/`, `docs/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare dependencies and feature scaffolding used by all stories.

- [ ] T001 Add queue and scheduler dependencies (`bullmq`, `node-cron`, `ioredis`) in `package.json`
- [ ] T002 Create feature scaffold files `src/lib/savings-auto-transfer.ts`, `src/lib/savings-auto-transfer-queue.ts`, and `src/lib/savings-auto-transfer-scheduler.ts`
- [ ] T003 [P] Create API scaffold files `src/app/api/savings/auto-transfer/route.ts` and `src/app/api/savings/auto-transfer/latest-run/route.ts`
- [ ] T004 [P] Create frontend scaffold files `src/features/savings/components/auto-transfer-settings.tsx` and `src/features/savings/hooks/use-auto-transfer.ts`
- [ ] T005 [P] Create test scaffold files `tests/contract/savings-auto-transfer-api.contract.test.ts` and `tests/integration/savings-auto-transfer-month-end.integration.test.ts`

**Checkpoint**: Base scaffolding is ready for foundational implementation.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared model, validation, scheduling, and queue foundation before user stories.

**⚠️ CRITICAL**: No user story work starts before this phase is complete.

- [ ] T006 Extend persistence models for auto-transfer rule and run snapshots in `prisma/schema.prisma` (`data-model.md`)
- [ ] T007 Create and commit Prisma migration for new auto-transfer models in `prisma/migrations/`
- [ ] T008 [P] Implement shared validation schemas for allocations and ownership constraints in `src/lib/savings-auto-transfer.ts` (FR-001, FR-002, FR-004, FR-009, FR-010)
- [ ] T009 [P] Implement BullMQ queue producer/worker wiring with deterministic `jobId` (`userId + monthStart`) in `src/lib/savings-auto-transfer-queue.ts` (FR-008, NFR-002)
- [ ] T010 [P] Implement `node-cron` scheduler window logic (day 27 through day 1 UTC) in `src/lib/savings-auto-transfer-scheduler.ts` (FR-011)
- [ ] T011 Implement shared month-end orchestration entrypoint integrating scheduler and queue in `src/lib/savings-auto-transfer.ts`
- [ ] T012 [P] Add shared observability logs for scheduler start, enqueue counts, and worker outcomes in `src/lib/savings-auto-transfer-queue.ts` and `src/lib/savings-auto-transfer-scheduler.ts` (NFR-003)

**Checkpoint**: Core infrastructure is complete; user stories can be implemented independently.

---

## Phase 3: User Story 1 - Configure auto-transfer rule (Priority: P1) 🎯 MVP

**Goal**: Let users configure, validate, and persist multi-plan allocation rules for month-end auto-transfer.

**Independent Test**: Enable auto-transfer, add valid multi-plan allocations, save, reload, and confirm persisted rule with correct validation behavior.

### Tests for User Story 1

- [ ] T013 [P] [US1] Add contract test for `GET /api/savings/auto-transfer` response shape in `tests/contract/savings-auto-transfer-api.contract.test.ts` (`contracts/get-savings-auto-transfer.md`)
- [ ] T014 [P] [US1] Add contract test for `PUT /api/savings/auto-transfer` validation errors in `tests/contract/savings-auto-transfer-api.contract.test.ts` (`contracts/put-savings-auto-transfer.md`)
- [ ] T015 [P] [US1] Add frontend component test for allocation row add/remove, validation states, and required red `(*)` field indicators in `src/features/savings/components/auto-transfer-settings.test.tsx`

### Implementation for User Story 1

- [ ] T016 [US1] Implement `GET /api/savings/auto-transfer` handler in `src/app/api/savings/auto-transfer/route.ts` (`contracts/get-savings-auto-transfer.md`)
- [ ] T017 [US1] Implement `PUT /api/savings/auto-transfer` handler with structured error responses in `src/app/api/savings/auto-transfer/route.ts` (`contracts/put-savings-auto-transfer.md`, FR-015, FR-016)
- [ ] T018 [US1] Implement rule persistence/read/write service methods in `src/lib/savings-auto-transfer.ts` (FR-001, FR-002, FR-003, FR-004)
- [ ] T019 [P] [US1] Implement client query and mutation hooks for config endpoints in `src/features/savings/hooks/use-auto-transfer.ts`
- [ ] T020 [US1] Implement `AutoTransferSettings` UI with multi-row allocations, total percentage guard, and required red `(*)` field indicators in `src/features/savings/components/auto-transfer-settings.tsx` (FR-001, FR-002, FR-004)
- [ ] T021 [US1] Integrate settings panel into `/app/atelier` in `src/app/(dashboard)/app/atelier/page.tsx`
- [ ] T022 [US1] Render latest known auto-transfer run summary panel in `/app/atelier` in `src/app/(dashboard)/app/atelier/page.tsx`

### Done Criteria for User Story 1

- [ ] T023 [US1] Run `npm run test -- tests/contract/savings-auto-transfer-api.contract.test.ts src/features/savings/components/auto-transfer-settings.test.tsx` and verify US1 scenarios pass
- [ ] T024 [US1] Manually verify independent test for US1 using `spec.md` acceptance scenarios in `specs/003-transfer-remainder-savings/spec.md`

**Checkpoint**: US1 is independently functional and demoable.

---

## Phase 4: User Story 2 - Automatic month-end transfer execution (Priority: P1)

**Goal**: Execute month-end auto-transfer safely per user via `node-cron` + BullMQ and expose per-plan run outcomes.

**Independent Test**: Trigger month-end processing with active rules and verify per-plan applied/skipped outcomes, idempotency, and latest-run visibility.

### Tests for User Story 2

- [ ] T025 [P] [US2] Add contract test for `GET /api/savings/auto-transfer/latest-run` per-plan response in `tests/contract/savings-auto-transfer-api.contract.test.ts` (`contracts/get-savings-auto-transfer-latest-run.md`)
- [ ] T026 [P] [US2] Add integration test for positive remainder and per-plan capped transfers, including ledger transaction visibility fields and savings progress impact in `tests/integration/savings-auto-transfer-month-end.integration.test.ts` (FR-006, FR-012, FR-017, FR-018)
- [ ] T027 [P] [US2] Add integration test for non-positive remainder skipped run in `tests/integration/savings-auto-transfer-month-end.integration.test.ts` (FR-007)
- [ ] T028 [P] [US2] Add integration test for duplicate enqueue/retry idempotency in `tests/integration/savings-auto-transfer-month-end.integration.test.ts` (FR-008, NFR-002)
- [ ] T029 [P] [US2] Add integration test for unavailable plan partial skip with remaining valid allocations applied in `tests/integration/savings-auto-transfer-month-end.integration.test.ts` (FR-014)

### Implementation for User Story 2

- [ ] T030 [US2] Implement month-end remainder evaluation and per-plan calculation engine in `src/lib/savings-auto-transfer.ts` (FR-005, FR-006, FR-007)
- [ ] T031 [US2] Implement per-run snapshot persistence with per-plan results in `src/lib/savings-auto-transfer.ts` (FR-013, NFR-003)
- [ ] T032 [US2] Complete BullMQ worker processing flow and retry handling for one-user jobs in `src/lib/savings-auto-transfer-queue.ts` (FR-008, FR-011)
- [ ] T033 [US2] Complete `node-cron` daily scheduler (27..1 UTC) enqueue orchestration in `src/lib/savings-auto-transfer-scheduler.ts` (FR-011)
- [ ] T034 [US2] Implement `GET /api/savings/auto-transfer/latest-run` route with per-plan result mapping in `src/app/api/savings/auto-transfer/latest-run/route.ts` (`contracts/get-savings-auto-transfer-latest-run.md`)
- [ ] T035 [P] [US2] Extend frontend hook for latest-run endpoint and state normalization in `src/features/savings/hooks/use-auto-transfer.ts`
- [ ] T036 [US2] Update `/app/ledger` UI to show auto-transfer transaction date/amount/destination/type fields and update `/app/savings` UI to show savings progress impact in `src/app/(dashboard)/app/ledger/page.tsx` and `src/app/(dashboard)/app/savings/page.tsx` (FR-012, FR-017, FR-018, NFR-001)

### Done Criteria for User Story 2

- [ ] T037 [US2] Run `npm run test -- tests/integration/savings-auto-transfer-month-end.integration.test.ts` and verify US2 scenarios pass
- [ ] T038 [US2] Manually verify independent test for US2 using `spec.md` acceptance scenarios in `specs/003-transfer-remainder-savings/spec.md`

**Checkpoint**: US2 is independently functional and demoable.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final quality, docs, and governance updates across stories.

- [ ] T039 [P] Update feature docs consistency (`spec.md`, `plan.md`, `quickstart.md`) in `specs/003-transfer-remainder-savings/`
- [ ] T040 Update architecture and behavior docs in `docs/codebase-summary.md`, `docs/system-architecture.md`, and `docs/project-roadmap.md`
- [ ] T041 [P] Run full quality gates `npm run lint`, `npm run build`, and `npm run test` and capture results in `specs/003-transfer-remainder-savings/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: no dependencies.
- **Phase 2 (Foundational)**: depends on Phase 1 and blocks all user stories.
- **Phase 3 (US1)**: depends on Phase 2 completion.
- **Phase 4 (US2)**: depends on Phase 2 completion; can start after US1 contracts/hooks are stable, but recommended after US1 completion.
- **Phase 5 (Polish)**: depends on completion of all targeted user stories.

### User Story Dependencies

- **US1**: independent after foundation.
- **US2**: independent after foundation, but reuses rule configuration endpoints/hooks delivered in US1.

---

## Parallel Execution Examples

### User Story 1

```bash
# Parallelizable US1 tests
T013, T014, T015

# Parallelizable US1 implementation
T019 can run while T016/T017/T018 are in progress after API contracts are fixed.
```

### User Story 2

```bash
# Parallelizable US2 tests
T025, T026, T027, T028, T029

# Parallelizable US2 implementation
T035 can run in parallel with T034 once latest-run response shape is finalized.
```

---

## Implementation Strategy

### MVP First (Recommended)

1. Complete Phase 1 and Phase 2.
2. Deliver Phase 3 (US1) as first releasable increment.
3. Validate US1 independently before starting full month-end automation.

### Incremental Delivery

1. Ship US1 configuration flow.
2. Ship US2 execution + latest-run visibility.
3. Finish with Phase 5 polish and documentation gates.

### Suggested MVP Scope

- **MVP scope**: User Story 1 only (configuration and persistence).
- **Follow-up**: User Story 2 for scheduler/queue automation and run outcomes.

---

## Changelog

| Version | Date | Updated By | Change Summary |
|---------|------|------------|----------------|
| v1.0.0 | 2026-04-08 | OpenCode Agent | Initial tasks generated from plan/spec/data-model/contracts/research/quickstart. |
