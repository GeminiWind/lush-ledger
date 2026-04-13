# Implementation Plan: Authentication Management

## Metadata

- **Name**: Authentication Management
- **Last Updated**: 2026-04-10
- **Updated By**: OpenCode Agent
- **Version**: v1.0.0

**Branch**: `004-auth-management-spec`  
**Date**: 2026-04-10  
**Spec**: `specs/004-auth-management-spec/spec.md`

---

## Summary

Align login and registration behavior with the approved Stitch screens and specification rules, with emphasis on secure password validation, unique-email enforcement, and predictable auth redirects. The implementation uses existing auth/session infrastructure and extends validation, UI feedback, and API contracts so users can complete sign-in/sign-up confidently with clear error recovery.

---

## Technical Context

**Frontend**: Next.js App Router + React + TypeScript + Tailwind + Formik + TanStack Query  
**Backend**: Next.js Route Handlers under `src/app/api/*` with domain helpers in `src/lib/*`  
**Database**: Prisma ORM on the current project database (SQLite in local development)  
**Auth**: Existing JWT session token in httpOnly `pf_session` cookie  

**Testing**:
- FE: Vitest for form validation and state behavior
- BE: Vitest API contract/integration tests for auth handlers
- E2E: Not required for this increment; covered via UI+API integration tests

**Target Platform**: Web (public auth routes and protected `/app/*` routes)  
**Performance Goals**:
- Login and registration submissions complete in <= 200ms p95 on local reference data
- Validation feedback appears immediately after submit failure (single interaction cycle)
**Constraints**:
- Preserve existing session cookie semantics and middleware protections
- Enforce unique email and secure password composition without exposing sensitive details
- Keep route ownership and UX patterns aligned with canonical auth pages

---

## Architecture Overview

- Auth pages (`/login`, `/register`) remain the public entry points and follow Stitch-aligned layouts.
- Client form submission uses existing auth client/context pathways and structured API error parsing.
- API handlers enforce validation, uniqueness, and non-sensitive auth failure behavior.
- Session creation remains centralized through existing auth helpers (`signToken`, `setSessionCookie`).
- Middleware and auth context continue to redirect authenticated users away from auth pages and protect private routes.

---

## Architecture Flow (Frontend <-> Backend)

- User opens `/login` or `/register`
- Frontend renders required fields and submit actions
- Frontend submits JSON payload to auth route
- Backend normalizes inputs and validates required/security rules
- Backend enforces business rules (unique email, credential validity)
- Backend returns either:
  - success response that establishes session, or
  - structured validation/business/system error
- Frontend updates UI state (loading/error/success) and navigates to dashboard on success

---

## Project Structure

### Documentation (this feature)

```text
specs/004-auth-management-spec/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- post-auth-login.md
|   `-- post-auth-register.md
`-- tasks.md
```

### Source Code (repository root)

```text
src/
  app/
    (auth)/
      login/page.tsx
      register/page.tsx
    api/
      auth/
        login/route.ts
        register/route.ts
  features/
    auth/
      context/AuthContext.tsx
      services/auth-client.ts
      types.ts
  lib/
    auth.ts
    rate-limit.ts
  middleware.ts

tests/
  contract/
    api-auth.contract.test.ts
  integration/
    auth-login-register.integration.test.ts
```

**Structure Decision**: Reuse current Next.js route handler + feature-module layout with no new top-level modules; keep auth behavior consolidated in existing auth pages, auth service/context, route handlers, and shared auth utilities.

---

## Phase 0: Research Output

Research is documented in `specs/004-auth-management-spec/research.md`.

Resolved topics:
- Password policy baseline (character classes plus explicit 8 to 72 character length bounds)
- Email normalization and uniqueness behavior
- Error response shape for field-level and form-level feedback
- Redirect behavior for authenticated users on public auth routes

No unresolved `NEEDS CLARIFICATION` items remain.

---

## Data Model

Detailed data definitions live in `specs/004-auth-management-spec/data-model.md`.

Primary entities:
- User
- AuthSession
- AuthAttempt

## Contracts

Detailed API contracts live in `specs/004-auth-management-spec/contracts/`.

Primary contracts:
- `POST /api/auth/login`
- `POST /api/auth/register`

---

## UI Implementation Plan

### Pages

- `/login`: enforce required email/password, loading state, and non-sensitive error feedback
- `/register`: enforce full-name + email + secure password rules and duplicate-email guidance

### Components

- Existing form fields and password visibility controls on both auth pages
- Inline field error messages and form-level status banners
- Navigation links between login and registration

### State Management

- Continue using `AuthContext` + TanStack Query mutations for login/register
- Preserve current redirect flow via route resolver helpers after successful auth

### User Interaction Flow

- Enter values -> submit -> API call -> response-driven UI state
- Invalid input keeps user on same page with explicit error messages
- Success path redirects user to `/app`

### UI States

- loading: submit button disabled, progress text shown
- error: field-level and top-level messages displayed
- success: redirect transition to authenticated dashboard

### Data Fetching

- After successful login/register, re-fetch authenticated user profile through existing auth context flow

---

## Backend Implementation Plan

- Update `POST /api/auth/register` validation to enforce secure password composition rules from spec
- Keep email normalization (`trim + lowercase`) and uniqueness checks for register flow
- Keep login credential verification and generic invalid-credential responses
- Return consistent structured errors for validation, duplicate email, and throttling/system failures
- Preserve session token creation and cookie issuance behavior on successful auth

---

## UI <-> API Mapping

### Login Flow

- Submit login form  
  -> `POST /api/auth/login` with `{ email, password, remember }`  
  -> Success: authenticated session + redirect to `/app`  
  -> Error: message shown in login form

### Register Flow

- Submit register form  
  -> `POST /api/auth/register` with `{ fullName, email, password, acceptedTerms }` where password must satisfy composition rules and be 8 to 72 characters  
  -> Success: account created + authenticated session + redirect to `/app`  
  -> Error: field/form errors shown in registration form

### Redirect Guard Mapping

- Authenticated user visiting `/login` or `/register`  
  -> no mutation call  
  -> client/middleware redirect to `/app`

---

## Testing Strategy

### Frontend

- Validate required-field behavior and error rendering on both auth forms
- Validate secure password rule messaging on registration
- Validate submit loading/disabled behavior and success navigation trigger

### Backend

- Contract tests for login/register status and response body shape
- Integration tests for duplicate email, invalid credentials, and secure password rule failures
- Regression tests for successful login/register session establishment

### End-to-End Validation

- Manual smoke flow: register new account -> redirected -> logout -> login same account

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Code quality gate defined (lint/build/type safety and reuse strategy)
- [x] Testing strategy defined (automated coverage for changed behavior)
- [x] UX consistency gate defined (design-guidelines and canonical route alignment)
- [x] Performance budget defined (p95 target and validation method)
- [x] Documentation impact captured (`docs/codebase-summary.md`, `docs/system-architecture.md`, `docs/project-roadmap.md`)

Post-design re-check status: **PASS** (no constitution violations introduced by Phase 0 and Phase 1 artifacts).

---

## Risks / Trade-offs

- Existing registration currently includes terms acceptance; this remains in payload to avoid unintended behavioral regression while password policy is tightened.
- Stronger password validation may increase initial form friction but improves account security posture.
- Generic login error messages improve security but provide less explicit guidance than field-specific credential messages.

## Implementation Traceability Notes

- Shared validation foundation is implemented in `src/features/auth/validation.ts` and consumed by auth route handlers and form validation.
- Structured auth error transport is implemented across `src/features/auth/types.ts`, `src/features/auth/services/auth-client.ts`, and auth pages/contexts.
- Registration story behavior from Phase 4 is implemented in `src/app/api/auth/register/route.ts`, `src/app/(auth)/register/page.tsx`, and `src/features/auth/context/AuthContext.tsx`.
- Verification coverage is captured by `tests/contract/api-auth.contract.test.ts`, `tests/integration/auth-register-page.integration.test.tsx`, and `tests/integration/auth-login-register.integration.test.ts`.

## Changelog

| Version | Date | Updated By | Change Summary |
|---------|------|------------|----------------|
| v1.0.0 | 2026-04-10 | OpenCode Agent | Initial implementation plan completed through Phase 1 design artifacts. |
| v1.0.1 | 2026-04-10 | OpenCode Agent | Added implementation traceability notes for completed auth phases and test coverage alignment. |
| v1.0.2 | 2026-04-13 | OpenCode Agent | Clarified password policy baseline and register flow mapping with explicit 8 to 72 character length bounds. |
