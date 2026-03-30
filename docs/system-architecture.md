# System Architecture

## High-Level View

Smart Form is a server-rendered Next.js App Router application with route handlers for APIs, Prisma for data access, and SQLite as the default persistence layer.

Main layers:
- UI routes (`src/app/app/*`, `src/app/(auth)/*`)
- API routes (`src/app/api/*`)
- domain services/utilities (`src/lib/*`)
- data models (`prisma/schema.prisma`)

## Request Flow

1. Request enters Next.js middleware (`src/middleware.ts`).
2. Public paths are allowed (`/login`, `/register`, auth login/register APIs).
3. Private paths require valid session from cookie token via `src/lib/auth.ts`.
4. Route handler or page module executes domain logic.
5. Prisma reads/writes SQLite and returns user-scoped data.

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
- API: `/api/accounts`, `/api/accounts/[id]`, `/api/ledger`
- Supports list/create plus partial balance update for accounts
- Ledger supports list/create and recurring metadata capture

### Budgets (Atelier)
- API: `/api/atelier`, `/api/atelier/cap`, `/api/categories`
- Monthly snapshot strategy lives in `src/lib/monthly-cap.ts`
- Category monthly limits are snapshotted for historical consistency

### Recurring Transactions
- Recurring generation and schedule logic: `src/lib/recurring.ts`
- Transaction model stores template and schedule fields

### Savings and Reports
- UI exists for savings and report views
- `ledger/reports` includes client-rendered monthly cashflow trend (income vs expense) and expense-vs-budget charting via Recharts
- Dedicated report/savings APIs are incomplete (see gaps below)

## Data Architecture

Primary entities:
- `User`, `UserSettings`
- `Account`, `Category`, `Transaction`
- `SavingsPlan`
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
- legacy overlapping route tree `src/app/(app)/*` remains in repo

## Canonical Architecture Decision

Use `src/app/app/*` as the canonical authenticated route tree.

Treat `src/app/(app)/*` as legacy until a dedicated migration/removal phase is executed.
