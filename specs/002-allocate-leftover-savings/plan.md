# Implementation Plan: Allocate Monthly Remainder to Savings Plans (Queue-Driven)

## Metadata

- **Name**: Allocate Monthly Remainder to Savings Plans (Queue-Driven)
- **Last Updated**: 2026-04-08
- **Updated By**: OpenCode Agent
- **Version**: v1.1.0

**Branch**: `002-allocate-leftover-savings` | **Date**: 2026-04-08 | **Spec**: `/Users/haidv7/Desktop/Workspace/Perrsonal/lush-ledger/specs/002-allocate-leftover-savings/spec.md`
**Input**: Feature specification from `/Users/haidv7/Desktop/Workspace/Perrsonal/lush-ledger/specs/002-allocate-leftover-savings/spec.md`

## Summary

Replace direct month-end execution with a queue-first architecture using BullMQ. A cron job enqueues one month batch producer job, which fan-outs one per-user allocation job (`userId + month`) so failed users can be replayed independently. Allocation logic remains in `src/lib/savings-remainder-allocation.ts`, while scheduling, enqueueing, and worker processing are separated to improve reliability, retries, and operational replay.

## Technical Context

**Language/Version**: TypeScript (^5), Next.js App Router, Node.js runtime  
**Primary Dependencies**: Next.js route handlers, Prisma ORM, BullMQ, Redis client (`ioredis`), existing auth/session helpers  
**Storage**: SQLite (Prisma models) + Redis (BullMQ queue state)  
**Testing**: Vitest contract/integration tests + queue flow tests with mocked BullMQ adapters  
**Target Platform**: Vercel production (cron trigger) + Node worker runtime for BullMQ consumers  
**Project Type**: Full-stack web application with background job processing  
**Performance Goals**: Queue enqueue for all users completes within 60s; per-user job completes within 3s p95 for <=30 eligible plans  
**Constraints**: Idempotent per `userId+month`; replay by user must be supported; cron triggers queue control only; no duplicate transfer transactions; strict user scoping  
**Scale/Scope**: Up to tens of thousands of users monthly, processed in queue batches; replay for individual failed users

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Code quality gate defined (thin handlers, queue adapter layer, shared domain logic in `src/lib/*`)
- [x] Testing strategy defined (contract + integration + queue replay/idempotency tests)
- [x] UX consistency gate defined (Atelier/Savings UI contracts unchanged, queue is backend-only)
- [x] Performance budget defined (enqueue latency + per-user allocation p95)
- [x] Documentation impact captured (`docs/codebase-summary.md`, `docs/system-architecture.md`, `docs/project-roadmap.md`)

### Post-Design Constitution Re-Check

- [x] Queue control and worker logic are isolated from route handlers; business logic remains reusable.
- [x] Test plan includes producer fan-out, worker processing, retry, and per-user replay.
- [x] UI interaction contracts remain stable while backend execution path changes.
- [x] Performance mitigation includes per-user jobs + queue concurrency controls.
- [x] Documentation updates are explicitly listed in Phase 6 follow-up tasks.

## Project Structure

### Documentation (this feature)

```text
specs/002-allocate-leftover-savings/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── savings-remainder-allocation.openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── api/internal/jobs/month-end-remainder-allocation/route.ts
│   ├── api/internal/jobs/month-end-remainder-allocation/replay/route.ts
│   └── api/savings/remainder-allocation/route.ts
├── lib/
│   ├── savings-remainder-allocation.ts
│   ├── queue/
│   │   ├── connection.ts
│   │   ├── month-end-allocation-queue.ts
│   │   ├── producer.ts
│   │   └── worker.ts
│   └── month-end-allocation-cron.ts
└── features/
    └── atelier/components/MonthlySavingsPlanCard.tsx

tests/
├── contract/
│   ├── month-end-allocation-queue.contract.test.ts
│   ├── savings-remainder-allocation.contract.test.ts
│   └── savings-remainder-settings.contract.test.ts
└── integration/
    ├── month-end-allocation-queue.integration.test.ts
    ├── month-end-allocation-worker.integration.test.ts
    └── savings-remainder-allocation.integration.test.ts
```

**Structure Decision**: Keep existing Next.js monolith and add a queue module under `src/lib/queue/*` for BullMQ producer/worker orchestration. Internal cron route triggers queue producer only; worker processes per-user jobs and calls existing allocation service.

## Complexity Tracking

No constitution violations identified; no exceptions required.

## Changelog

| Version | Date | Updated By | Change Summary |
|---------|------|------------|----------------|
| v1.0.0 | 2026-04-08 | OpenCode Agent | Initial implementation plan generated from template. |
| v1.1.0 | 2026-04-08 | OpenCode Agent | Revised plan to queue-driven month-end processing with BullMQ per-user jobs and cron-controlled producer. |
