# Quickstart: Queue-Driven Swap Remaining to Savings Plan

## Goal

Validate cron-triggered producer + BullMQ per-user worker jobs for month-end remainder allocation, including replay for a specified user.

## Prerequisites

- Redis running and reachable from app runtime.
- For local development, start Redis with Docker Compose:
  - `docker compose up -d redis`
- Queue env configured (example):
  - `REDIS_HOST`
  - `REDIS_PORT`
  - `REDIS_PASSWORD` (optional)
- Internal job secret configured for protected internal endpoints.
- Prisma schema migrated with `SavingsPlanMonthlyPriority`.

## Flow

1. Cron triggers internal producer route once at month-end.
2. Producer enqueues one job per user (`allocation:{month}:{userId}`).
3. Worker processes each user job by calling `executeSavingsRemainderAllocation`.
4. Failed jobs retry automatically by attempts/backoff policy.
5. Ops can replay one failed user with replay endpoint.

## Validation Commands

```bash
npm install
npm run prisma:generate
npm run lint
npm run build
npm run test
```

## Local Runbook

1. Start Redis: `docker compose up -d redis`.
2. Start Next.js app: `npm run dev`.
3. Start queue worker in a separate terminal: `npm run worker:month-end`.
4. Trigger cron producer endpoint with internal key:

```bash
curl -X GET "http://localhost:3000/api/internal/jobs/month-end-remainder-allocation?month=2026-04" \
  -H "x-internal-job-key: $INTERNAL_JOB_SECRET"
```

5. Trigger replay for one user/month:

```bash
curl -X POST "http://localhost:3000/api/internal/jobs/month-end-remainder-allocation/replay" \
  -H "Content-Type: application/json" \
  -H "x-internal-job-key: $INTERNAL_JOB_SECRET" \
  -d '{"userId":"<user-id>","month":"2026-04","reason":"manual_replay"}'
```

## Runtime Checks

1. Trigger producer (internal/cron path) and verify user jobs enqueued.
2. Verify successful jobs create `transfer_to_saving_plan` transactions with trace notes.
3. Force one user failure (test fixture/mock) and verify job retries.
4. Replay the failed user via replay endpoint and verify eventual success.
5. Re-trigger producer for same month and verify job dedup (no duplicate processing for completed user jobs).

## Expected Outcomes

- Cron controls queue producer, not direct bulk allocation execution.
- Each user has isolated queue job for failure isolation and replay.
- Replay for specified user/month is supported without rerunning all users.
- Allocation correctness and reconciliation invariants remain unchanged.

## Gate Verification Results

- `npm run lint`: pass (1 pre-existing warning in `src/features/savings/pages/CancelledSavingsPlanDetailPageView.tsx` for `@next/next/no-img-element`)
- `npm run build`: pass (BullMQ webpack warning: dynamic dependency in `child-processor.js`)
- `npm run test`: pass (17 files, 103 tests)
