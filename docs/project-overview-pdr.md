# Project Overview (PDR)

## Product

Lush Ledger is a personal finance MVP for individual users to track money movement, monitor budgets, and review progress toward savings goals.

Primary user outcomes:
- know current wallet/account position
- capture transactions quickly
- control monthly spending limits
- see useful month-level trends

## MVP Scope

In scope:
- authentication (register, login, logout)
- account setup and balance tracking
- transaction ledger with recurring support
- budget controls in Atelier (monthly cap + category limits)
- reports and savings dashboards

Out of scope (current state):
- multi-user collaboration
- bank integration/sync
- advanced exports and external reporting pipelines
- notification engine and reminders

## Current Domain Surface

- Dashboard
- Ledger (`/app/ledger`, `/app/ledger/new`, `/app/ledger/reports`)
- Atelier (budget workspace)
- Accounts
- Savings (`/app/savings`, `/app/savings/cancelled`, `/app/savings/cancelled/[id]`)
- Settings (`/app/settings`)

Auth surface:
- `/login`
- `/register`

## Functional Status Snapshot

Implemented API surface:
- `/api/auth/{login,register,logout}` (POST)
- `/api/accounts` (GET/POST), `/api/accounts/[id]` (PATCH/DELETE)
- `/api/categories` (GET/POST), `/api/categories/[id]` (PATCH/DELETE, soft-delete)
- `/api/ledger` (GET/POST), `/api/ledger/[id]` (PATCH/DELETE), `/api/ledger/export` (GET, CSV)
- `/api/atelier` (GET), `/api/atelier/cap` (PATCH)
- `/api/savings/plans` (POST), `/api/savings/plans/[id]` (PATCH — also used for cancel/archive status transitions)
- `/api/savings/auto-transfer` (GET/PUT), `/api/savings/auto-transfer/latest-run` (GET)
- `/api/settings` (GET/PATCH)

Known feature/API gaps:
- no dedicated `/api/reports` endpoint — report data is computed server-side (`src/lib/ledger.ts` `getLedgerReportsData()`) and rendered client-side on `/app/ledger/reports`; this is the only remaining gap in the API surface as of this writing.

Note: accounts/categories/ledger update-and-delete, savings plan CRUD, and `/api/settings` are all implemented — earlier drafts of this document listed them as missing, which is no longer accurate.

## Non-Functional Priorities

- data isolation by authenticated user on all reads/writes
- deterministic monthly budget snapshots
- predictable recurring transaction generation
- documentation-first delivery for remaining roadmap phases

## Route and Feature Structure

Canonical authenticated routes live under `src/app/(dashboard)/app/*` (serving `/app/*` URLs).

Feature-specific UI/hooks/services live under `src/features/*`, and shared layout/UI building blocks live under `src/components/*`.

## Source of Truth Docs

- `docs/codebase-summary.md`
- `docs/system-architecture.md`
- `docs/project-roadmap.md`
- `docs/code-standards.md`
- `docs/design-guidelines.md`
- `docs/deployment-guide.md`
