# Smart Form (Personal Finance MVP)

Smart Form is a personal finance web app focused on practical day-to-day money tracking:
- account balances
- ledger transactions (with recurring support)
- monthly budgeting in Atelier
- report views and savings insights

This repository uses Next.js App Router, Prisma, SQLite, and cookie-based JWT sessions.

## Current Product Status

The app is usable for core MVP flows, but several APIs and CRUD surfaces are still incomplete.

Implemented APIs:
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/accounts`, `POST /api/accounts`
- `PATCH /api/accounts/[id]` (balance update only)
- `GET /api/categories`, `POST /api/categories`
- `GET /api/ledger`, `POST /api/ledger`
- `GET /api/atelier`
- `PATCH /api/atelier/cap`

Known API gaps:
- missing `/api/reports`
- missing `/api/savings` CRUD
- missing `/api/settings`
- missing update/delete for accounts, categories, and ledger transactions

See `docs/codebase-summary.md` and `docs/project-roadmap.md` for details.

## App Routes

Canonical authenticated surface is under `src/app/app/*`:
- `/app` (dashboard)
- `/app/ledger`
- `/app/ledger/new`
- `/app/ledger/reports`
- `/app/atelier`
- `/app/accounts`
- `/app/savings`

Auth routes:
- `/login`
- `/register`

Legacy route group note:
- There is a parallel `src/app/(app)/*` tree with overlapping pages and stale links.
- Treat `src/app/app/*` as source-of-truth for active product navigation.

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Prisma ORM
- SQLite (`DATABASE_URL`)
- JWT via `jose`, password hashing via `bcryptjs`
- Recharts for report/savings visualizations

## Quick Start

1) Install dependencies:

```bash
npm install
```

2) Create env file:

```bash
cp .env.example .env
```

3) Run the app:

```bash
npm run dev
```

4) Open:

`http://localhost:3000`

## Environment Variables

Required values (see `.env.example`):
- `DATABASE_URL` (default local SQLite: `file:./dev.db`)
- `JWT_SECRET` (set a strong random value outside local development)

## Documentation Map

- `docs/project-overview-pdr.md` - product scope, goals, and MVP boundaries
- `docs/codebase-summary.md` - route/API/data-model inventory and current gaps
- `docs/system-architecture.md` - runtime architecture and domain flows
- `docs/code-standards.md` - coding and API conventions for this repo
- `docs/project-roadmap.md` - phase-by-phase status and next milestones
- `docs/deployment-guide.md` - local/prod deployment guidance
- `docs/design-guidelines.md` - UX and UI consistency rules
- `docs/tech-stack.md` - quick stack snapshot
- `docs/plans/personal-finance-mvp/plan.md` - original phase plan

## Notes for Contributors

- Keep docs aligned with actual routes/endpoints before adding new features.
- Prefer extending canonical routes in `src/app/app/*` instead of legacy `src/app/(app)/*`.
- If you add an endpoint, update the API inventory docs in the same PR.
