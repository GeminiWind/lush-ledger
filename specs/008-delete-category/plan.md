# Implementation Plan: Atelier Delete Category

## Metadata

- **Name**: Atelier Delete Category
- **Last Updated**: 2026-04-29
- **Updated By**: OpenCode Agent
- **Version**: v1.1.0

**Branch**: `008-delete-category`  
**Date**: 2026-04-29  
**Spec**: `/Users/haidv7/Desktop/Workspace/Perrsonal/lush-ledger/specs/008-delete-category/spec.md`

---

## Summary

Implement a safe category deletion flow in Atelier using a confirmation dialog, soft-delete semantics (`deletedAt`), transaction reassignment to a system `Uncategorized` category, and strict ownership/auth checks. UI follows Stitch modal design and existing TanStack Query refresh patterns.

---

## Technical Context

**Frontend**: Next.js App Router + React + TypeScript  
**Backend**: Next.js Route Handlers (Node runtime) + Prisma  
**Database**: SQLite (local), Prisma-managed relational schema  
**Auth**: Session-based auth guard utilities already used by API routes  

**Testing**:
- FE: Vitest + Testing Library
- BE: Vitest contract tests for API routes
- E2E: Playwright (existing ordered flow)

**Target Platform**: Web (desktop-first dashboard flows)  
**Performance Goals**: Delete confirm path feedback <= 2s (spec NFR-004), modal open/close perceived instant (<200ms local)  
**Constraints**:
- Must preserve historical transaction visibility
- Must return `404 Not Found` for already soft-deleted/non-existent target
- Must keep UX consistency with canonical Atelier dialogs and design tokens

---

## Constitution Check (Pre-Design)

- **I. Code Quality Is Non-Negotiable**: PASS  
  Reuse existing category route/dialog/query patterns; no speculative abstractions.
- **II. Tests Prove Behavior**: PASS  
  Plan includes contract/integration coverage for success/cancel/auth/not-found/failure.
- **III. UX Consistency Across Canonical Flows**: PASS  
  Use Stitch modal asset + existing dismiss behavior + destructive action hierarchy.
- **IV. Performance Budgets Are Product Requirements**: PASS  
  Explicit delete-flow feedback target <=2s; no full-page reload strategy.
- **V. Small, Traceable, Reversible Delivery**: PASS  
  Scope is one feature slice; docs + tests + contracts tracked in feature directory.

No gate violations requiring exception.

---

## Architecture Overview

- Atelier category row exposes delete trigger
- Delete dialog opens with target category context
- Confirm action calls `DELETE /api/categories/{id}`
- Backend validates auth + ownership + existence (active only)
- Backend ensures `Uncategorized` category exists for user
- Backend reassigns linked transactions to `Uncategorized`
- Backend soft-deletes category (`deletedAt` set) and handles related monthly limits per business rule
- Frontend handles loading/error/success and refreshes Atelier list state

---

## Architecture Flow (Frontend ↔ Backend)

- User clicks category delete action
- Frontend opens delete confirmation modal
- User confirms delete
- Frontend sends `DELETE /api/categories/{id}`
- Backend validates FR-001/FR-002/FR-006/FR-007/FR-012
- Backend performs transactional mutation:
  - transaction reassignment
  - category soft delete
  - related limit cleanup/consistency handling
- Backend returns structured response
- Frontend closes modal + refreshes list on success
- Frontend keeps modal open + shows retryable error on failure

---

## Project Structure

### Documentation (this feature)

```text
specs/008-delete-category/
├── assets/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── delete-categories-id.md
└── tasks.md
```

### Source Code (repository root)

```text
src/app/api/categories/[id]/route.ts
src/features/atelier/dialogs/DeleteCategoryDialog.tsx
src/features/atelier/components/CategoryAtelierGrid.tsx
src/features/atelier/hooks/* (if needed)
tests/contract/category-api.contract.test.ts
tests/integration/atelier-delete-category-dialog.integration.test.tsx
```

**Structure Decision**: Keep implementation in existing Atelier/API slices for minimal diff and high maintainability.

---

## Phase 0: Research

Resolved decisions in `research.md`:
- Soft-delete strategy vs hard-delete
- Transaction reassignment strategy (`Uncategorized`)
- Error semantics for not-found (`404`)
- Mutation refresh pattern and test scope

All previously ambiguous items resolved.

---

## Phase 1: Design & Contracts

Artifacts:
- `data-model.md`: Category lifecycle + fallback category + delete attempt outcomes
- `contracts/delete-categories-id.md`: delete API request/response/errors/side effects
- `quickstart.md`: implementation + validation steps aligned with constitution gates

---

## UI Implementation Plan

### Pages
- `/app/atelier` (in-place modal workflow)

### Components
- Category row delete trigger
- `DeleteCategoryDialog` confirmation modal

### State Management
- Dialog open state scoped to selected category
- Mutation pending/error via TanStack Query

### User Interaction Flow
- Click delete -> open modal -> confirm/cancel
- Confirm triggers delete API
- Success closes modal + list refresh
- Failure shows message, allows retry

### UI States
- idle, confirming, deleting, success, failure

### Data Fetching
- Existing Atelier query invalidation + `router.refresh()` after mutation success

---

## Backend Implementation Plan

- Extend `DELETE /api/categories/{id}` to enforce:
  - auth required (`401`)
  - ownership guard
  - active-category existence check (`404` if missing/soft-deleted)
- Ensure user-scoped system `Uncategorized` category exists for reassignment
- Transactionally:
  - reassign linked transactions to `Uncategorized`
  - soft-delete target category (`deletedAt`)
  - apply related category-limit cleanup rules
- Return structured success/error payloads

---

## UI ↔ API Mapping

### Delete Category

- Category row "Delete" action
  → `DELETE /api/categories/{id}`
  → Purpose: remove category from active list with safe continuity
  → UI update: close modal, refresh list, show feedback

---

## Error Handling Strategy

- Validation/business errors:

```json
{ "error": "Validation failed.", "errors": { "field": "message" } }
```

- Not found/already deleted:

```json
{ "error": "Category not found." }
```

- UI handling:
  - inline/message area in dialog for recoverable failures
  - prevent duplicate submission while pending

---

## Data Ownership

- Source of truth: Backend API + DB
- Frontend state: derived from API responses
- Cache strategy: TanStack Query invalidation + refresh

---

## Performance Considerations

- Delete API p95 under normal local reference load should support <=2s end-user feedback path
- Avoid full page reload; refresh only required data paths
- Modal interactions remain lightweight (no extra heavy client computation)

---

## Testing Strategy

### Frontend Integration
- Dialog open/close paths (cancel, outside click, Esc)
- Pending-state disable and error rendering
- Success close + list refresh signal

### Backend/Contract
- `401` unauthorized
- `404` missing or already soft-deleted category
- Ownership protection
- Successful reassignment + soft-delete behavior

### E2E (targeted)
- Optional focused delete-flow scenario once UI path merged (existing Playwright setup available)

---

## Documentation Impact

Update in same implementation change:
- `docs/codebase-summary.md`
- `docs/system-architecture.md`
- `docs/project-roadmap.md`

---

## Constitution Check (Post-Design)

- **Quality Gate**: Planned (lint/build required)
- **Testing Gate**: Planned (contract + integration coverage explicit)
- **UX Gate**: Planned (Stitch modal + canonical dismiss behaviors)
- **Performance Gate**: Planned (NFR-004 budget carried into quickstart verification)
- **Documentation Gate**: Planned (required docs listed)

Post-design status: PASS. No unresolved constitution violations.
