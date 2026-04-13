# Quickstart: Authentication Management

## Prerequisites

- Install dependencies: `npm install`
- Ensure required environment variables are set (including `JWT_SECRET`)
- Ensure database is initialized for local testing

## 1) Start application

- Run: `npm run dev`
- Open `/login` and `/register`

## 2) Validate login flow

- Use an existing user account
- Submit valid email/password and confirm redirect to `/app`
- Submit wrong password and confirm non-sensitive error response
- Submit empty fields and confirm field-level required messages

## 3) Validate registration flow

- Submit full name, unique email, secure password, and terms agreement
- Confirm success creates account and redirects to `/app`
- Submit duplicate email and confirm conflict message
- Submit weak password and confirm explicit composition-rule feedback

## 4) Validate redirect behavior

- While authenticated, open `/login` and `/register`
- Confirm automatic redirect to `/app`

## 5) Validate API contracts

- `POST /api/auth/login`
- `POST /api/auth/register`

Expected:
- Success returns `{ "ok": true }`
- Failures return structured error messages and correct statuses

## 6) Run quality gates

- Lint: `npm run lint`
- Build: `npm run build`
- Tests: `npm run test`

## 7) Documentation updates before merge

If behavior changes during implementation, update in the same change:

- `docs/codebase-summary.md`
- `docs/system-architecture.md`
- `docs/project-roadmap.md`

## 8) Traceability notes

- Phase 1 completed: design exports and integration test scaffolds are present.
- Phase 2 completed: shared auth validation, structured auth errors, and redirect coverage are implemented.
- Phase 4 completed: registration password policy, duplicate-email handling, and US2 test coverage are implemented.

## 9) Latest verification snapshot (2026-04-10)

- `npm run lint` -> pass (1 existing warning: `@next/next/no-img-element` in cancelled savings detail page)
- `npm run build` -> pass (existing warning: BullMQ dynamic dependency import)
- `npm run test` -> pass (`98 passed`, `3 todo`, `1 skipped`)
