# System Architecture

## High-Level View

Lush Ledger is a server-rendered Next.js App Router application with route handlers for APIs, Prisma for data access, and SQLite as the default persistence layer.

Main layers:
- UI routes (`src/app/(public)/*`, `src/app/(auth)/*`, `src/app/(dashboard)/app/*`)
- feature modules (`src/features/*` for UI components/hooks/services)
- client API state/caching (TanStack Query via `src/app/QueryProvider.tsx`)
- API routes (`src/app/api/*`)
- domain services/utilities (`src/lib/*`)
- data models (`prisma/schema.prisma`)
- background queue layer (BullMQ + Redis in `src/lib/queue/*`)

## Request Flow

1. Request enters Next.js middleware (`src/middleware.ts`).
2. Public paths are allowed (`/login`, `/register`, auth login/register APIs).
3. Private paths require valid session from cookie token via `src/lib/auth.ts`.
4. Route handler or page module executes domain logic.
5. Prisma reads/writes SQLite and returns user-scoped data.

Client mutation flow:
- UI forms/dialogs call route handlers via TanStack Query `useMutation`
- on success: invalidate relevant query keys and run `router.refresh()`

## Authentication Architecture

- Password hashing: `bcryptjs`
- Token signing/verification: `jose`
- Session transport: httpOnly cookie (`pf_session`)
- Server auth helpers: `src/lib/auth.ts`
- Edge protection: `src/middleware.ts`

Notes:
- auth rate limiting is not implemented yet
- logout route is explicitly exempted in middleware pre-check

## Domain Architecture

### Ledger and Accounts
- API: `/api/accounts`, `/api/accounts/[id]`, `/api/ledger`, `/api/ledger/export`
- Supports list/create plus partial balance update for accounts
- Ledger supports list/create and recurring metadata capture
- Savings contributions are stored as ledger transactions with `type = transfer_to_saving_plan` and linked via `savingsPlanId`
- Ledger export path (`src/lib/ledger-export.ts`) applies authenticated user scoping, validates filter input, and serializes RFC-4180-safe CSV output for spreadsheet compatibility

### Budgets (Atelier)
- API: `/api/atelier`, `/api/atelier/cap`, `/api/categories`
- Monthly snapshot strategy lives in `src/lib/monthly-cap.ts`
- Category monthly limits are snapshotted for historical consistency

### Recurring Transactions
- Recurring generation and schedule logic: `src/lib/recurring.ts`
- Transaction model stores template and schedule fields

### Savings and Reports
- UI exists for savings and report views
- Savings screen now supports active-plan selection driven by `SavingsPlan.status` (`active`/`cancelled`/`archive`) and `isPrimary`
- Savings primary goal block shows derived progression state (`active`/`funded`/`completed`) from contributions versus target
- Savings cancel control is intentionally available only for `active` and `funded` states
- Cancelling a savings plan writes a wallet-side `refund` transaction back to the default wallet and links it to the cancelled plan for auditability
- Savings screen supports in-place "Add Contribution" dialog that writes income transactions linked by `Transaction.savingsPlanId`
- `ledger/reports` includes client-rendered monthly cashflow trend (income vs expense) and expense-vs-budget charting via Recharts
- Dedicated report/savings APIs are incomplete (see gaps below)
- Month-end savings remainder allocation is queue-driven:
  - cron/internal route enqueues per-user month jobs (`/api/internal/jobs/month-end-remainder-allocation`)
  - BullMQ producer fans out one deterministic job per user (`allocation:{month}:{userId}`)
  - worker processes each job via `executeSavingsRemainderAllocation`
  - replay endpoint re-enqueues one user/month for failure recovery (`/api/internal/jobs/month-end-remainder-allocation/replay`)

## Background Job Architecture

- Redis connection factory: `src/lib/queue/connection.ts`
- Queue/job contracts and defaults: `src/lib/queue/month-end-allocation-queue.ts`
- Producer orchestration: `src/lib/queue/producer.ts`
- Worker processor entrypoint: `src/lib/queue/worker.ts`
- Cron gating helper: `src/lib/month-end-allocation-cron.ts`

## Data Architecture

Primary entities:
- `User`, `UserSettings`
- `Account`, `Category`, `Transaction`
- `SavingsPlan` (`status`, `isPrimary`, target + contribution + due date)
- `UserMonthlyCap`, `CategoryMonthlyLimit`

Design patterns:
- strong user isolation via foreign keys and per-user query filtering
- denormalized month snapshots for stable month-end budget reporting
- recurring templates tracked in `Transaction` with schedule metadata

## Known Gaps and Tech Debt

- no `/api/reports`
- no `/api/savings` CRUD
- no `/api/settings`
- no update/delete for accounts/categories/ledger transactions

## Canonical Architecture Decision

Use `src/app/(dashboard)/app/*` as the canonical authenticated route tree.
