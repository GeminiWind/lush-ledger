# Project Roadmap

Roadmap status is aligned with the current implementation review: phases 01-03 and 05 are `completed`, phase 04 remains `in_progress` pending a dedicated `/api/reports` contract.

Feature delivery update:
- `009-group-transactions-date` is implemented for ledger activity date-group presentation with flat sections (`Today`, `Yesterday`, then locale-formatted older dates) while preserving existing filter/search/export/edit/delete flows.
- `005-atelier-list` is implemented for month-scoped read-only category listing, per-category warning-threshold context, and risk-state signaling (`healthy | warning | overspent | pending`).
- `007-update-category-dialog` is implemented for edit-from-list flow with prefilled values, structured validation responses, stale-edit conflict handling (`409`), and warning-threshold preservation when warnings are disabled.
- `008-delete-category` is implemented for guarded category deletion with confirmation UX, soft-delete semantics, system `Uncategorized` protection, and transaction reassignment continuity.
- Core component library (commits `a426f5c`, `1aa9622`) added `src/components/ui/*` (Button, Avatar, Loading, Switch, Typography, Checkbox, Text) with Storybook previews and a CSS custom-property design-token layer, and integrated it into the auth and settings views.

Note: there is no `specs/002-*` directory in the spec history — spec numbering has a gap/renumbering between early phases and `005-*` onward; treat spec numbers as identifiers, not a dense sequence.

Related plan source:
- `docs/plans/personal-finance-mvp/plan.md`

## Phase Status Matrix

| Phase | Name | Status | Why still in progress |
|---|---|---|---|
| 01 | Foundation + Auth | completed | settings API/page parity, auth rate limiting, password policy enforcement, and structured auth error responses are implemented |
| 02 | Accounts + Transactions | completed | account + ledger CRUD (including update/delete) is implemented |
| 03 | Budgets | completed | category create/update/delete lifecycle + monthly cap snapshot workflow are implemented; warnings are consistent in current MVP flow |
| 04 | Reports | in_progress | report UI is mature (`/app/ledger/reports`) and CSV export from ledger is now implemented; remaining gap is a dedicated `/api/reports` contract |
| 05 | Savings Plans | completed | create/edit/contribution/cancel/refund/archive flow is implemented via `POST /api/savings/plans` and `PATCH /api/savings/plans/[id]` (status transitions), with cancelled list+detail pages, `isPrimary` auto-reassignment, and auto-transfer eligibility |

## Current Milestones

Overall completion estimate: **96%**.

1) Stabilize canonical route surface
- keep `src/app/(dashboard)/app/*` as active surface
- keep `/app/*` URL surface stable while route groups evolve internally

2) Complete API CRUD baseline
- reports: add `/api/reports` (still the only open item — accounts/categories/ledger update+delete, savings CRUD, and `/api/settings` are all implemented)

3) Close reporting and savings UX gaps
- explicit income-vs-expense time-series (implemented on `ledger/reports`)
- category-by-month report view
- account snapshot report block
- transaction CSV export from ledger filters (implemented via `/api/ledger/export`)
- savings plan create/edit/cancel/archive workflows (implemented via `POST /api/savings/plans` and `PATCH /api/savings/plans/[id]`)
- active/archived plan lifecycle management and primary-plan switching UX (implemented, including auto-reassignment of `isPrimary` on cancel/archive)
- month-end remainder auto-transfer configuration + execution (implemented: Atelier settings, ledger visibility, savings impact, auto-transfer APIs)

## Exit Criteria to Move Phases to Done

- Phase 01 done: settings API/page parity and auth hardening baseline complete.
- Phase 02 done: account/ledger CRUD complete.
- Phase 03 done: category lifecycle is complete and budget warnings are consistent.
- Phase 04 done when reports are API-backed and requirement-complete.
- Phase 05 done: savings plan CRUD, archive lifecycle, and primary-plan management UX are shipped (status-transition endpoint rather than a dedicated delete/archive route).

## Auth Follow-up Notes

- Login and registration contract coverage is in place.
- Login page integration scenarios remain in scaffold state and should be completed to remove auth TODO tests.

## Documentation Maintenance Rule

When a roadmap gap is implemented, update both:
- `docs/codebase-summary.md`
- `docs/project-roadmap.md`
