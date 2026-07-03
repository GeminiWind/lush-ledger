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

1. Request enters Next.js middleware (`src/middleware.ts`, matcher `/:path*`).
2. Static assets (`/_next`, `/images`, `/favicon`, common file extensions) and `/api/auth/logout` are always passed through.
3. Public paths are allowed without a session: `/login`, `/register`, `POST /api/auth/login`, `POST /api/auth/register`.
4. All other paths require a valid session (via `getSessionFromRequest` in `src/lib/auth.ts`) — API paths get a `401 JSON` response, page paths get a redirect to `/login`.
5. `src/app/(dashboard)/app/layout.tsx` calls `getCurrentUser()` to fetch the authenticated user's DB record (`User` + `settings`) before rendering `AppChrome`. Middleware is the sole auth gate; `getCurrentUser()` only redirects defensively if the DB user row is missing (e.g. deleted mid-session).
6. Route handler or page module executes domain logic.
7. Prisma reads/writes SQLite and returns user-scoped data.

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
- API: `/api/accounts`, `/api/accounts/[id]` (PATCH, DELETE), `/api/ledger`, `/api/ledger/[id]` (PATCH, DELETE), `/api/ledger/export`
- Accounts support list/create/update/delete
- Ledger supports list/create/update/delete and recurring metadata capture
- Ledger activity UI groups transactions by derived day sections in this order: `Today`, `Yesterday`, then older locale-formatted calendar dates (frontend-only grouping; API remains flat list)
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
- `DELETE /api/categories/[id]` applies user-scoped soft-delete (`deletedAt`) and excludes soft-deleted categories from active Atelier reads
- delete flow enforces auth + ownership and returns `404` for missing/already soft-deleted categories
- delete flow blocks removal of the system `Uncategorized` category
- when deleting in-use categories, linked `Transaction` rows are reassigned in the same mutation flow to the user system `Uncategorized` category
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
- API: `/api/savings/plans` (POST), `/api/savings/plans/[id]` (PATCH), `/api/savings/auto-transfer` (GET/PUT), `/api/savings/auto-transfer/latest-run` (GET)
- Savings screen supports active-plan selection driven by `SavingsPlan.status` (only `active`/`cancelled`/`archive` are persisted) and `isPrimary`
- Savings primary goal block shows a derived progression state (`active`/`funded`/`completed`) computed client-side in `SavingsPageView.tsx` from contributions versus target; `funded`/`completed` are UI labels, not database states — see `docs/savings-plan-status-flow.md`
- Savings cancel control is intentionally available only for `active` and (derived) `funded` states
- Cancelling a savings plan writes a wallet-side `refund` transaction back to the default wallet and links it to the cancelled plan for auditability
- Cancelling or archiving the primary plan auto-reassigns `isPrimary` to another `active` plan in the same `PATCH /api/savings/plans/[id]` transaction (`src/app/api/savings/plans/[id]/route.ts`)
- Savings screen supports in-place "Add Contribution" dialog that writes income transactions linked by `Transaction.savingsPlanId`
- `ledger/reports` includes client-rendered monthly cashflow trend (income vs expense) and expense-vs-budget charting via Recharts, sourced from `src/lib/ledger.ts` (`getLedgerReportsData()`) — there is no dedicated `/api/reports` endpoint (see gaps below)

### Settings
- API: `/api/settings` (GET, PATCH)
- Feature module: `src/features/settings` — currency/language/theme preferences backed by `UserSettings`
- `useUserSetting` hook (`src/features/settings/hooks/useUserSetting.ts`) is the canonical read-side dependency for language/currency/theme, reused by dashboard, accounts, and other domains

### Onboarding
- Feature module: `src/features/onboarding` — `OnboardingTourProvider` (`@reactour/tour`) drives a guided tour keyed to `.tour-*` CSS classes on nav items and layout regions inside `src/components/layout/AppChrome.tsx`
- Tour progress/completion is persisted client-side via `localStorage`, no server-side state

### Shared UI Component Library
- `src/components/ui/*`: `Button`, `Avatar`, `Loading`, `Switch`, `Typography`, `Checkbox` (`input/checkbox`), `Text` (`input/text`)
- Styled with Tailwind CSS v4 plus a CSS custom-property design-token layer (referred to in code comments as the "Fiscal Atelier" design system); `class-variance-authority` is used for variant styling in `Button` and `Typography`, not yet applied consistently across all six components
- Previewed/documented via Storybook 10.3.6 (`npm run storybook`), config in `.storybook/`
- `src/components/layout/AppChrome.tsx` is the authenticated app shell (sidebar nav, header, main content) — it composes `Avatar` and `Button` from the library but the rest of its markup is raw Tailwind, not yet migrated to the token system

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

- no dedicated `/api/reports` endpoint — reports are computed via `src/lib/ledger.ts` (`getLedgerReportsData()`) and rendered client-side; this is the only remaining API gap from earlier drafts of this doc
- `src/components/ui/index.ts` re-exports `ButtonSize`/`ButtonVariant` types that do not exist on `Button.tsx` (only `ButtonProps` is exported) — do not rely on those named exports
- `src/features/ledger/components/LedgerEntryForm.tsx` is unused dead code, superseded by `NewEntryForm.tsx`/`EditTransactionForm.tsx`
- `AppChrome.tsx` has not yet adopted the `src/components/ui` design-token system for its own markup

Resolved (previously listed here, now implemented — kept for historical PR-review context):
- `/api/savings` CRUD (`/api/savings/plans`, `/api/savings/plans/[id]`)
- `/api/settings` (GET/PATCH)
- update/delete for accounts (`/api/accounts/[id]` PATCH/DELETE) and ledger transactions (`/api/ledger/[id]` PATCH/DELETE)

## Canonical Architecture Decision

Use `src/app/(dashboard)/app/*` as the canonical authenticated route tree.
