# Project Overview (PDR)

## Product

Smart Form is a personal finance MVP for individual users to track money movement, monitor budgets, and review progress toward savings goals.

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
- Savings

Auth surface:
- `/login`
- `/register`

## Functional Status Snapshot

Implemented API surface:
- `/api/auth/{login,register,logout}`
- `/api/accounts` (GET/POST)
- `/api/accounts/[id]` (PATCH balance)
- `/api/categories` (GET/POST)
- `/api/ledger` (GET/POST)
- `/api/atelier` (GET)
- `/api/atelier/cap` (PATCH)

Known feature/API gaps:
- no `/api/reports`
- no `/api/savings` CRUD
- no `/api/settings`
- no update/delete APIs for accounts/categories/ledger transactions

## Non-Functional Priorities

- data isolation by authenticated user on all reads/writes
- deterministic monthly budget snapshots
- predictable recurring transaction generation
- documentation-first delivery for remaining roadmap phases

## Canonical vs Legacy Route Trees

Canonical active app routes live under `src/app/app/*`.

There is a parallel legacy route group under `src/app/(app)/*` with overlapping pages and stale links. It should be treated as legacy until deprecation/cleanup is planned.

## Source of Truth Docs

- `docs/codebase-summary.md`
- `docs/system-architecture.md`
- `docs/project-roadmap.md`
- `docs/code-standards.md`
- `docs/design-guidelines.md`
- `docs/deployment-guide.md`
