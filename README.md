# Lush Ledger (Personal Finance MVP)

Lush Ledger is a personal finance web app focused on day-to-day money tracking:
- account balances
- ledger transactions (with recurring support)
- monthly budgeting in Atelier
- reports and savings insights

This repository uses Next.js App Router, Prisma, SQLite, and cookie-based JWT sessions.

For month-end auto-transfer queue processing, BullMQ is backed by Redis.

## Current Product Status

The app is usable for core MVP flows. The only remaining API gap is a dedicated `/api/reports` endpoint — report data is computed server-side (`src/lib/ledger.ts` `getLedgerReportsData()`) and rendered client-side on `/app/ledger/reports`.

Implemented APIs:
- `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/logout`
- `GET /api/accounts`, `POST /api/accounts`, `PATCH /api/accounts/[id]`, `DELETE /api/accounts/[id]`
- `GET /api/categories`, `POST /api/categories`, `PATCH /api/categories/[id]`, `DELETE /api/categories/[id]` (soft-delete)
- `GET /api/ledger`, `POST /api/ledger`, `PATCH /api/ledger/[id]`, `DELETE /api/ledger/[id]`, `GET /api/ledger/export` (CSV)
- `GET /api/atelier`, `PATCH /api/atelier/cap`
- `POST /api/savings/plans`, `PATCH /api/savings/plans/[id]`
- `GET /api/savings/auto-transfer`, `PUT /api/savings/auto-transfer`, `GET /api/savings/auto-transfer/latest-run`
- `GET /api/settings`, `PATCH /api/settings`

For current implementation details, see `docs/codebase-summary.md` and `docs/project-roadmap.md`.

## App Routes

Canonical authenticated routes are under `src/app/(dashboard)/app/*` (serving `/app/*` URLs):
- `/app` (dashboard)
- `/app/ledger`, `/app/ledger/new`, `/app/ledger/reports`
- `/app/atelier`
- `/app/accounts`
- `/app/savings`, `/app/savings/cancelled`, `/app/savings/cancelled/[id]`
- `/app/settings`

Auth routes:
- `/login`
- `/register`

Root:
- `/` redirects to `/app` if authenticated, otherwise to `/login`.

`src/app/(dashboard)/app/*` is the single authenticated route tree (no separate legacy route group). Auth is enforced by `src/middleware.ts` (edge-level session check, redirects unauthenticated requests); `getCurrentUser()` in `src/app/(dashboard)/app/layout.tsx` then fetches the authenticated user's DB record (no redirect logic of its own).

## Tech Stack

- Next.js 16.2.1 (App Router)
- React 19.2.4 + TypeScript
- Tailwind CSS v4 with a CSS custom-property design-token layer; shared component library in `src/components/ui/*` (previewed via Storybook 10.3.6, `npm run storybook`)
- TanStack Query for client-side data fetching/caching
- Prisma ORM, SQLite (`DATABASE_URL`)
- JWT via `jose`, password hashing via `bcryptjs`
- Recharts for report/savings visualizations
- Formik for forms
- react-i18next via a custom namespaced wrapper (`en-US`/`vi-VN` locales)
- node-cron + BullMQ/ioredis for the optional month-end savings auto-transfer background job (no-ops without Redis configured)

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

- `npm run dev` - generate Prisma client and start dev server (webpack, not Turbopack)
- `npm run lint` - run ESLint
- `npm run build` - generate Prisma client and build for production (webpack)
- `npm run start` - start production server
- `npm run prisma:generate` - regenerate Prisma client
- `npm run test` - run Vitest unit/integration tests
- `npm run test:e2e` - generate and run Playwright/Gherkin end-to-end tests (`.feature` files in `tests/e2e/features/`)
- `npm run storybook` - run Storybook dev server for `src/components/ui/*`

## Documentation Map

- `docs/project-overview-pdr.md` - product scope, goals, and MVP boundaries
- `docs/codebase-summary.md` - route/API/data-model inventory and current gaps
- `docs/system-architecture.md` - runtime architecture and domain flows
- `docs/code-standards.md` - coding and API conventions for this repo
- `docs/project-roadmap.md` - phase-by-phase status and next milestones
- `docs/deployment-guide.md` - local/prod deployment guidance
- `docs/design-guidelines.md` - UX and UI consistency rules, and the `src/components/ui` component library
- `docs/tech-stack.md` - quick stack snapshot
- `docs/savings-plan-status-flow.md` - savings plan lifecycle, persisted vs. derived states
- `docs/plans/personal-finance-mvp/plan.md` - original phase plan

## Notes for Contributors

- Keep docs aligned with actual routes/endpoints before adding new features.
- Extend canonical routes under `src/app/(dashboard)/app/*`; there is no legacy route group to avoid.
- If you add an endpoint, update the API inventory docs in the same PR.
