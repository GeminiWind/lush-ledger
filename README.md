# Lush Ledger (Personal Finance MVP)

Lush Ledger is a personal finance web app focused on day-to-day money tracking:
- account balances
- ledger transactions (with recurring support)
- monthly budgeting in Atelier
- reports and savings insights

This repository uses Next.js App Router, Prisma, SQLite, and cookie-based JWT sessions.

For month-end auto-transfer queue processing, BullMQ is backed by Redis.

## Current Product Status

The app is usable for core MVP flows, with a few API/CRUD surfaces still incomplete.

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

For current implementation details, see `docs/codebase-summary.md` and `docs/project-roadmap.md`.

## App Routes

Canonical authenticated routes are under `src/app/app/*`:
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

1) Install dependencies

```bash
npm install
```

2) Create env file

```bash
cp .env.example .env
```

3) Apply Prisma migrations

```bash
npx prisma migrate deploy
```

4) Start Redis for BullMQ

```bash
docker compose up -d redis
```

5) Run the app

```bash
npm run dev
```

6) Open `http://localhost:3000`

## Environment Variables

Required values (see `.env.example`):
- `DATABASE_URL` (default local SQLite: `file:./dev.db`)
- `JWT_SECRET` (set a strong random value outside local development)

BullMQ/Redis values:
- `REDIS_URL` (preferred, for example `redis://127.0.0.1:6379`)
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` (fallback when `REDIS_URL` is omitted)

## Development Commands

- `npm run dev` - generate Prisma client and start dev server
- `npm run lint` - run ESLint
- `npm run build` - generate Prisma client and build for production
- `npm run start` - start production server
- `npm run prisma:generate` - regenerate Prisma client

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
