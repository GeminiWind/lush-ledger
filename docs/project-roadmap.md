# Project Roadmap

Roadmap status is aligned with the current implementation review: phases 01-03 are `completed`, phases 04-05 remain `in_progress` and are near completion.

Related plan source:
- `docs/plans/personal-finance-mvp/plan.md`

## Phase Status Matrix

| Phase | Name | Status | Why still in progress |
|---|---|---|---|
| 01 | Foundation + Auth | completed | settings API/page parity and auth rate limiting are implemented |
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

3) Close reporting and savings UX gaps
- explicit income-vs-expense time-series (implemented on `ledger/reports`)
- category-by-month report view
- account snapshot report block
- transaction CSV export from ledger filters (implemented via `/api/ledger/export`)
- savings plan create/edit/cancel-refund workflows
- active/archived plan lifecycle management and primary-plan switching UX

4) Harden month-end savings automation (queue rollout)
- cron -> producer -> per-user worker flow is implemented with BullMQ
- per-user replay endpoint is implemented for failed month/user jobs
- remaining work: production worker deployment/monitoring and operational dashboards

## Exit Criteria to Move Phases to Done

- Phase 01 done: settings API/page parity and auth hardening baseline complete.
- Phase 02 done: account/ledger CRUD complete.
- Phase 03 done: category lifecycle is complete and budget warnings are consistent.
- Phase 04 done when reports are API-backed and requirement-complete.
- Phase 05 done when savings plan CRUD, archive lifecycle, and primary-plan management UX are shipped.

## Documentation Maintenance Rule

When a roadmap gap is implemented, update both:
- `docs/codebase-summary.md`
- `docs/project-roadmap.md`
