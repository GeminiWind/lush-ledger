# Project Roadmap

Roadmap status is aligned with the current implementation review: phases 01-02 are `completed`, phases 03-05 remain `in_progress`.

Related plan source:
- `docs/plans/personal-finance-mvp/plan.md`

## Phase Status Matrix

| Phase | Name | Status | Why still in progress |
|---|---|---|---|
| 01 | Foundation + Auth | completed | settings API/page parity and auth rate limiting are implemented |
| 02 | Accounts + Transactions | completed | account + ledger CRUD (including update/delete) is implemented |
| 03 | Budgets | in_progress | category CRUD incomplete; warning flow is visual-only, not event-driven |
| 04 | Reports | in_progress | no `/api/reports`; missing full cashflow/category-by-month/account snapshot outputs |
| 05 | Savings Plans | in_progress | `SavingsPlan` model exists, but no dedicated savings CRUD API/UI flow |

## Current Milestones

1) Stabilize canonical route surface
- keep `src/app/app/*` as active surface
- mark/deprecate overlapping `src/app/(app)/*` paths

2) Complete API CRUD baseline
- categories: add update/delete
- add `/api/reports`
- add `/api/savings` CRUD

3) Close reporting and savings UX gaps
- explicit income-vs-expense time-series (implemented on `ledger/reports`)
- category-by-month report view
- account snapshot report block
- savings plan create/edit/delete workflows

## Exit Criteria to Move Phases to Done

- Phase 01 done: settings API/page parity and auth hardening baseline complete.
- Phase 02 done: account/ledger CRUD complete.
- Phase 03 done when category lifecycle is complete and budget warnings are consistent.
- Phase 04 done when reports are API-backed and requirement-complete.
- Phase 05 done when savings plan CRUD and editing UX are shipped.

## Documentation Maintenance Rule

When a roadmap gap is implemented, update both:
- `docs/codebase-summary.md`
- `docs/project-roadmap.md`
