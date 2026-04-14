# Tasks: Authentication Management

## Metadata

- **Name**: Authentication Management
- **Last Updated**: 2026-04-10
- **Updated By**: OpenCode Agent
- **Version**: v1.0.0

**Input**: Design documents from `/specs/004-auth-management-spec/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Test tasks are included for each user story and shared behavior updates.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align scaffolding, test targets, and design references before feature changes.

- [x] T001 Create feature task artifact index in `specs/004-auth-management-spec/tasks.md` and confirm referenced docs exist in `specs/004-auth-management-spec/`
- [x] T002 Capture Stitch login/register design exports to `docs/stitch/auth/login.html` and `docs/stitch/auth/register.html`
- [x] T003 [P] Create frontend auth form test files `tests/integration/auth-login-page.integration.test.tsx` and `tests/integration/auth-register-page.integration.test.tsx`
- [x] T004 [P] Create backend auth integration test file `tests/integration/auth-login-register.integration.test.ts`

**Checkpoint**: Setup complete; implementation can start on shared foundations.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared auth validation and response contracts required by all user stories.

**CRITICAL**: Complete this phase before user story phases.

- [x] T005 Add shared auth validation helpers for email/password policy in `src/features/auth/validation.ts` (FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-022)
- [x] T006 [P] Add shared auth error payload types in `src/features/auth/types.ts` for field and form errors (FR-017, FR-020)
- [x] T007 [P] Update auth client error parsing in `src/features/auth/services/auth-client.ts` to consume structured `error` and `errors` payloads (FR-017, FR-020, FR-021)
- [x] T008 [P] Update auth API contract tests in `tests/contract/api-auth.contract.test.ts` for password policy and structured error response assertions (`specs/004-auth-management-spec/contracts/post-auth-login.md`, `specs/004-auth-management-spec/contracts/post-auth-register.md`)
- [x] T009 Ensure authenticated-user redirect coverage for auth pages in `tests/integration/auth-login-register.integration.test.ts` (FR-014)

**Checkpoint**: Shared validation and response contracts are stable.

---

## Phase 3: User Story 1 - Returning User Login (Priority: P1) 🎯 MVP

**Goal**: Returning users can log in with email/password and reach `/app` with clear, non-sensitive failure handling.

**Independent Test**: Use an existing account, verify successful login redirect, invalid credential rejection, and required-field validation on `/login`.

### Tests for User Story 1

- [x] T010 [P] [US1] Add login form interaction test cases in `tests/integration/auth-login-page.integration.test.tsx` for required fields and submit states (FR-001, FR-020)
- [x] T011 [P] [US1] Extend login API contract cases in `tests/contract/api-auth.contract.test.ts` for 400/401/429 and `{ ok: true }` responses (`specs/004-auth-management-spec/contracts/post-auth-login.md`)
- [ ] T012 [P] [US1] Add login success/failure integration flow test in `tests/integration/auth-login-register.integration.test.ts` (FR-011, FR-015, FR-018)

### Implementation for User Story 1

- [x] T013 [US1] Update login API validation and normalized input handling in `src/app/api/auth/login/route.ts` (FR-001, FR-003, FR-011)
- [x] T014 [US1] Update login form validation and error rendering in `src/app/(auth)/login/page.tsx` (FR-001, FR-020)
- [x] T015 [US1] Update login mutation error mapping in `src/features/auth/context/AuthContext.tsx` to keep user on form with actionable feedback (FR-017, FR-018)
- [x] T016 [US1] Verify login request payload contract alignment in `src/features/auth/services/auth-client.ts` (`specs/004-auth-management-spec/contracts/post-auth-login.md`)
- [x] T017 [US1] Validate auth-route redirect behavior for signed-in users in `src/features/auth/routes.ts` and `src/features/auth/context/AuthContext.tsx` (FR-014)

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - New User Registration (Priority: P1)

**Goal**: New users can register with full name, unique email, and secure password, then enter `/app` as authenticated users.

**Independent Test**: Submit registration with valid values, duplicate email, and weak passwords; verify session creation on success and clear errors on failure.

### Tests for User Story 2

- [x] T018 [P] [US2] Add registration form validation test cases in `tests/integration/auth-register-page.integration.test.tsx` for full name/email/password policy/terms (FR-002, FR-004, FR-005, FR-006, FR-007, FR-008, FR-022)
- [x] T019 [P] [US2] Extend register API contract cases in `tests/contract/api-auth.contract.test.ts` for 400/409/429/500 outcomes, including password length boundaries (`specs/004-auth-management-spec/contracts/post-auth-register.md`) (FR-022)
- [x] T020 [P] [US2] Add registration integration flow tests in `tests/integration/auth-login-register.integration.test.ts` for unique-email and success session setup (FR-009, FR-010, FR-015, FR-019)

### Implementation for User Story 2

- [x] T021 [US2] Implement password composition and length (8 to 72) enforcement with field-level error payloads in `src/app/api/auth/register/route.ts` (FR-004, FR-005, FR-006, FR-007, FR-008, FR-020, FR-022)
- [x] T022 [US2] Ensure duplicate email conflict behavior and normalization are enforced in `src/app/api/auth/register/route.ts` (FR-003, FR-009, FR-019)
- [x] T023 [US2] Update registration form validation and password guidance messages in `src/app/(auth)/register/page.tsx` (FR-002, FR-008, FR-020, FR-022)
- [x] T024 [US2] Update register mutation error mapping in `src/features/auth/context/AuthContext.tsx` for duplicate email and password-rule feedback (FR-017, FR-019, FR-021)
- [x] T025 [US2] Verify register payload and error parsing compatibility in `src/features/auth/services/auth-client.ts` (`specs/004-auth-management-spec/contracts/post-auth-register.md`)

**Checkpoint**: User Story 2 is independently functional and testable.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, quality gates, and documentation updates across stories.

- [x] T026 [P] Update auth feature docs and traceability notes in `specs/004-auth-management-spec/quickstart.md` and `specs/004-auth-management-spec/plan.md`
- [x] T027 [P] Update changed product documentation in `docs/codebase-summary.md`, `docs/system-architecture.md`, and `docs/project-roadmap.md`
- [x] T028 Run and record verification commands in `specs/004-auth-management-spec/quickstart.md`: `npm run lint`, `npm run build`, `npm run test`
- [x] T029 [P] Add integration coverage for public auth-route accessibility (unauthenticated access allowed to `/login` and `/register`) in `tests/integration/auth-login-register.integration.test.ts` (FR-012)
- [x] T030 Verify and, if needed, update auth public-route guard behavior in `src/middleware.ts` and `src/features/auth/routes.ts` to ensure unauthenticated users can access `/login` and `/register` (FR-012)
- [x] T031 [P] Add guard coverage for protected-route access control (unauthenticated users blocked/redirected from `/app/*`, authenticated users allowed) in `tests/contract/api-auth-guard.contract.test.ts` and `tests/integration/auth-login-register.integration.test.ts` (FR-013)
- [x] T032 Verify and, if needed, update protected-route guard enforcement in `src/middleware.ts` and `src/features/auth/routes.ts` for `/app/*` access after successful login/register (FR-013)

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 -> no dependencies
- Phase 2 -> depends on Phase 1 and blocks all user stories
- Phase 3 (US1) -> depends on Phase 2
- Phase 4 (US2) -> depends on Phase 2 (can run in parallel with US1 after foundational completion)
- Phase 5 -> depends on completion of selected user stories

### User Story Dependency Graph

- US1 (Login) and US2 (Registration) are both P1 and independently testable after foundational work.
- Suggested execution for lowest risk: US1 -> US2 -> Polish.
- Parallel-capable execution: US1 || US2 after Phase 2, then Polish.

---

## Parallel Execution Examples

### User Story 1

```bash
# Parallel test work
T010 + T011 + T012

# Parallel implementation work (after test scaffolds)
T013 + T014
```

### User Story 2

```bash
# Parallel test work
T018 + T019 + T020

# Parallel implementation work (after foundational helpers)
T021 + T023
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1 - Login).
3. Validate independent test criteria for US1 before extending scope.

### Incremental Delivery

1. Deliver US1 (login) as first increment.
2. Deliver US2 (registration) as second increment.
3. Finish with polish and documentation updates.

### Team Parallel Strategy

1. One engineer completes foundational tasks (T005-T009).
2. One engineer executes US1 tasks while another executes US2 tasks.
3. Merge for shared polish tasks (T026-T028).

---

## Changelog

| Version | Date | Updated By | Change Summary |
|---------|------|------------|----------------|
| v1.0.0 | 2026-04-10 | OpenCode Agent | Initial executable task list generated from plan/spec/research/data model/contracts. |
| v1.0.1 | 2026-04-10 | OpenCode Agent | Rechecked implemented login/register scope and marked completed tasks based on current codebase state. |
| v1.0.2 | 2026-04-10 | OpenCode Agent | Completed Phase 1 setup tasks: captured Stitch exports and created integration test scaffolds. |
| v1.0.3 | 2026-04-10 | OpenCode Agent | Completed Phase 2 foundational tasks; added shared auth validation/error handling and redirect coverage tests. |
| v1.0.4 | 2026-04-10 | OpenCode Agent | Completed Phase 4 registration story tasks including validation/UI updates and US2 test coverage. |
| v1.0.5 | 2026-04-10 | OpenCode Agent | Completed Phase 5 polish tasks: updated feature+product docs and recorded lint/build/test verification snapshot. |
| v1.0.6 | 2026-04-10 | OpenCode Agent | Replaced login integration TODO tests with executable validation coverage and marked T010 complete. |
| v1.0.7 | 2026-04-13 | OpenCode Agent | Added explicit FR-012 and FR-013 coverage/verification tasks for auth public-route and protected-route guards. |
| v1.0.8 | 2026-04-13 | OpenCode Agent | Implemented T029-T032 with middleware guard coverage tests and verified existing route guard behavior without additional runtime changes. |
| v1.0.9 | 2026-04-13 | OpenCode Agent | Aligned password policy traceability to explicit 8 to 72 length requirement (FR-022) across existing registration validation tasks. |
