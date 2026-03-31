# Design Guidelines

These guidelines keep the finance experience consistent while the product is still completing MVP scope.

## Product UI Principles

- optimize for fast, low-friction daily entry
- keep financial summaries readable before visually rich
- show user currency consistently in all money outputs
- make budget risk and overspend states obvious

## Navigation and IA

Canonical authenticated navigation should map to:
- `/app`
- `/app/ledger`
- `/app/ledger/new`
- `/app/ledger/reports`
- `/app/atelier`
- `/app/accounts`
- `/app/savings`

Avoid introducing new user-facing flows in legacy `src/app/(app)/*`.

## Domain UX Expectations

Dashboard:
- surface total balance, spending pace, and budget status first

Ledger:
- prioritize quick add/edit patterns and clear transaction type labels
- keep filters lightweight (account/category/type/month)

Atelier (Budgets):
- show planned limit vs actual spend with overspent emphasis
- preserve monthly context when showing cap and category limits

Accounts:
- display opening balance and current computed balance clearly

Savings:
- emphasize target, saved amount, remaining amount, and due date

## Chart Usage

- Recharts is the charting library in current implementation.
- Use charts to support decisions, not decoration.
- Always pair charts with a numeric summary for accessibility and clarity.

Recommended chart intents:
- trend over time (line/area)
- category share comparison (bar)
- progress to target (stacked/progress bar)

## Content and Microcopy

- use plain finance language: income, expense, limit, remaining, overspent
- avoid ambiguous verbs for money movement
- error text should tell users how to recover (for example, missing required fields)

Form labeling convention:
- required field labels must show a red `(*)` marker for quick visual recognition

## States and Feedback

- loading: preserve layout skeleton to reduce jump
- empty: explain what to create next
- error: show actionable message and retry path
- success: give concise confirmation and return user to workflow

## Accessibility Baseline

- maintain sufficient color contrast for all key financial statuses
- do not rely on color alone for overspent/at-risk states
- ensure keyboard access for forms and interactive controls

## Documentation Coupling

When introducing or changing a major UI flow, update:
- `docs/codebase-summary.md`
- `docs/system-architecture.md`
- `docs/project-roadmap.md`
