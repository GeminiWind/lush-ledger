# Project Roadmap

Roadmap status is aligned with the current implementation review: phases 1-5 remain `in_progress`.

Related plan source:
- `docs/plans/personal-finance-mvp/plan.md`

## Phase Status Matrix

| Phase | Name | Status | Why still in progress |
|---|---|---|---|
| 01 | Foundation + Auth | in_progress | missing `/api/settings`, missing settings page parity, missing auth rate limiting |
| 02 | Accounts + Transactions | in_progress | missing full update/delete for accounts and ledger transactions |
| 03 | Budgets | in_progress | category CRUD incomplete; warning flow is visual-only, not event-driven |
| 04 | Reports | in_progress | no `/api/reports`; missing full cashflow/category-by-month/account snapshot outputs |
| 05 | Savings Plans | in_progress | `SavingsPlan` model exists, but no dedicated savings CRUD API/UI flow |

## Current Milestones

1) Stabilize canonical route surface
- keep `src/app/app/*` as active surface
- mark/deprecate overlapping `src/app/(app)/*` paths

2) Complete API CRUD baseline
- accounts: add update/delete
- categories: add update/delete
- ledger: add update/delete
- add `/api/settings`
- add `/api/reports`
- add `/api/savings` CRUD

3) Close reporting and savings UX gaps
- explicit income-vs-expense time-series
- category-by-month report view
- account snapshot report block
- savings plan create/edit/delete workflows

## Exit Criteria to Move Phases to Done

- Phase 01 done when settings API/page parity and auth hardening baseline are complete.
- Phase 02 done when account/ledger CRUD is complete and tested.
- Phase 03 done when category lifecycle is complete and budget warnings are consistent.
- Phase 04 done when reports are API-backed and requirement-complete.
- Phase 05 done when savings plan CRUD and editing UX are shipped.

## Documentation Maintenance Rule

When a roadmap gap is implemented, update both:
- `docs/codebase-summary.md`
- `docs/project-roadmap.md`
