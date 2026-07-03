## Tech Stack

- App framework: Next.js 16.2.1 (App Router)
- Language: TypeScript
- UI: React 19.2.4
- Styling: Tailwind CSS v4 (`@tailwindcss/postcss`), CSS custom-property design tokens (see `docs/design-guidelines.md`)
- Component library: `src/components/ui/*` (Button, Avatar, Loading, Switch, Typography, Checkbox, Text), built with `class-variance-authority` where variants apply, previewed via Storybook 10.3.6 (`npm run storybook`)
- Client data fetching/caching: TanStack Query (`@tanstack/react-query`)
- Forms: Formik
- Charts: Recharts
- Database: SQLite
- ORM: Prisma
- Auth: JWT (custom, `jose` + `bcryptjs`), no third-party auth library
- i18n: react-i18next via a custom namespaced wrapper (`src/features/i18n`)
- Background jobs: node-cron (scheduler) + BullMQ/ioredis (queue) for month-end savings auto-transfer; both degrade to no-ops when Redis env vars are absent
- Testing: Vitest (unit/integration), Playwright (e2e)
- Deployment: TBD

## Notes

- SQLite is a strong fit for MVP and low-concurrency writes.
- If write contention grows, plan a migration path to Postgres.
- The BullMQ/Redis-backed auto-transfer queue is optional infrastructure: without `REDIS_URL`/`REDIS_HOST` configured, the queue and scheduler modules degrade to no-ops rather than erroring.
