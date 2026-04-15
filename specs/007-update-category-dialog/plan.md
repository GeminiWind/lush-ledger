
# Implementation Plan: Atelier Category Update Dialog

## Metadata

- **Name**: Atelier Category Update Dialog
- **Last Updated**: 2026-04-15
- **Updated By**: OpenCode Agent
- **Version**: v1.0.0

**Branch**: `007-update-category-dialog`  
**Date**: 2026-04-15  
**Spec**: `/Users/haidv7/Desktop/Workspace/Perrsonal/lush-ledger/specs/007-update-category-dialog/spec.md`

---

## Summary

Implement a complete edit-category flow from Atelier list cards: clicking the row edit control opens an edit dialog prefilled with current category data, validates user changes, and updates category records through the categories update endpoint. The implementation extends existing Atelier modules (`CategoryAtelierGrid`, `EditCategoryModal`, category API route) to enforce clarified requirements: case-insensitive unique names and warning-threshold preservation when warnings are disabled.

---

## Technical Context

**Frontend**: Next.js App Router client/server components with React 19 + Formik + TanStack Query  
**Backend**: Next.js route handlers under `src/app/api/*`  
**Database**: Prisma ORM on SQLite (local), models `Category` and `CategoryMonthlyLimit`  
**Auth**: Session from `pf_session` via `getSessionFromRequest` / `requireUser`

**Testing**:
- FE/Integration: Vitest (`tests/integration/*.test.tsx`)
- API/Contract: Vitest (`tests/contract/*.test.ts`)
- E2E: Not required for this slice (no existing dedicated E2E harness)

**Target Platform**: Authenticated web app (`/app/atelier`)  
**Performance Goals**: Dialog open feedback and update-submit feedback align with constitution p95 target (<=200ms on local reference data) and spec NFR response visibility target (<=2s)  
**Constraints**:
- Must preserve canonical route flow (`src/app/(dashboard)/app/atelier/page.tsx`)
- Must preserve i18n usage via `useNamespacedTranslation`
- Must preserve existing monthly cap snapshot invariants in category update path

---

## Architecture Overview

- Server renders Atelier list data and passes rows to `AtelierPageView`.
- `CategoryAtelierGrid` renders each category card and owns edit trigger placement.
- `EditCategoryModal` receives selected category row values and manages update form state.
- Client submits PATCH to `/api/categories/:id` with form payload.
- API validates auth, ownership, value constraints, name uniqueness, and cap checks.
- API persists category + monthly limits in transaction and returns updated category payload.
- Client handles loading/error/success states, invalidates relevant query keys, and refreshes list view.

---

## Architecture Flow (Frontend <-> Backend)

- User clicks category edit control on an Atelier card.
- Frontend opens edit dialog with current row data prefilled.
- User updates fields and submits `Update Category`.
- Frontend sends PATCH request with:
  - proposed values (`name`, `icon`, `monthlyLimit`, `warningEnabled`, `warnAt`, `keepLimitNextMonth`)
- Backend validates request against FR-001..FR-020 and runs persistence transaction.
- Backend returns:
  - `200` + updated category on success
  - `400` field/business validation errors
  - `401` unauthorized
  - `404` missing/inaccessible category
- Frontend shows field/global errors inline and only closes dialog on success.

---

## Project Structure

### Documentation (this feature)

```text
specs/007-update-category-dialog/
├── assets/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── patch-categories-id.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
  app/
    (dashboard)/app/atelier/page.tsx
    api/categories/[id]/route.ts
  features/atelier/
    components/CategoryAtelierGrid.tsx
    dialogs/EditCategoryModal.tsx
    pages/AtelierPageView.tsx
    services/index.ts
    types.ts

tests/
  integration/
    atelier-list*.test.ts*
  contract/
    category-api.contract.test.ts
```

**Structure Decision**: Keep all changes within existing Atelier feature and categories API modules to satisfy constitution principle V (small, traceable delivery) and avoid introducing parallel abstractions.

---

## Data Model Summary

Detailed definitions and validation constraints live in `data-model.md`.

Primary entities:

- Category (user-owned base record)
- CategoryMonthlyLimit (month-scoped settings and limit snapshot)

---

## API Contracts Summary

Detailed API contract lives in `contracts/patch-categories-id.md`.

Primary contract:

- PATCH `/api/categories/{id}`

---

## UI Implementation Plan

### Pages
- `/app/atelier` via `src/app/(dashboard)/app/atelier/page.tsx`

### Components
- `src/features/atelier/components/CategoryAtelierGrid.tsx`
- `src/features/atelier/dialogs/EditCategoryModal.tsx`
- `src/features/atelier/pages/AtelierPageView.tsx` (wiring only)

### State Management
- Dialog open/close + field state in modal local state/Formik
- Mutation lifecycle via `useMutation` from TanStack Query
- Post-success sync via query invalidation + `router.refresh()`

### User Interaction Flow
- Edit icon click on card opens modal with row values.
- User edits name/icon/limit/warning fields.
- Submit validates locally then calls PATCH.
- Success: close modal, show confirmation, refresh list.
- Error: keep modal open, show field/global messages, preserve values.

### UI States
- loading: submit disabled and saving label shown
- error: inline field errors and top-level error panel
- success: toast + modal close + refreshed card data
- dismissed: cancel/close/Esc/backdrop closes without persisting

### Data Fetching
- Initial category data from server-rendered Atelier list
- Mutation response-driven refresh after successful edit

---

## Backend Implementation Plan

- Extend `PATCH /api/categories/[id]` validation for:
  - case-insensitive unique name excluding current record
  - warning threshold behavior when warning disabled
- Keep existing auth + ownership checks.
- Preserve existing monthly cap and next-month cap enforcement.
- Return structured error payloads with field-level map for UI mapping where applicable.
- Preserve transactional update semantics for `Category` + `CategoryMonthlyLimit`.

---

## UI <-> API Mapping

### Edit Category Submission

- User Action: Click `Update Category` in edit dialog  
  -> API Call: `PATCH /api/categories/{id}`  
  -> Purpose: Persist edited category values  
  -> UI Update: Modal closes and list refreshes on success; otherwise show actionable errors

## Error Handling Strategy

- Validation errors (`400`):
  - Field-level payload shape: `{ error: string, errors: { field: message } }`
  - UI maps to inline errors for `name`, `monthlyLimit`, `warnAt`
- Not found/permission (`404`, `401`):
  - Return clear error, no mutation side effects
- System errors (`500`):
  - Return generic user-safe message
  - Preserve typed logs in server runtime

---

## Data Ownership

- Source of truth: Backend category API + Prisma transaction
- Frontend state: Derived from server-rendered list + mutation response
- Cache strategy: Invalidate `atelier` scoped query keys and refresh route after mutation

---

## Performance Considerations

- Keep dialog open/close interactions client-local and lightweight.
- Avoid extra list fetches before submit; use existing server-provided row data.
- Use one PATCH call per update and one refresh path after success.
- Validate performance via targeted integration run and manual timing checks against p95 budget.

---

## Testing Strategy

### Frontend

- Add/extend integration tests for:
  - opening edit dialog from card action
  - prefilled values from selected category row
  - preserving values on backend errors
  - warning threshold disable/preserve behavior

### Backend

- Extend `tests/contract/category-api.contract.test.ts` for:
  - case-insensitive uniqueness on PATCH excluding same category
  - duplicate-name rejection behavior and retryable error rendering
  - preserved threshold when warning disabled

### End-to-End Behavior Slice

- Validate full user path at integration level (`Atelier list -> edit modal -> PATCH -> refreshed list`) using existing test stack.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Code quality gate defined (reuse current feature modules; lint/build required)
- [x] Testing strategy defined (integration + contract coverage for changed behavior)
- [x] UX consistency gate defined (canonical `/app/atelier`, dialog dismiss patterns, required marker consistency)
- [x] Performance budget defined (constitution p95 target + spec feedback target)
- [x] Documentation impact captured (`docs/codebase-summary.md`, `docs/system-architecture.md`, `docs/project-roadmap.md`)

Post-Design Re-check (after Phase 1 artifacts): PASS

---

## Phase Plan

### Phase 0 - Research

- Produce `research.md` covering:
  - uniqueness/validation behavior alignment between POST and PATCH category flows
  - structured error payload compatibility with existing UI parsing

### Phase 1 - Design & Contracts

- Produce `data-model.md` with entities, validation rules, and lifecycle mapping.
- Produce `contracts/patch-categories-id.md` with request/response/error contract.
- Produce `quickstart.md` for implementation and verification sequence.
- Run `.specify/scripts/bash/update-agent-context.sh opencode`.

### Phase 2 - Task Planning Readiness

- Confirm no unresolved clarification remains.
- Confirm constitution gates remain pass post-design.
- Handoff to `/speckit.tasks`.

---

## Risks / Trade-offs

- Risk: Existing PATCH route currently allows monthly limit `0`, while spec requires positive value.
  - Decision: Align implementation to spec and adjust tests accordingly.
- Risk: Existing edit modal title/action copy diverges from requested naming.
  - Decision: Normalize to explicit "Edit Category" + "Update Category" user-facing language.

---

## Changelog

| Version | Date | Updated By | Change Summary |
|---------|------|------------|----------------|
| v1.0.0 | 2026-04-15 | OpenCode Agent | Completed plan with technical context, constitution gates, Phase 0/1 artifacts, and readiness for task generation. |

---
