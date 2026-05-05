# Implementation Plan: Ledger Transaction Display Groups

## Metadata

- **Name**: Ledger Transaction Display Groups
- **Last Updated**: 2026-05-04
- **Updated By**: OpenCode Agent
- **Version**: v1.0.0

**Branch**: `009-group-transactions-date`  
**Date**: 2026-05-04  
**Spec**: `/Users/haidv7/Desktop/Workspace/Perrsonal/lush-ledger/specs/009-group-transactions-date/spec.md`

---

## Summary

Implement ledger activity grouping UI with flat date headers: `Today`, `Yesterday`, then locale-formatted older calendar dates. Reuse existing ledger route, data source, filters, and transaction row actions. Scope is frontend-only and keeps API contract unchanged.

---

## Technical Context

**Frontend**: Next.js App Router + React 18 + TypeScript  
**Backend**: Existing Next.js route handlers (no new endpoint required)  
**Database**: Existing Prisma + SQLite model usage through current ledger query  
**Auth**: Existing session-based user context and page guard  

**Testing**:
- FE: Vitest + Testing Library
- BE: N/A for this feature slice (no backend behavior change)
- E2E: Playwright optional regression for ledger grouping visibility

**Target Platform**: Web (`/app/ledger`)  
**Performance Goals**: Grouped ledger view renders within 2s for typical monthly volume; date header computation remains O(n) over visible rows.  
**Constraints**:
- No nested "all remaining" bucket
- Must preserve existing filter/search/export/edit/delete interactions
- Must use locale-aware date formatting based on authenticated user language
- Must keep canonical route and existing component ownership

---

## Constitution Check (Pre-Design)

- **I. Code Quality Is Non-Negotiable**: PASS  
  Changes are isolated to existing ledger feature/page with reuse of current date and i18n helpers.
- **II. Tests Prove Behavior**: PASS  
  Plan includes frontend automated coverage for day headers, locale formatting, empty/error behavior, and no-regression on list actions.
- **III. UX Consistency Across Canonical Flows**: PASS  
  Work stays in `/app/ledger`, follows existing ledger interaction patterns and design references.
- **IV. Performance Budgets Are Product Requirements**: PASS  
  Explicit render budget and linear grouping strategy are defined.
- **V. Small, Traceable, Reversible Delivery**: PASS  
  Single feature slice with explicit artifacts and file-level traceability.

No gate violations.

---

## Architecture Overview

- Server page fetch remains unchanged (`getLedgerData` + `LedgerPageView` props)
- Client ledger view computes date headers from visible transaction list
- Date label rules:
  - same local day => `Today`
  - previous local day => `Yesterday`
  - older => localized calendar date label
- Existing filter/search refresh triggers regrouping
- Existing row actions and export flow remain intact

---

## Architecture Flow (Frontend ↔ Backend)

- User opens `/app/ledger`
- Frontend receives existing transaction list payload
- Frontend derives date header groups from transaction dates
- Frontend renders grouped sections and row cards
- User applies filters/search
- Frontend receives refreshed list payload
- Frontend recomputes and re-renders groups

---

## Project Structure

### Documentation (this feature)

```text
specs/009-group-transactions-date/
├── assets/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── get-ledger.md
└── tasks.md
```

### Source Code (repository root)

```text
src/app/(dashboard)/app/ledger/page.tsx
src/features/ledger/pages/LedgerPageView.tsx
src/features/i18n/locales/en.json
src/features/i18n/locales/vi.json
tests/integration/ledger-page-grouping.integration.test.tsx
```

**Structure Decision**: Keep all behavior in existing ledger page/view and locale dictionaries to minimize risk and preserve feature ownership boundaries.

---

## Phase 0: Research

Research decisions captured in `research.md`:
- Locale date formatting strategy
- Day-boundary handling approach
- Header ordering and empty-group behavior
- Regression-safe test scope

All technical unknowns resolved.

---

## Phase 1: Design & Contracts

Artifacts:
- `data-model.md`: display grouping model and label derivation constraints
- `contracts/get-ledger.md`: existing ledger response contract relied on by grouping UI
- `quickstart.md`: implementation and verification flow

---

## UI Implementation Plan

### Pages
- `/app/ledger`

### Components
- `LedgerPageView` grouped list sections
- Existing transaction row card and actions

### State Management
- Existing local state for export and error handling
- Derived grouping from `data.transactions` on render

### User Interaction Flow
- Open ledger -> grouped headers render
- Scroll and inspect groups
- Apply filter/search -> grouped headers update
- Use existing actions without behavior change

### UI States
- loading: existing page loading behavior retained
- error: existing export/list error presentation retained
- empty: no matching entries message retained
- success: grouped list visible with correct labels

### Data Fetching
- No new endpoint
- Continue existing server fetch and client render flow

---

## Backend Implementation Plan

- No backend route/model changes expected
- Validate existing `/api/ledger` response includes required date field for all rows
- If gaps are found during implementation, treat as follow-up scope change request

---

## UI ↔ API Mapping

### Ledger Grouped Activity View

- Open or refresh ledger page
  -> `GET /api/ledger` (existing)
  -> Purpose: fetch user-scoped transaction list with dates
  -> UI update: render flat date headers (Today, Yesterday, older locale dates)

---

## Error Handling Strategy

- Invalid/missing date value in a record:
  - do not place under incorrect header
  - apply stable fallback behavior aligned with spec FR-002
- Empty result:
  - show existing empty-state message
- Data load failure:
  - show existing error state behavior

---

## Data Ownership

- Source of truth: `GET /api/ledger` response
- Frontend state: derived view grouping from transaction date values
- Cache strategy: existing server-render + route refresh patterns

---

## Performance Considerations

- Keep grouping pass linear over visible transactions
- Avoid additional network requests for grouping-only behavior
- Preserve current rendering structure to avoid unnecessary rerenders

---

## Testing Strategy

### Frontend

- Unit/integration coverage for:
  - Today header rendering
  - Yesterday header rendering
  - Older locale date header rendering
  - Header order correctness
  - Empty-group suppression

### Backend

- No new backend tests required unless contract gap discovered

### E2E

- Optional smoke: ledger page shows grouped headers after seed data load

---

## Constitution Check (Post-Design)

- **I. Code Quality Is Non-Negotiable**: PASS
- **II. Tests Prove Behavior**: PASS
- **III. UX Consistency Across Canonical Flows**: PASS
- **IV. Performance Budgets Are Product Requirements**: PASS
- **V. Small, Traceable, Reversible Delivery**: PASS

No post-design violations.

---

## Risks / Trade-offs

- Locale edge cases (language/date format variations) can cause flaky assertions if tests hardcode date strings.
- Day-boundary behavior depends on effective local date; tests must control time zone/date fixtures.
- Trade-off: keeping backend unchanged reduces risk and scope, but assumes existing ledger payload always includes valid dates.

---

## Changelog

| Version | Date | Updated By | Change Summary |
| ------- | ---- | ---------- | -------------- |
| v1.0.0 | 2026-05-04 | OpenCode Agent | Initial implementation plan for ledger date-header grouping UI. |

---
