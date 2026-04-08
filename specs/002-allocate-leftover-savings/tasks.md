# Tasks: Allocate Monthly Remainder to Savings Plans (Queue-Driven)

## Metadata

- **Name**: Allocate Monthly Remainder to Savings Plans (Queue-Driven)
- **Last Updated**: 2026-04-08
- **Updated By**: OpenCode Agent
- **Version**: v1.1.0

**Input**: Design documents from `/Users/haidv7/Desktop/Workspace/Perrsonal/lush-ledger/specs/002-allocate-leftover-savings/`
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/savings-remainder-allocation.openapi.yaml`, `quickstart.md`

**Tests**: Test tasks are required by the feature spec/plan and included per user story.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable task (different files, no blocking dependency)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare BullMQ + Redis local/dev setup and baseline queue scaffolding.

- [X] T001 Add BullMQ and ioredis dependencies in `package.json`
- [X] T002 Add local Redis service for queue development in `docker-compose.yml`
- [X] T003 [P] Add queue-related environment variables for local setup in `.env.example`
- [X] T004 [P] Add local queue startup and validation steps in `specs/002-allocate-leftover-savings/quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build queue core and internal orchestration foundations required by all stories.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [X] T005 Add migration for month-level priority persistence in `prisma/migrations/20260408190000_add_savings_plan_monthly_priority/migration.sql`
- [X] T006 Add BullMQ Redis connection factory in `src/lib/queue/connection.ts`
- [X] T007 Add queue names/default job options and typed payload contracts in `src/lib/queue/month-end-allocation-queue.ts`
- [X] T008 Add producer enqueue service for month and replay jobs in `src/lib/queue/producer.ts`
- [X] T009 Add worker processor for per-user allocation jobs in `src/lib/queue/worker.ts`
- [X] T010 Add cron-controlled producer trigger endpoint in `src/app/api/internal/jobs/month-end-remainder-allocation/route.ts`
- [X] T011 Add replay endpoint for specified user/month in `src/app/api/internal/jobs/month-end-remainder-allocation/replay/route.ts`
- [X] T012 [P] Add contract coverage for internal enqueue/replay endpoints in `tests/contract/month-end-allocation-queue.contract.test.ts`

**Checkpoint**: Queue infrastructure complete - user stories can proceed.

---

## Phase 3: User Story 1 - Allocate monthly remainder by priority (Priority: P1) 🎯 MVP

**Goal**: Execute month-end allocation via BullMQ per-user jobs with retries and idempotency.

**Independent Test**: Trigger cron producer, verify user jobs are queued, processed once per user/month, and successful runs create transfer transactions.

### Tests for User Story 1

- [X] T013 [P] [US1] Add integration test for producer fan-out and per-user job IDs in `tests/integration/month-end-allocation-queue.integration.test.ts`
- [X] T014 [P] [US1] Add integration test for worker retries/backoff and eventual success in `tests/integration/month-end-allocation-worker.integration.test.ts`
- [X] T038 [P] [US1] Add explicit zero/negative remainder no-op coverage (`no_op_zero_remainder`, no transfer rows) in `tests/contract/savings-remainder-allocation.contract.test.ts` and `tests/integration/savings-remainder-allocation.integration.test.ts`

### Implementation for User Story 1

- [X] T015 [US1] Refactor monthly scheduler to enqueue queue jobs instead of inline processing in `src/lib/savings-remainder-allocation.ts`
- [X] T016 [US1] Implement producer batching (100 users per batch) in `src/lib/queue/producer.ts`
- [X] T017 [US1] Implement worker execution path calling allocation domain service in `src/lib/queue/worker.ts`
- [X] T018 [US1] Configure queue job attempts/backoff/remove policies in `src/lib/queue/month-end-allocation-queue.ts`
- [X] T019 [US1] Wire cron route to producer enqueue flow in `src/app/api/internal/jobs/month-end-remainder-allocation/route.ts`
- [X] T020 [US1] Configure production cron trigger for queue producer in `vercel.json`

**Checkpoint**: US1 is independently functional with queue-driven month-end processing.

---

## Phase 4: User Story 2 - Respect plan eligibility and limits (Priority: P2)

**Goal**: Ensure queue-driven allocation still enforces active/funded eligibility, capping, redistribution, and no overfunding.

**Independent Test**: Run queued allocation for mixed-status plans and over-need remainder; verify only eligible plans are funded up to remaining need.

### Tests for User Story 2

- [X] T021 [P] [US2] Extend allocation contract tests for active/funded eligibility and capped redistribution in `tests/contract/savings-remainder-allocation.contract.test.ts`
- [X] T022 [P] [US2] Extend queue integration tests for mixed-status and over-target cases in `tests/integration/savings-remainder-allocation.integration.test.ts`

### Implementation for User Story 2

- [X] T023 [US2] Enforce eligible status filtering (`active` + `funded`) in allocation selector in `src/lib/savings-remainder-allocation.ts`
- [X] T024 [US2] Enforce normalized month priority settings and validation for queued execution in `src/app/api/savings/remainder-allocation/settings/route.ts`
- [X] T025 [US2] Preserve idempotent no-duplicate transfer behavior under worker retry in `src/lib/savings-remainder-allocation.ts`
- [X] T026 [US2] Align add-plan picker eligibility labels/states in monthly savings card in `src/features/atelier/components/MonthlySavingsPlanCard.tsx`

**Checkpoint**: US2 is independently functional with eligibility/limit safeguards preserved under queue execution.

---

## Phase 5: User Story 3 - Review and trust allocation results (Priority: P3)

**Goal**: Keep month-level summary/audit transparency while adding queue replay capability.

**Independent Test**: After queued run, verify summary + traceability; replay one failed user and verify summary/audit outputs are correct.

### Tests for User Story 3

- [X] T027 [P] [US3] Add contract tests for replay enqueue API and response payloads in `tests/contract/month-end-allocation-queue.contract.test.ts`
- [X] T028 [P] [US3] Add integration tests for monthly settings UI + replayed-run summary visibility in `tests/integration/savings-remainder-allocation.integration.test.ts`

### Implementation for User Story 3

- [X] T029 [US3] Extend summary model to retain run trace metadata for queued/replayed runs in `src/lib/savings-remainder-allocation.ts`
- [X] T030 [US3] Keep monthly savings UI aligned with queue-backed settings and summary behavior in `src/features/atelier/components/MonthlySavingsPlanCard.tsx`
- [X] T031 [P] [US3] Add/adjust queue/replay user-facing i18n copy in `src/features/i18n/locales/en.json`
- [X] T032 [P] [US3] Add/adjust queue/replay user-facing i18n copy in `src/features/i18n/locales/vi.json`

**Checkpoint**: US3 is independently functional with user-facing clarity and replay-aware operations.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality gates, docs alignment, and queue-focused operational guidance.

**Execution Note**: Phase 6 tasks may be completed in parallel before all story tasks are checked, but overall feature closure still requires all US tasks complete.

- [X] T033 [P] Update queue architecture notes (cron -> producer -> worker -> replay) in `docs/system-architecture.md`
- [X] T034 [P] Update domain/API inventory with BullMQ internal endpoints and queue modules in `docs/codebase-summary.md`
- [X] T035 [P] Update roadmap milestone status for queue-based rollout and replay support in `docs/project-roadmap.md`
- [X] T036 Add docker-compose local setup and worker runbook steps in `specs/002-allocate-leftover-savings/quickstart.md`
- [X] T037 Run full gate verification (`npm run lint && npm run build && npm run test`) and capture outcomes in `specs/002-allocate-leftover-savings/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): no dependencies
- Foundational (Phase 2): depends on Setup; blocks all user stories
- User Stories (Phases 3-5): depend on Foundational completion
- Polish (Phase 6): can run in parallel, but final feature closure depends on all target stories complete

### User Story Dependency Graph

- US1 (P1): starts after Phase 2; queue-driven MVP slice
- US2 (P2): starts after Phase 2; strengthens eligibility/limits under queue flow
- US3 (P3): starts after Phase 2; adds replay-facing trust and summary clarity

Recommended completion order: `US1 -> US2 -> US3`

### Within Each User Story

- Add/expand tests first and confirm failing expectations for new behavior
- Implement queue/domain logic before route integration
- Implement route responses before UI wiring
- Complete story-level verification before next story

---

## Parallel Execution Opportunities

- Phase 1: T003 and T004 parallel after T001/T002 baseline
- Phase 2: T006 and T007 in parallel; T010 and T011 in parallel after T008
- US1: T013 and T014 in parallel; T019 and T020 in parallel after T015-T018
- US2: T021 and T022 in parallel; T024 and T026 in parallel after T023
- US3: T027 and T028 in parallel; T031 and T032 in parallel after T029-T030
- Phase 6: T033, T034, and T035 in parallel

## Parallel Example: User Story 1

```bash
# Parallel tests
Task: "T013 [US1] producer fan-out integration tests in tests/integration/month-end-allocation-queue.integration.test.ts"
Task: "T014 [US1] worker retry integration tests in tests/integration/month-end-allocation-worker.integration.test.ts"

# Parallel route/config split
Task: "T019 [US1] cron route enqueue flow in src/app/api/internal/jobs/month-end-remainder-allocation/route.ts"
Task: "T020 [US1] cron schedule config in vercel.json"
```

## Parallel Example: User Story 2

```bash
# Parallel tests
Task: "T021 [US2] contract eligibility tests in tests/contract/savings-remainder-allocation.contract.test.ts"
Task: "T022 [US2] integration eligibility tests in tests/integration/savings-remainder-allocation.integration.test.ts"

# Parallel implementation
Task: "T024 [US2] settings validation in src/app/api/savings/remainder-allocation/settings/route.ts"
Task: "T026 [US2] UI eligibility state in src/features/atelier/components/MonthlySavingsPlanCard.tsx"
```

## Parallel Example: User Story 3

```bash
# Parallel tests
Task: "T027 [US3] replay contract tests in tests/contract/month-end-allocation-queue.contract.test.ts"
Task: "T028 [US3] summary/replay integration tests in tests/integration/savings-remainder-allocation.integration.test.ts"

# Parallel localization
Task: "T031 [US3] English queue/replay copy in src/features/i18n/locales/en.json"
Task: "T032 [US3] Vietnamese queue/replay copy in src/features/i18n/locales/vi.json"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Deliver Phase 3 (US1) end-to-end with queue producer + worker.
3. Validate US1 independently using cron enqueue and per-user job processing.
4. Demo/release MVP increment.

### Incremental Delivery

1. Add US2 eligibility/limits hardening under queue path.
2. Add US3 replay + summary trust improvements.
3. Execute Phase 6 docs and quality gates.

### Suggested MVP Scope

- Complete through Phase 3 (US1) for first releasable increment.

## Changelog

| Version | Date | Updated By | Change Summary |
|---------|------|------------|----------------|
| v1.0.0 | 2026-04-08 | OpenCode Agent | Initial task list generated from spec/plan/research/data-model/contracts. |
| v1.1.0 | 2026-04-08 | OpenCode Agent | Regenerated tasks aligned to BullMQ queue-first plan and docker-compose local Redis setup. |
