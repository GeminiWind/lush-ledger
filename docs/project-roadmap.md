# Project Roadmap

Roadmap status is aligned with the current implementation review: phases 01-03 are `completed`, phases 04-05 remain `in_progress` and are near completion.

Feature delivery update:
- `005-atelier-list` is implemented for month-scoped read-only category listing, per-category warning-threshold context, and risk-state signaling (`healthy | warning | overspent | pending`).
- `007-update-category-dialog` is implemented for edit-from-list flow with prefilled values, structured validation responses, stale-edit conflict handling (`409`), and warning-threshold preservation when warnings are disabled.

Related plan source:
- `docs/plans/personal-finance-mvp/plan.md`

## Phase Status Matrix

| Phase | Name | Status | Why still in progress |
|---|---|---|---|
| 01 | Foundation + Auth | completed | settings API/page parity, auth rate limiting, password policy enforcement, and structured auth error responses are implemented |
| 02 | Accounts + Transactions | completed | account + ledger CRUD (including update/delete) is implemented |
| 03 | Budgets | completed | category lifecycle + monthly cap snapshot workflow are implemented; warnings are consistent in current MVP flow |
| 04 | Reports | in_progress | report UI is mature (`/app/ledger/reports`) and CSV export from ledger is now implemented; remaining gap is a dedicated `/api/reports` contract |
| 05 | Savings Plans | in_progress | create/edit/contribution/cancel/refund flow is implemented with cancelled list+detail pages; remaining work is full lifecycle API hardening (delete/archive endpoint strategy) |

## Current Milestones

Overall completion estimate: **94%**.

1) Stabilize canonical route surface
- keep `src/app/(dashboard)/app/*` as active surface
- keep `/app/*` URL surface stable while route groups evolve internally

2) Complete API CRUD baseline
- reports: add `/api/reports`
- savings: add `/api/savings` CRUD
- ledger: add transaction update/delete endpoints

3) Close reporting and savings UX gaps
- explicit income-vs-expense time-series (implemented on `ledger/reports`)
- category-by-month report view
- account snapshot report block
- transaction CSV export from ledger filters (implemented via `/api/ledger/export`)
- savings plan create/edit/delete workflows
- active/archived plan lifecycle management and primary-plan switching UX
- month-end remainder auto-transfer configuration + execution (implemented: Atelier settings, ledger visibility, savings impact, auto-transfer APIs)

## Exit Criteria to Move Phases to Done

- Phase 01 done: settings API/page parity and auth hardening baseline complete.
- Phase 02 done: account/ledger CRUD complete.
- Phase 03 done: category lifecycle is complete and budget warnings are consistent.
- Phase 04 done when reports are API-backed and requirement-complete.
- Phase 05 done when savings plan CRUD, archive lifecycle, and primary-plan management UX are shipped.

## Auth Follow-up Notes

- Login and registration contract coverage is in place.
- Login page integration scenarios remain in scaffold state and should be completed to remove auth TODO tests.

## Documentation Maintenance Rule

When a roadmap gap is implemented, update both:
- `docs/codebase-summary.md`
- `docs/project-roadmap.md`
