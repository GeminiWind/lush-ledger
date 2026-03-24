## Tech Stack

- App framework: Next.js (App Router)
- Language: TypeScript
- UI: React 18
- Database: SQLite
- ORM: Prisma
- Auth: JWT (custom, simple)
- Deployment: TBD

## Notes

- SQLite is a strong fit for MVP and low-concurrency writes.
- If write contention grows, plan a migration path to Postgres.
