# Data Model: Queue-Driven Monthly Remainder Allocation

## Overview

This revision keeps financial allocation data in existing Prisma models and introduces queue payload models for producer/worker orchestration.

## Persisted Entities

### 1) SavingsPlanMonthlyPriority

- **Purpose**: Stores month-specific priority percentages configured by user.
- **Fields**:
  - `id` (string, PK)
  - `userId` (string, FK -> User)
  - `savingsPlanId` (string, FK -> SavingsPlan)
  - `monthStart` (Date)
  - `priorityPercent` (decimal)
  - `createdAt` (DateTime)
  - `updatedAt` (DateTime)
- **Rules**:
  - Unique (`userId`, `savingsPlanId`, `monthStart`)
  - Priorities used in an allocation must normalize to 100%

### 2) Transaction (existing)

- **Purpose**: Audit log for applied allocations.
- **Required allocation fields**:
  - `type = transfer_to_saving_plan`
  - `savingsPlanId`
  - `notes` containing run metadata (`RUN_KEY`, `TRACE_MONTH`, `TRACE_PLAN`)

## Queue Domain Models (Redis/BullMQ)

### 3) MonthEndAllocationProducerJob

- **Queue name**: `month-end-allocation-control`
- **Job name**: `enqueue-month-batch`
- **Payload**:
  - `month` (YYYY-MM)
  - `requestedAt` (ISO datetime)
- **Idempotency key**:
  - `jobId = producer:{month}`

### 4) UserMonthAllocationJob

- **Queue name**: `month-end-allocation-user`
- **Job name**: `run-user-allocation`
- **Payload**:
  - `userId` (string)
  - `month` (YYYY-MM)
  - `triggerSource` (`cron` | `replay`)
- **Idempotency key**:
  - `jobId = allocation:{month}:{userId}`
- **Retry**:
  - `attempts` finite (e.g., 3-5)
  - `backoff` fixed/exponential

### 5) UserMonthReplayCommand

- **Purpose**: API-level command to enqueue exactly one user/month allocation job.
- **Fields**:
  - `userId` (required)
  - `month` (required, YYYY-MM)
  - `reason` (optional string)

## Relationships

- One producer job fan-outs many user allocation jobs.
- Each user allocation job executes one call to `executeSavingsRemainderAllocation`.
- One user/month job may create multiple `transfer_to_saving_plan` transactions.
- Replay command maps to exactly one user/month job enqueue request.

## State Transitions

### Producer lifecycle
`scheduled` -> `enqueued` -> `dispatched`

### User allocation lifecycle
`waiting` -> `active` -> (`completed` | `failed` -> `retrying` -> `completed/failed`)

### Replay lifecycle
`requested` -> `enqueued` -> `processed`

## Validation Rules

- User job must fail fast on invalid month/user.
- Duplicate enqueue of same `allocation:{month}:{userId}` must not create duplicate work items.
- Financial reconciliation invariant remains mandatory per job run:
  - `sourceRemainder = totalTransferred + unallocatedRemainder`.
