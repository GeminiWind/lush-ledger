# Phase 0 Research: Queue-Driven Month-End Remainder Allocation

## Decision 1: Use BullMQ as the queue engine with per-user job IDs

- **Decision**: Use BullMQ with one queue for month-end allocation worker jobs, where each user job ID is deterministic (`allocation:{month}:{userId}`) to prevent duplicate enqueues.
- **Rationale**: BullMQ natively supports retries/backoff and dedup semantics through deterministic job IDs. This directly supports replaying failed users independently.
- **Alternatives considered**:
  - Database polling worker: rejected due to higher implementation complexity and weaker retry ergonomics.
  - Keep direct API execution: rejected because it cannot isolate failures or replay by user cleanly.

## Decision 2: Cron triggers producer only; producer fans out per-user jobs

- **Decision**: Cron endpoint enqueues a batch producer action that fetches eligible users and adds per-user jobs to BullMQ; worker processes user jobs asynchronously.
- **Rationale**: Separating producer from worker avoids request-time bulk processing and allows controlled concurrency.
- **Alternatives considered**:
  - Cron directly loops all users and executes allocation synchronously: rejected because timeout risk and no queue-level replay.
  - One giant monthly job for all users: rejected because a single failure blocks partial recovery.

## Decision 3: Keep allocation business logic in `executeSavingsRemainderAllocation`

- **Decision**: Worker job handler calls existing domain service `executeSavingsRemainderAllocation({ trigger: "scheduled" })`.
- **Rationale**: Preserves existing tested financial logic and idempotency behavior while changing orchestration only.
- **Alternatives considered**:
  - Duplicate allocation logic inside worker: rejected because it risks divergence and regression.

## Decision 4: Add replay endpoint for specified user+month

- **Decision**: Add internal replay route to enqueue one user/month BullMQ job (`/api/internal/jobs/month-end-remainder-allocation/replay`).
- **Rationale**: Required operational capability to replay failed users without rerunning whole month batch.
- **Alternatives considered**:
  - Manual DB fix and rerun full cron: rejected due to risk and inefficiency.

## Decision 5: Retry strategy and backoff

- **Decision**: Configure per-user jobs with finite retry attempts and fixed/exponential backoff.
- **Rationale**: Temporary failures (DB lock, transient Redis/network glitches) should recover automatically.
- **Alternatives considered**:
  - No retries: rejected due to avoidable operational failures.
  - Infinite retries: rejected because it can hide permanent data problems and cause queue pressure.

## Decision 6: Queue observability via QueueEvents + structured logs

- **Decision**: Use BullMQ `QueueEvents` and structured logs for completed/failed user jobs.
- **Rationale**: Needed for monitoring success rate (SC-001) and identifying replay candidates.
- **Alternatives considered**:
  - Worker console logs only: rejected due to poor operational traceability.

## Decision 7: Redis requirement and failure mode

- **Decision**: Redis is required for scheduler/worker path; when unavailable, cron producer returns explicit error and does not fallback to synchronous allocation.
- **Rationale**: Fallback would bypass replay guarantees and create split execution models.
- **Alternatives considered**:
  - Silent fallback to synchronous API execution: rejected because it violates queue-first reliability design.

## Decision 8: BullMQ API patterns used

- **Decision**: Use BullMQ `Queue`, `Worker`, and `QueueEvents`; use deterministic IDs and scheduler-safe enqueue patterns.
- **Rationale**: Matches BullMQ docs for retries/backoff and repeat/scheduler usage.
- **Alternatives considered**:
  - Legacy Bull APIs only: rejected in favor of BullMQ-native patterns.

## Resolved Clarifications

- Queue technology: **BullMQ**.
- Scheduling control: **Cron triggers producer; worker handles per-user jobs**.
- Replay model: **Internal replay endpoint enqueues one user/month job**.
- Idempotency model: **Deterministic per-user/month job ID + existing allocation idempotency safeguards**.
