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
- auth login/register endpoints use in-memory exponential backoff keyed by `scope + client IP + normalized identity` via `src/lib/rate-limit.ts`
- logout route is explicitly exempted in middleware pre-check

Validation and error flow:
- registration and login validation share normalization/policy helpers in `src/features/auth/validation.ts`
- auth handlers return structured validation payloads (`error` + optional field `errors`) for client-side form mapping

## Domain Architecture

### Ledger and Accounts
- API: `/api/accounts`, `/api/accounts/[id]`, `/api/ledger`, `/api/ledger/export`
- Supports list/create plus partial balance update for accounts
- Ledger supports list/create and recurring metadata capture
- Savings contributions are stored as ledger transactions with `type = transfer_to_saving_plan` and linked via `savingsPlanId`
- Ledger export path (`src/lib/ledger-export.ts`) applies authenticated user scoping, validates filter input, and serializes RFC-4180-safe CSV output for spreadsheet compatibility

### Budgets (Atelier)
- API: `/api/atelier`, `/api/atelier/cap`, `/api/categories`, `/api/categories/[id]`
- Monthly snapshot strategy lives in `src/lib/monthly-cap.ts`
- Category monthly limits are snapshotted for historical consistency
- `GET /api/atelier` accepts optional `month=YYYY-MM` and returns month-scoped list rows for all user categories
- Atelier list rows include per-category warning controls (`warningEnabled`, `warnAt`) from `CategoryMonthlyLimit` snapshots
- Carry-next-month visibility is derived by comparing selected-month and next-month limit snapshots per category
- Risk status precedence is deterministic: `overspent > warning > healthy`, with `pending` for partial snapshot data
- `PATCH /api/categories/[id]` validates positive limits and enforces case-insensitive duplicate-name rejection
- Category update validation and business failures return structured payloads (`error` + field `errors`) for dialog field mapping
- When warning toggle is disabled in category update, persisted `warnAt` is preserved and not actively validated until warning is re-enabled

### Recurring Transactions
- Recurring generation and schedule logic: `src/lib/recurring.ts`
- Transaction model stores template and schedule fields

### Month-End Auto Transfer
- APIs: `/api/savings/auto-transfer`, `/api/savings/auto-transfer/latest-run`
- Rule persistence: `AutoTransferRule` (single rule per user, multiple destination allocations)
- Run persistence: `AutoTransferRun` (single run per `userId + monthStart`, per-plan outcomes)
- Orchestration: `node-cron` scheduler (`src/lib/savings-auto-transfer-scheduler.ts`) enqueues due users, BullMQ worker (`src/lib/savings-auto-transfer-queue.ts`) executes one user/month job with deterministic `jobId`
- Execution logic: `src/lib/savings-auto-transfer.ts` computes remainder, caps transfer by remaining target, writes `transfer_to_saving_plan` transactions, and records applied/skipped plan results

### Savings and Reports
- UI exists for savings and report views
- Savings screen now supports active-plan selection driven by `SavingsPlan.status` (`active`/`cancelled`/`archive`) and `isPrimary`
- Savings primary goal block shows derived progression state (`active`/`funded`/`completed`) from contributions versus target
- Savings cancel control is intentionally available only for `active` and `funded` states
- Cancelling a savings plan writes a wallet-side `refund` transaction back to the default wallet and links it to the cancelled plan for auditability
- Savings screen supports in-place "Add Contribution" dialog that writes income transactions linked by `Transaction.savingsPlanId`
- `ledger/reports` includes client-rendered monthly cashflow trend (income vs expense) and expense-vs-budget charting via Recharts
- Dedicated report/savings APIs are incomplete (see gaps below)

## Data Architecture

Primary entities:
- `User`, `UserSettings`
- `Account`, `Category`, `Transaction`
- `SavingsPlan` (`status`, `isPrimary`, target + contribution + due date)
- `AutoTransferRule`, `AutoTransferRun`
- `UserMonthlyCap`, `CategoryMonthlyLimit`

Design patterns:
- strong user isolation via foreign keys and per-user query filtering
- denormalized month snapshots for stable month-end budget reporting
- recurring templates tracked in `Transaction` with schedule metadata

## Known Gaps and Tech Debt

- no `/api/reports`
- no `/api/savings` CRUD
- no `/api/settings`
- no update/delete for ledger transactions

## Canonical Architecture Decision

Use `src/app/(dashboard)/app/*` as the canonical authenticated route tree.
