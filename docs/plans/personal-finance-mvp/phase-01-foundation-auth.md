## Context links

- Plan: `docs/plans/personal-finance-mvp/plan.md`
- Tech stack: `docs/tech-stack.md`

## Overview

- Date: 2026-03-20
- Priority: high
- Status: completed (reviewed 2026-03-24)

## Key Insights

- Keep MVP scope tight: manual entry, budgets, core reports.
- SQLite is ideal for low-concurrency MVPs.
- Simple JWT auth reduces initial complexity but needs security guardrails.

## Requirements

- Next.js App Router project scaffold
- Prisma + SQLite setup with migrations
- JWT auth: register, login, logout, session handling
- System currency setting
- Basic layout + navigation shell
- Environment config for secrets

## Architecture

- App Router with route groups for auth and app
- API routes for auth and data access
- Prisma client shared via server utilities
- JWT stored in httpOnly cookies
- System settings table for currency

## Related code files

- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/register/page.tsx`
- `src/app/(app)/layout.tsx`
- `src/app/(app)/settings/page.tsx`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/api/settings/route.ts`
- `src/lib/auth/*`
- `prisma/schema.prisma`

## Implementation Steps

1. Initialize Next.js + TS project and base folders
2. Configure Prisma + SQLite and create initial schema
3. Implement user model and JWT auth routes
4. Add system settings model with currency
5. Add session helpers and middleware guards
6. Build minimal auth UI pages and settings page

## Todo list

- Scaffold app and config
- Define User model and migrations
- JWT signing/verification utilities
- Auth API routes and cookie handling
- Login/register UI
- Currency setting UI + API

## Success Criteria

- User can register and login
- Authenticated routes are protected
- Prisma migrations run cleanly
- Currency setting persists and applies to UI

## Review summary (2026-03-24)

- Completed: Next.js App Router scaffold with auth/app route groups
- Completed: Prisma + SQLite configured and migrations run successfully
- Completed: JWT auth flow (register/login/logout/session cookie) in API and middleware
- Completed: Protected routes via middleware and request session checks
- Completed: Currency persisted in `UserSettings` and consumed across UI formatting
- Completed: settings API and page are present (`/api/settings`, `/app/settings`)
- Completed: auth endpoint rate limiting added with exponential backoff for login/register attempts
- Note: phase-1 limiter is in-memory (instance-local); distributed persistence can be added in a hardening phase

## Recommendation

- Mark phase as `completed` and move next security hardening items to backlog.

## Risk Assessment

- JWT misuse can lead to insecure sessions
- Password storage must be hashed and salted

## Security Considerations

- Use bcrypt or argon2 for password hashing
- Store JWT in httpOnly cookies
- Enforce secure cookie flags in prod
- Rate limit auth endpoints

## Next steps

- Proceed to accounts and transactions modeling
