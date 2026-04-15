# Implementation Plan: Atelier Create Category

## Metadata

- **Name**: Atelier Create Category
- **Last Updated**: 2026-04-14
- **Updated By**: OpenCode Agent
- **Version**: v1.0.0

**Branch**: `006-atelier-create-category`  
**Date**: 2026-04-14  
**Spec**: `specs/006-atelier-create-category/spec.md`

---

## Summary

Implement the Atelier create-category flow from the existing Add New Category card entry point so users can open a modal, provide category settings, and create a category without leaving `/app/atelier`. The plan reuses the current Atelier page/module boundaries and category API routes, aligns trigger and modal visuals with Stitch assets, and closes key gaps against the clarified spec (duplicate-name normalization across all months, current-calendar-month write behavior, and structured field-level validation feedback).

---

## Technical Context

**Language/Version**: TypeScript (project standard)  
**Primary Dependencies**: Next.js App Router, React 18, Prisma, TanStack Query, Formik, Vitest  
**Storage**: Prisma models on project database (SQLite local; `Category`, `CategoryMonthlyLimit`, `UserMonthlyCap`)  
**Auth**: Existing JWT session in httpOnly `pf_session` cookie via `getSessionFromRequest`

**Testing**:
- FE: Vitest integration tests for modal open/close, validation, and submit UX
- BE: Vitest contract tests for `POST /api/categories` success and failure paths
- E2E: Not required for this increment; covered by integration + contract tests

**Target Platform**: Web authenticated dashboard route `/app/atelier`  
**Performance Goals**:
- Modal open/close interactions should complete within 500ms p95 in local reference data
- Successful create flow (submit to visible list refresh) should complete within 2s p95

**Constraints**:
- Keep canonical ownership in `src/app/(dashboard)/app/atelier/*`, `src/features/atelier/*`, and `src/app/api/categories/*`
- Preserve modal accessibility baseline (outside click, `Esc`, close affordance, keyboard reachable controls)
- Preserve i18n pattern (`useNamespacedTranslation`, `en.json` + `vi.json` updates together when copy changes)
- Follow Stitch references:
  - trigger from existing atelier-list asset (`specs/005-atelier-list/assets/atelier-list.html`)
  - modal from create-category asset (`specs/006-atelier-create-category/assets/add-category-modal-full-icon-grid.html`)

---

## Architecture Overview

- `AtelierPageView` remains the route-level view for `/app/atelier` and continues to orchestrate list state.
- `AddCategoryModal` remains the UI entry and submission shell; it triggers the create mutation.
- `POST /api/categories` remains the single create endpoint for category + monthly snapshot creation.
- Backend validation and business constraints remain authoritative; frontend mirrors required validation for immediate UX feedback.
- Success path refreshes Atelier list so the new category is visible immediately in the same workspace.

---

## Architecture Flow (Frontend <-> Backend)

- User opens `/app/atelier` and sees Add New Category card.
- User clicks card -> `AddCategoryModal` opens.
- User enters name/icon/limit/warning settings and submits.
- Frontend performs client validation and sends `POST /api/categories`.
- Backend authenticates user, validates payload, enforces business rules (including duplicate prevention and cap checks), persists records.
- Backend returns success payload or structured error payload.
- Frontend handles states:
  - loading: disable submit and show in-progress label
  - error: field-level and/or top-level recoverable feedback
  - success: close modal, show confirmation, refresh Atelier list

---

## Project Structure

### Documentation (this feature)

```text
specs/006-atelier-create-category/
|-- assets/
|-- contracts/
|   `-- post-api-categories.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
`-- tasks.md
```

### Source Code (repository root)

```text
src/
  app/
    (dashboard)/app/atelier/page.tsx
    api/categories/route.ts
  features/
    atelier/
      pages/AtelierPageView.tsx
      dialogs/AddCategoryModal.tsx
      services/index.ts
      types.ts
  features/i18n/locales/
    en.json
    vi.json

tests/
  integration/
    atelier-create-category-modal.integration.test.tsx
  contract/
    category-api.contract.test.ts
```

**Structure Decision**: Reuse existing Atelier dialog/API modules and extend tests in-place to keep the change set small, traceable, and reversible while matching current architecture patterns.

---

## Phase 0: Research Output

Research is documented in `specs/006-atelier-create-category/research.md`.

Resolved topics:
- Trigger and modal design-source alignment across two Stitch assets
- Validation ownership split between modal UX checks and API authority
- Duplicate-category rule enforcement strategy for create flow
- Mutation success refresh pattern consistency with existing Atelier behavior

No unresolved `NEEDS CLARIFICATION` items remain.

---

## Data Model

Detailed data definitions live in `specs/006-atelier-create-category/data-model.md`.

Primary entities:
- Category
- CategoryMonthlyLimit
- CategoryCreateInput
- CategoryCreateResult

## Contracts

Detailed interface contracts live in `specs/006-atelier-create-category/contracts/`.

Primary contracts:
- `POST /api/categories`

---

## UI Implementation Plan

### Pages

- `/app/atelier`: preserve existing list context and trigger point for create modal

### Components

- `AddCategoryModal`: align trigger card styling/placement with `atelier-list.html` source and modal body with create-category modal asset
- `AtelierPageView`: ensure trigger is present in list context and list refresh behavior remains predictable after create

### State Management

- Keep modal local state for open/close and form state
- Keep mutation orchestration in TanStack Query `useMutation`
- Keep list state server-driven via `router.refresh()` on successful mutation

### User Interaction Flow

- User clicks Add New Category card
- Modal opens and focus lands on first required input
- User edits fields and submits
- Submit dispatches create mutation
- Success closes modal + refreshes list; errors stay in modal for correction

### UI States

- loading: disable submit, show adding label, prevent duplicate submits
- error: show field-level messages and recoverable top-level error when needed
- success: toast confirmation + modal close + refreshed list
- disabled: warning threshold input disabled when warning toggle is off

### Data Fetching

- Initial load: existing Atelier page server data fetch
- Post-create: `router.refresh()` to reflect newly created category in list

---

## Backend Implementation Plan

- Keep `POST /api/categories` as create endpoint with auth guard and user scoping.
- Normalize create payload validation (name, limit, warning fields, icon fallback).
- Add duplicate-name prevention for same user across all months using normalized name comparison (trim + case-insensitive).
- Preserve monthly-cap overflow checks for current and next month snapshots.
- Persist category and month snapshots atomically.
- Return structured error payloads that support field-level UI mapping and duplicate-name inline conflict handling.

---

## UI <-> API Mapping

### Open Create Modal

- User action: click Add New Category card  
  -> API call: none  
  -> Purpose: enter category details in-place  
  -> UI update: modal opens with defaults and icon preselection

### Submit Create Category

- User action: click Add Category in modal  
  -> API call: `POST /api/categories`  
  -> Purpose: create category + monthly snapshot records for user scope  
  -> UI update (success): close modal, show success feedback, refresh list

### Handle Create Failure

- User action: submit invalid or conflicting payload  
  -> API call: `POST /api/categories` (4xx/5xx)  
  -> Purpose: reject invalid mutation without data loss  
  -> UI update: keep modal open, show field/top-level errors, preserve user input

---

## Testing Strategy

### Frontend

- Verify Add New Category card renders and opens modal.
- Verify modal dismiss paths: close button, discard, outside click, escape.
- Verify required and range validations show actionable messages.
- Verify successful submit closes modal and triggers list refresh.

### Backend

- Extend category contract tests for duplicate-name rejection in create flow.
- Verify validation response shape is usable for field-level UI feedback.
- Verify unauthorized requests remain blocked.

### End-to-End Validation

- Manual smoke: `/app/atelier` -> open modal -> create category -> confirm new category visible.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Code quality gate defined (lint/build/type safety and reuse strategy)
- [x] Testing strategy defined (automated coverage for changed behavior)
- [x] UX consistency gate defined (design-guidelines and canonical route alignment)
- [x] Performance budget defined (p95 target and validation method)
- [x] Documentation impact captured (`docs/codebase-summary.md`, `docs/system-architecture.md`, `docs/project-roadmap.md`)

Post-design re-check status: **PASS** (Phase 0 and Phase 1 artifacts remain constitution-compliant; no gate violations identified).

---

## Risks / Trade-offs

- Duplicate-name normalization across all months may block similarly named historical categories users may expect to allow; this is an intentional consistency tradeoff.
- Maintaining both client-side and server-side validation can drift if not covered by tests; mitigated via contract + integration assertions.
- Stitch modal layout may diverge from existing design-tokenized components; implementation should prioritize functional requirements and document any intentional visual deltas.

---

## Changelog

| Version | Date | Updated By | Change Summary |
|---------|------|------------|----------------|
| v1.0.0 | 2026-04-14 | OpenCode Agent | Initial implementation plan completed through Phase 0 and Phase 1 design artifacts for Atelier create-category flow. |

---
