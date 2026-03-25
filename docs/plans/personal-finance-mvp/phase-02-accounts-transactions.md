## Context links

- Plan: `docs/plans/personal-finance-mvp/plan.md`
- Tech stack: `docs/tech-stack.md`

## Overview

- Date: 2026-03-20
- Priority: high
- Status: completed (reviewed 2026-03-25)

## Key Insights

- Transactions are the core data; keep schema clean and indexed.
- Fast entry UX reduces user churn.

## Requirements

- Account CRUD (cash, checking, credit)
- Transaction CRUD with categories and notes
- List, filter, and search transactions
- Opening balances and account totals

## Architecture

- Prisma models for Account, Transaction, Category
- Server actions or API routes for CRUD
- UI with forms + tables

## Related code files

- `src/app/(app)/accounts/page.tsx`
- `src/app/(app)/transactions/page.tsx`
- `src/app/api/accounts/*`
- `src/app/api/transactions/*`
- `prisma/schema.prisma`

## Implementation Steps

1. Define Account and Transaction models
2. Build CRUD endpoints
3. Create list + entry forms
4. Add filters and search
5. Validate amounts and dates

## Todo list

- Schema updates and migrations
- Account list + create/edit
- Transaction list + create/edit
- Basic filters and search

## Success Criteria

- User can manage accounts
- User can add/edit/delete transactions
- Balances calculate correctly

## Review summary (2026-03-25)

- Completed: Account create/list APIs and user-scoped account reads (`/api/accounts`, `/api/accounts/[id]`)
- Completed: Account edit/delete flow is implemented in API and wallet UI (`PATCH`/`DELETE` + modal actions)
- Completed: Wallet balance recalculation flow based on opening balance + transaction movement
- Completed: Transaction create/list APIs with user scoping and server-side validation (`/api/ledger`)
- Completed: Transaction list page supports filter + search (query/type/account/category)
- Completed: New transaction form UX with recurring support and validation
- Completed: Transaction update/delete is implemented in API and UI (`PATCH`/`DELETE` on `/api/ledger/[id]`, edit page + delete dialog)
- Note: Implementation route naming is consolidated under `ledger` while this phase title remains "Accounts + Transactions"

## Recommendation

- Mark phase as `completed`; move any naming/route taxonomy cleanup to documentation debt.

## Risk Assessment

- Inaccurate balances if opening balance handling is unclear

## Security Considerations

- Ensure user scoping on all queries
- Validate all input server-side

## Next steps

- Implement budgeting features
