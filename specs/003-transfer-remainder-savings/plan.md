# Implementation Plan: Month-End Remainder Transfer to Savings Plan

## Metadata

- **Name**: Month-End Remainder Transfer to Savings Plan
- **Last Updated**: 2026-04-08
- **Updated By**: OpenCode Agent
- **Version**: v1.0.3

**Branch**: `003-transfer-remainder-savings`  
**Date**: 2026-04-08  
**Spec**: `specs/003-transfer-remainder-savings/spec.md`

---

## Summary

Implement user-configurable month-end auto-transfer that splits a percentage of positive remainder across multiple savings plans using per-plan allocations, with cap-by-remaining-target applied per plan. The approach adds user-scoped configuration APIs, month-end execution logic with idempotency per user/month, Atelier UI updates for configuration and latest run status, Ledger visibility for transfer transactions, and Savings UI updates for progress impact.

---

## Technical Context

**Frontend**: Next.js App Router + React + TypeScript  
**Backend**: Next.js Route Handlers (server-side) + domain modules in `src/lib/*` + BullMQ workers for month-end orchestration  
**Database**: SQLite via Prisma  
**Auth**: Session cookie (`pf_session`) with JWT verification in existing auth helpers  
**Queue/Infra**: BullMQ backed by Redis; one queue item per target user per month-end cycle  
**Scheduler**: `node-cron` job to trigger month-end orchestration and enqueue user jobs  

**Testing**:
- FE: Vitest component/state tests where UI logic changes
- BE: Vitest contract/integration tests for route handlers and month-end behavior
- E2E: None required for this increment (covered by contract + integration flows)

**Target Platform**: Web (authenticated `/app/*` flows)  
**Performance Goals**:
- p95 config read/write interaction <= 200ms on local reference dataset
- month-end processing average <= 1s per user on reference dataset
**Constraints**:
- Must preserve strict per-user data isolation
- Must produce at most one auto-transfer result per user per month (retry-safe)
- Queue orchestration must enqueue work per user (`jobId`/dedup key includes user + month) to prevent duplicate month-end processing
- Must follow canonical route structure and design guidelines

### Scheduling and Queue Decision

- We will use both `node-cron` and BullMQ.
- `node-cron` is responsible for month-end timing and triggering orchestration.
- BullMQ is responsible for durable per-user execution, retries, deduplication, and concurrency control.
- Each BullMQ job represents one user for one month-end window.
- This combination is required to keep scheduling simple while preserving reliable background processing.

---

## Architecture Overview

- Frontend extends Atelier UI to configure auto-transfer (enable, multiple plan allocations with percentages)
- Frontend uses TanStack Query for read/write and refreshes savings/ledger views on success
- Backend exposes user-scoped settings/read endpoints and returns structured validation errors
- `node-cron` scheduler triggers month-end orchestration, then BullMQ processes one user per job, computes remainder, applies per-plan cap-to-target rule, and writes transfer records when eligible
- Backend records applied/skipped outcome for auditability and UI display
- Shared domain logic in `src/lib/*` keeps transfer calculations and idempotency checks centralized

---

## Architecture Flow (Frontend ↔ Backend)

- User opens Atelier settings UI
- Frontend requests current auto-transfer rule and latest run outcome
- User updates rule and submits
- Backend validates: plan ownership, plan status (`active`/`funded`), per-row percentage range, unique plan rows, total allocation range, rule state
- Backend persists rule and returns normalized config
- Month-end processor runs using each user timezone cutoff
- `node-cron` orchestrator runs on month-end schedule and enqueues one BullMQ job per user for that cutoff window
- Worker processes user job with dedup (`userId + monthStart`) and retry-safe idempotency checks
- Processor computes per-plan amounts, caps by remaining target, writes ledger-linked transfers when applicable
- Frontend shows status via loading/error/success states and updated savings progress/history

---

## Project Structure

### Documentation (this feature)

```text
specs/003-transfer-remainder-savings/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── get-savings-auto-transfer.md
│   ├── put-savings-auto-transfer.md
│   └── get-savings-auto-transfer-latest-run.md
└── tasks.md
```

### Source Code (repository root)

```text
prisma/
  schema.prisma

src/
  app/
    (dashboard)/
      app/
        atelier/
          page.tsx
        savings/
          page.tsx
    api/
      savings/
        auto-transfer/
          route.ts
        auto-transfer/
          latest-run/
            route.ts
  features/
    savings/
      components/
        auto-transfer-settings.tsx
      hooks/
        use-auto-transfer.ts
  lib/
    savings-auto-transfer.ts
    savings-auto-transfer-queue.ts
    savings-auto-transfer-scheduler.ts

tests/
  contract/
    savings-auto-transfer-api.contract.test.ts
  integration/
    savings-auto-transfer-month-end.integration.test.ts
```

**Structure Decision**: Use existing Next.js + feature-module architecture with domain logic in `src/lib/*`, API handlers in `src/app/api/*`, and test placement under `tests/contract` and `tests/integration` to match current repository conventions.

---

## Phase 0: Research Output

Research complete in `specs/003-transfer-remainder-savings/research.md`.

Resolved decisions include:
- month-end cutoff based on each user timezone
- idempotent once-per-user-per-month execution model
- per-plan cap-at-target transfer behavior
- clear applied/skipped outcome model for support and UI traceability

No unresolved `NEEDS CLARIFICATION` items remain.

---

## Data Model

Detailed data definitions live in `specs/003-transfer-remainder-savings/data-model.md`.

Primary entities:
- AutoTransferRule
- AutoTransferRun
- SavingsTransferRecord (transaction linkage)

## Contracts

Detailed API contracts live in `specs/003-transfer-remainder-savings/contracts/`.

Primary contracts:
- `GET /api/savings/auto-transfer`
- `PUT /api/savings/auto-transfer`
- `GET /api/savings/auto-transfer/latest-run`

---

## UI Implementation Plan

### Pages

- `/app/atelier`: add and manage auto-transfer configuration, and show latest run outcome
- `/app/ledger`: show transfer transactions from month-end auto-transfer
- `/app/savings`: show savings progress impact from month-end auto-transfer

### Components

- `AutoTransferSettings` panel with:
  - enable/disable toggle
  - allocation list editor (multi-row)
  - per-plan percentage input
  - eligible plan selector per row
  - required red `(*)` markers for required fields
  - latest run status summary

### State Management

- TanStack Query `useQuery` for config/run reads
- TanStack Query `useMutation` for config updates
- query invalidation on successful mutation for savings-related keys

### User Interaction Flow

- User opens settings panel
- UI loads config + eligible plans
- User edits and saves
- Mutation validates server-side and returns persisted state
- UI shows loading/error/success and refreshes related summaries

### UI States

- loading: disabled form controls + skeleton/placeholder
- error: actionable validation/system message
- success: inline confirmation
- empty: guidance when no eligible plans exist
- informational: latest run skipped reason when no transfer applied

### Data Fetching

- Initial load: fetch rule + latest run + eligible plans
- Refresh after mutation: invalidate and refetch affected savings data

---

## Backend Implementation Plan

- Define/extend persistence for auto-transfer rule and run outcome records
- Implement `GET/PUT` auto-transfer configuration endpoints with auth and ownership checks
- Implement latest-run read endpoint for UI status
- Implement BullMQ queue orchestration for month-end runs:
  - enqueue one job per user for each month-end cycle
  - set deterministic `jobId`/dedup key with `userId + monthStart`
  - configure worker concurrency and retry/backoff for transient failures
- Implement `node-cron` scheduler job for month-end trigger:
  - run scheduler once per day from day `27` through day `1` (UTC calendar), and on each run enqueue users whose local timezone has just crossed month-end boundary
  - evaluate user-specific timezone month boundaries before enqueue
  - ensure scheduler run is safe to retry without duplicate effective processing
- Implement month-end processing service in `src/lib/savings-auto-transfer.ts`:
  - remainder computation
  - cap-to-target calculation
  - per-user/month idempotency guard
  - applied/skipped result recording
- Ensure transfer writes remain auditable via transaction linkage to savings plan
- Return consistent structured errors for invalid configuration or unavailable plan

---

## UI ↔ API Mapping

### Page Load

- Open Atelier/Savings auto-transfer settings  
  -> `GET /api/savings/auto-transfer`  
  -> UI update: render current rule, eligible plans, latest known status

- Open latest month-end outcome panel  
  -> `GET /api/savings/auto-transfer/latest-run`  
  -> UI update: applied/skipped state with amount/reason on `/app/atelier`

- Open savings progress and transfer history view  
- Open ledger transaction history view  
  -> existing ledger reads include transfer transaction records  
  -> UI update: reflect month-end auto-transfer transactions on `/app/ledger` with date, amount, destination plan, and transfer type label

- Open savings progress view  
  -> existing savings reads and transfer-linked progress calculation  
  -> UI update: reflect updated savings progress on `/app/savings`

### Update Configuration Flow

- Click save in auto-transfer settings  
  -> `PUT /api/savings/auto-transfer`  
  -> payload: enabled, allocations[]  
  -> success: persist and refresh settings + savings summary  
  -> error: inline validation or general error messaging

### Month-End Processing Flow

- `node-cron` invokes month-end orchestration job  
  -> scheduler enqueues one BullMQ job per eligible user  
  -> worker runs domain service for that user  
  -> writes applied transfer (or skipped outcome) once per user/month  
  -> UI reflects results on next load

---

## Testing Strategy

### Frontend

- settings panel render with existing config
- validation behavior for missing plan, duplicate plan, invalid percentage, and total allocation > 100
- success/error state transitions after save

### Backend

- contract tests for `GET/PUT` config and latest-run endpoint
- integration tests for month-end scenarios:
  - positive remainder -> transfer created
  - non-positive remainder -> skipped with reason
  - over-target computed amount -> per-plan capped transfer
  - multiple plan allocations -> per-plan results recorded
  - retry same month -> no duplicate transfer
  - duplicated queue enqueue attempt for same user/month -> single effective execution
  - repeated scheduler trigger within same month-end window -> no duplicate effective processing

### E2E

- not required for this increment; contract + integration suite is the delivery baseline

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Code quality gate defined (lint/build/type safety and reuse strategy)
- [x] Testing strategy defined (automated coverage for changed behavior)
- [x] UX consistency gate defined (design-guidelines and canonical route alignment)
- [x] Performance budget defined (p95 target and validation method)
- [x] Documentation impact captured (`docs/codebase-summary.md`,
      `docs/system-architecture.md`, `docs/project-roadmap.md`)

### Post-Design Re-Check

- [x] No constitution violations introduced by Phase 1 artifacts
- [x] Design keeps changes small, traceable, and reversible

## Risks / Trade-offs
- Risk: month-end processing can become expensive with user growth; mitigation is per-user batching and idempotent checkpoints.
- Risk: queue infrastructure introduces Redis operational dependency; mitigation is health checks, retry/backoff policy, and failed-job monitoring.
- Risk: scheduler timing drift or timezone mismatch; mitigation is per-user timezone boundary checks at enqueue time plus idempotent processing.
- Risk: ambiguity in remainder semantics across historical data; mitigation is explicit tested calculation aligned to current monthly snapshot behavior.
- Trade-off: no E2E coverage in this increment to keep scope small; compensated with API contract + integration coverage on business-critical logic.

## Changelog

| Version | Date | Updated By | Change Summary |
|---------|------|------------|----------------|
| v1.0.0 | 2026-04-08 | OpenCode Agent | Created implementation plan with research/design outputs and constitution checks. |
| v1.0.1 | 2026-04-08 | OpenCode Agent | Added BullMQ orchestration plan with per-user queue jobs and dedup/idempotency requirements. |
| v1.0.2 | 2026-04-08 | OpenCode Agent | Added node-cron month-end scheduler to trigger BullMQ per-user orchestration jobs. |
| v1.0.3 | 2026-04-08 | OpenCode Agent | Explicitly documented decision to keep node-cron + BullMQ combination and responsibilities. |
