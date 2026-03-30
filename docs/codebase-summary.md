# Codebase Summary

## Repository Shape

- Framework: Next.js App Router
- Main app code: `src/app`
- API routes: `src/app/api/*`
- Domain/business utilities: `src/lib/*`
- Data schema: `prisma/schema.prisma`

## Route Structure

Canonical route tree (active):
- `src/app/app/page.tsx` -> `/app`
- `src/app/app/ledger/page.tsx` -> `/app/ledger`
- `src/app/app/ledger/new/page.tsx` -> `/app/ledger/new`
- `src/app/app/ledger/reports/page.tsx` -> `/app/ledger/reports`
- `src/app/app/atelier/page.tsx` -> `/app/atelier`
- `src/app/app/accounts/page.tsx` -> `/app/accounts`
- `src/app/app/savings/page.tsx` -> `/app/savings`

Auth routes:
- `src/app/(auth)/login/page.tsx` -> `/login`
- `src/app/(auth)/register/page.tsx` -> `/register`

Legacy/parallel tree (overlapping, partially stale):
- `src/app/(app)/*`

Recommendation:
- treat `src/app/app/*` as canonical product surface
- avoid adding new UX flows to `src/app/(app)/*`

## API Inventory

Implemented:
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/accounts`
- `POST /api/accounts`
- `PATCH /api/accounts/[id]` (balance-oriented partial update)
- `GET /api/categories`
- `POST /api/categories`
- `GET /api/ledger`
- `POST /api/ledger`
- `GET /api/atelier`
- `PATCH /api/atelier/cap`

Missing or partial:
- missing `/api/reports`
- missing `/api/savings` CRUD
- missing `/api/settings`
- accounts missing full update/delete
- categories missing update/delete
- ledger transactions missing update/delete

## Data Model Snapshot

Core models in `prisma/schema.prisma`:
- `User`
- `UserSettings` (`currency`, `unallocatedBackup`)
- `Account`
- `Category` (`monthlyLimit`)
- `Transaction` (includes recurring fields and template metadata)
- `SavingsPlan`
- `UserMonthlyCap` (monthly cap snapshot)
- `CategoryMonthlyLimit` (monthly category snapshot)

## Key Runtime Modules

- Auth/session: `src/lib/auth.ts`, `src/middleware.ts`
- Monthly snapshot strategy: `src/lib/monthly-cap.ts`
- Recurring generation: `src/lib/recurring.ts`
- Domain calculations: `src/lib/dashboard.ts`, `src/lib/ledger.ts`, `src/lib/atelier.ts`, `src/lib/wallet.ts`

## UI Domains

- Dashboard
- Ledger (+ New, + Reports)
- Atelier (budgets)
- Accounts
- Savings

Charts:
- Recharts used in reports/savings/top-categories style visualizations
- `ledger/reports` includes dedicated monthly cashflow trend (income vs expense) and monthly expense vs budget chart

## Active Tech Debt

- parallel route trees (`app/*` and `(app)/*`) increase navigation drift risk
- API surface is uneven across domains (create/list strong, update/delete weaker)
- roadmap references and implementation naming differ in a few areas (`reports` vs `ledger/reports`)
