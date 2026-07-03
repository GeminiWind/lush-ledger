# Codebase Summary

## Repository Shape

- Framework: Next.js App Router
- Main app code: `src/app`
- Feature modules: `src/features/*`
- Shared UI/layout: `src/components/*`
- API routes: `src/app/api/*`
- Domain/business utilities: `src/lib/*`
- Data schema: `prisma/schema.prisma`
- Client API state: TanStack Query provider at `src/app/QueryProvider.tsx`

## Route Structure

Canonical route tree (active):
- `src/app/(dashboard)/app/page.tsx` -> `/app`
- `src/app/(dashboard)/app/ledger/page.tsx` -> `/app/ledger`
- `src/app/(dashboard)/app/ledger/new/page.tsx` -> `/app/ledger/new`
- `src/app/(dashboard)/app/ledger/reports/page.tsx` -> `/app/ledger/reports`
- `src/app/(dashboard)/app/atelier/page.tsx` -> `/app/atelier`
- `src/app/(dashboard)/app/accounts/page.tsx` -> `/app/accounts`
- `src/app/(dashboard)/app/savings/page.tsx` -> `/app/savings`
- `src/app/(dashboard)/app/savings/cancelled/page.tsx` -> `/app/savings/cancelled`
- `src/app/(dashboard)/app/savings/cancelled/[id]/page.tsx` -> `/app/savings/cancelled/:id`
- `src/app/(dashboard)/app/settings/page.tsx` -> `/app/settings`

Auth routes:
- `src/app/(auth)/login/page.tsx` -> `/login`
- `src/app/(auth)/register/page.tsx` -> `/register`

Root:
- `src/app/(public)/page.tsx` -> `/` (redirect gate: session present -> `/app`, else -> `/login`)
- `src/app/(dashboard)/app/layout.tsx` is a server component that calls `getCurrentUser()` (fetches the authenticated user's DB record; `src/middleware.ts` already guarantees the session, this only redirects defensively if the DB user row is missing) and renders the shared `AppChrome` shell around every `/app/*` page
- root provider stack (`src/app/layout.tsx`): `QueryProvider` -> `I18nProvider` -> `AuthProvider` -> `ToasterProvider`

Auth flow notes:
- auth request/response validation helpers live in `src/features/auth/validation.ts`
- registration enforces password composition (uppercase, lowercase, number, special char) and keeps 8..72 character bounds
- auth client now parses structured error payloads (`error` + optional `errors`) via `src/features/auth/services/auth-client.ts`
- auth form validation coverage includes `tests/integration/auth-register-page.integration.test.tsx`

## API Inventory

Implemented:
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/accounts`
- `POST /api/accounts`
- `PATCH /api/accounts/[id]`
- `DELETE /api/accounts/[id]`
- `GET /api/categories`
- `POST /api/categories`
- `PATCH /api/categories/[id]`
- `DELETE /api/categories/[id]`
- `GET /api/ledger`
- `POST /api/ledger`
- `PATCH /api/ledger/[id]`
- `DELETE /api/ledger/[id]`
- `GET /api/ledger/export`
- `GET /api/atelier`
- `PATCH /api/atelier/cap`
- `POST /api/savings/plans`
- `PATCH /api/savings/plans/[id]` (also handles cancel/archive as status transitions, see below)
- `GET /api/savings/auto-transfer`
- `PUT /api/savings/auto-transfer`
- `GET /api/savings/auto-transfer/latest-run`
- `GET /api/settings`
- `PATCH /api/settings`

Missing or partial:
- missing dedicated `/api/reports` — reports data is computed server-side by `src/lib/ledger.ts` (`getLedgerReportsData()`) and rendered client-side on `/app/ledger/reports`; there is no standalone REST reports endpoint.
- there is no separate delete/archive endpoint for savings plans; archiving/cancelling a plan is done via `PATCH /api/savings/plans/[id]` with `status` in the request body (see `docs/savings-plan-status-flow.md`).

Note: accounts, categories, and ledger transactions all now have full update/delete coverage; this corrects earlier drafts of this doc that listed those as gaps.

Delete-category notes:
- `DELETE /api/categories/[id]` uses soft-delete semantics (`deletedAt`) rather than hard delete
- deleting a category with linked transactions reassigns those rows to the user-scoped system `Uncategorized` category
- deleting a missing or already soft-deleted category returns `404` with structured error payload
- deleting the system `Uncategorized` category is explicitly rejected

## Data Model Snapshot

Core models in `prisma/schema.prisma`:
- `User`
- `UserSettings` (`currency`, `language`, `timezone`, `theme`, `unallocatedBackup`)
- `Account`
- `Category` (`icon`, `isSystem`, `deletedAt` soft-delete)
- `Transaction` (`type` is a free-text string — `income | expense | transfer_to_saving_plan | refund` — not a Prisma enum; includes recurring fields and template metadata; self-references other transactions via `recurringTemplateId`, a plain string, not a foreign key)
- `SavingsPlan` (`icon`, `status`, `isPrimary`, `targetAmount`, `monthlyContribution`, `targetDate`) — `status` is a free-text string; only `active | cancelled | archive` are ever persisted (see `docs/savings-plan-status-flow.md`)
- `CategoryMonthlyLimit` (monthly category snapshot: `limit`, `warningEnabled`, `warnAt`)
- `AutoTransferRule` (single rule per user, `enabled`, allocation rows serialized as JSON text)
- `AutoTransferRun` (month-end remainder snapshot + per-plan result rows serialized as JSON text, unique per `userId + monthStart`)
- `UserMonthlyCap` (monthly cap snapshot)

Key relationships: `User` 1—1 `UserSettings`; `User` 1—N `{Account, Category, Transaction, SavingsPlan, AutoTransferRun, UserMonthlyCap, CategoryMonthlyLimit}`; `User` 1—1 `AutoTransferRule`; `Account` 1—N `Transaction`; `Category` 1—N `{Transaction (optional), CategoryMonthlyLimit}`; `SavingsPlan` 1—N `Transaction` (optional, via `savingsPlanId`).

## Key Runtime Modules

- Auth/session: `src/lib/auth.ts`, `src/middleware.ts`
- Monthly snapshot strategy: `src/lib/monthly-cap.ts`
- Recurring generation: `src/lib/recurring.ts`
- Savings auto-transfer processing: `src/lib/savings-auto-transfer.ts`, `src/lib/savings-auto-transfer-queue.ts`, `src/lib/savings-auto-transfer-scheduler.ts`
- Domain calculations: `src/lib/dashboard.ts`, `src/lib/ledger.ts`, `src/lib/atelier.ts`, `src/lib/wallet.ts`
- Client query/mutation cache: `src/app/QueryProvider.tsx` (`@tanstack/react-query`)

Client API handling convention:
- interactive client forms/dialogs use TanStack Query mutations (`useMutation`) for `/api/*` writes
- post-mutation flow uses query invalidation + `router.refresh()` for server-rendered data sync

## UI Domains

- Dashboard
- Ledger (+ New, + Reports)
- Atelier (budgets)
- Accounts
- Savings
- Settings (`/app/settings`, `src/features/settings`) — currency/language/theme preferences; `useUserSetting` hook (`src/features/settings/hooks/useUserSetting.ts`) is the canonical read-side dependency for those values app-wide
- Onboarding (`src/features/onboarding`) — `OnboardingTourProvider` built on `@reactour/tour`, a guided walkthrough keyed to `.tour-*` CSS classes placed throughout `AppChrome` (nav items, sidebar, "new entry" button, main content area), persisted via `localStorage`

Shared component library (`src/components/ui/*`, new): `Button`, `Avatar`, `Loading`, `Switch`, `Typography`, `Checkbox`, `Text`. See `docs/design-guidelines.md` for the token system and Storybook usage.

Dialog behavior baseline:
- all dialogs should close on backdrop (outside) click
- all dialogs should close on `Esc`

Savings UX notes:
- active plan can be selected on `/app/savings` via query (`?plan=<id>`) with `isPrimary` fallback
- primary plan surfaces a derived state badge computed client-side in `SavingsPageView.tsx`: `active` -> `funded` after first contribution -> `completed` at target. Only `active`/`cancelled`/`archive` are persisted in the database — `funded` and `completed` are UI-only labels layered on top of `status === "active"` (see `docs/savings-plan-status-flow.md`)
- cancel action is only available while a plan is `active` or (derived) `funded`
- completed plans are non-cancellable and should transition to `archive`
- `isPrimary` is independent of `status`: cancelling or archiving the primary plan auto-reassigns `isPrimary` to another `active` plan (ordered by `isPrimary desc, targetDate asc, createdAt asc`) inside the `PATCH /api/savings/plans/[id]` transaction
- add-contribution dialog posts to `POST /api/ledger` with `savingsPlanId` linkage
- contribution entries use transaction type `transfer_to_saving_plan` and appear in ledger activity
- cancelling a savings plan creates a `refund` transaction into the default wallet with a cancellation note
- archived list cards now deep-link cancelled plans to a dedicated detail view (`/app/savings/cancelled/:id`)
- API now rejects contribution writes if `savingsPlanId` is provided with any type other than `transfer_to_saving_plan`
- `PATCH /api/savings/plans/[id]` supports partial updates including state-only transitions
- Atelier includes month-end auto-transfer configuration with required `(*)` field markers and latest-run status
- Atelier list supports month-scoped read-only rows via `month=YYYY-MM` query context with per-category `warningEnabled` and `warnAt` threshold fields
- Atelier row risk states are normalized as `healthy | warning | overspent | pending` and include explicit non-color status text
- Atelier category edit flow is wired from list row action to modal update submit with prefilled values and query-refresh success path
- `PATCH /api/categories/[id]` enforces case-insensitive per-user name uniqueness, stale-edit conflict protection (`409`), and structured field errors (`error` + `errors`)
- `DELETE /api/categories/[id]` enforces auth + ownership, blocks system-category deletion, and returns reassignment metadata for continuity-aware UX
- Warning-threshold behavior preserves persisted `warnAt` when warnings are disabled while treating threshold input as inactive validation
- Ledger marks system-generated month-end transfers with explicit auto-transfer labels
- Savings highlights progress impact from auto-transfer entries
- full lifecycle reference: `docs/savings-plan-status-flow.md`

Ledger CSV export notes:
- `/api/ledger/export` returns `text/csv` download scoped to the authenticated user
- export supports `query`, `type`, `accountId`, `categoryId`, `startDate`, `endDate`
- export is designed to mirror the active filter state from `/app/ledger`

Ledger display notes:
- `/app/ledger` transaction headers are grouped as a flat list by day: `Today`, `Yesterday`, then older locale-formatted dates
- groups must remain non-nested and hide empty day sections after filter/search updates

Charts:
- Recharts used in reports/savings/top-categories style visualizations
- `ledger/reports` includes dedicated monthly cashflow trend (income vs expense) and monthly expense vs budget chart

## Active Tech Debt

- roadmap references and implementation naming differ in a few areas (`reports` vs `ledger/reports`)
- login page integration tests are still scaffolded as TODOs in `tests/integration/auth-login-page.integration.test.tsx`
- `src/components/ui/index.ts` re-exports `ButtonSize`/`ButtonVariant` types from `./Button`, but `Button.tsx` only exports `ButtonProps` (variant/size come from `VariantProps<typeof buttonVariants>`) — that named export does not exist and importing it will fail to compile
- `src/features/ledger/components/LedgerEntryForm.tsx` is unused dead code, superseded by `src/features/ledger/components/new/NewEntryForm.tsx` and `src/features/ledger/components/edit/EditTransactionForm.tsx`
- `src/components/layout/AppChrome.tsx` composes `Avatar`/`Button` from `src/components/ui` but the rest of its markup is raw Tailwind, not yet using the CSS custom-property token system — an inconsistency to resolve as the component library matures
- `class-variance-authority` (cva) is only used in `Button` and `Typography` so far, not consistently applied across all six `src/components/ui` components
- `AppLanguage` (`src/features/i18n/language.ts`) declares `fr-FR` and `ja-JP` in addition to `en-US`/`vi-VN`, but only `en.json`/`vi.json` locale files exist under `src/features/i18n/locales` — French/Japanese are not actually translated yet
