# Implementation Plan: Atelier List

## Metadata

- **Name**: Atelier List
- **Last Updated**: 2026-04-14
- **Updated By**: OpenCode Agent
- **Version**: v1.0.0

**Branch**: `005-atelier-list`  
**Date**: 2026-04-14  
**Spec**: `specs/005-atelier-list/spec.md`

---

## Summary

Implement a read-only Atelier list experience that shows all categories with name, icon, selected-month limit, carry-to-next-month visibility, warning percentage, and spend risk state. The approach reuses existing Atelier page and monthly snapshot infrastructure, adds explicit month-context handling, and provides a stable list contract for UI rendering without adding create or update flows.

---

## Technical Context

**Language/Version**: TypeScript (project standard)  
**Primary Dependencies**: Next.js App Router, React, Prisma, TanStack Query (existing), Vitest  
**Storage**: Prisma models on current project database (SQLite for local development)  
**Auth**: Existing JWT session in httpOnly `pf_session` cookie

**Testing**:
- FE: Vitest integration/component tests for Atelier list rendering and month switching behavior
- BE: Vitest API/route-handler tests for month-scoped list payload and auth guard behavior
- E2E: Not required for this increment; covered by integration + contract tests

**Target Platform**: Web, authenticated dashboard route `/app/atelier`  
**Performance Goals**:
- Month-context list load or refresh should complete within 2 seconds p95 under local reference data
- Risk state visibility (warning/overspent/healthy) must render in the same response cycle as list data

**Constraints**:
- Feature scope is read-only list behavior (no create/update/delete category interactions)
- All list data must be scoped to authenticated `userId`
- Month snapshot semantics must remain aligned with `CategoryMonthlyLimit` and `UserMonthlyCap`
- Warning/overspent states must not rely on color alone

---

## Architecture Overview

- Dashboard page route under `src/app/(dashboard)/app/atelier/page.tsx` remains the canonical entry.
- Server-side data assembly continues to be the source of truth for category list payloads.
- Month context is represented via request-level month input and mapped to monthly snapshots.
- Category list UI (`AtelierPageView`, `CategoryAtelierGrid`) renders normalized read-only row data.
- Risk status is computed from monthly limit + spent amount + warning threshold, then displayed consistently.

---

## Architecture Flow (Frontend <-> Backend)

- User opens `/app/atelier` (default current month) or month-specific view.
- Frontend requests month-scoped list data through existing dashboard route/API contract.
- Backend verifies session and user ownership.
- Backend loads categories, monthly limit snapshot, and month transaction totals.
- Backend computes list row values (limit, warning threshold, spent, usage, status, carry-next visibility).
- Backend returns structured list payload.
- Frontend renders loading/error/empty/list states and refreshes when month context changes.

---

## Project Structure

### Documentation (this feature)

```text
specs/005-atelier-list/
|-- assets/
|-- contracts/
|   `-- get-api-atelier.md
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
    api/atelier/route.ts
  features/
    atelier/
      pages/AtelierPageView.tsx
      components/CategoryAtelierGrid.tsx
      types.ts
  lib/
    monthly-cap.ts
    date.ts

tests/
  contract/
    api-atelier.contract.test.ts
  integration/
    atelier-list.integration.test.tsx
```

**Structure Decision**: Reuse existing Atelier module boundaries and API route ownership; introduce only list-focused changes in current files to keep the increment small and reversible.

---

## Phase 0: Research Output

Research is documented in `specs/005-atelier-list/research.md`.

Resolved topics:
- Month-context transport pattern for list-only dashboards
- Carry-next-month visibility semantics for read-only rows
- Risk state precedence and threshold handling
- Empty and partial-data fallback behavior for monthly snapshots

No unresolved `NEEDS CLARIFICATION` items remain.

---

## Data Model

Detailed data definitions live in `specs/005-atelier-list/data-model.md`.

Primary entities:
- Category
- CategoryMonthlyLimit
- AtelierListRow

## Contracts

Detailed interface contracts live in `specs/005-atelier-list/contracts/`.

Primary contracts:
- `GET /api/atelier?month=YYYY-MM`

---

## UI Implementation Plan

### Pages

- `/app/atelier`: render read-only Atelier list screen using selected month context

### Components

- `AtelierPageView`: normalize and pass month-scoped category stats for list rendering
- `CategoryAtelierGrid`: present category rows and risk states without create/update controls

### State Management

- Use route-level month context as source of truth for selected month
- Keep list rows derived from server-provided payload for consistency

### User Interaction Flow

- Open Atelier list -> see all category rows for selected month
- Change month context -> trigger data refresh -> list updates
- Observe warning/overspent/healthy status per row

### UI States

- loading: preserve layout while month data refreshes
- error: show actionable retry path
- empty: show no-category guidance state
- disabled: month selector disabled during in-flight refresh

### Data Fetching

- Initial load: server-rendered month-scoped list data
- Refresh: month-context change re-requests month-scoped list data

---

## Backend Implementation Plan

- Extend/readjust Atelier list data retrieval to accept explicit month context.
- Enforce `userId` scoping in all list queries.
- Include monthly limit fields needed for list rows: limit, warningEnabled, warnAt.
- Compute carry-next visibility for each category row from month snapshot behavior.
- Return stable list payload shape for empty and partial-data conditions.
- Preserve existing auth guard behavior for unauthorized access.

---

## UI <-> API Mapping

### Load Atelier List

- Open Atelier list  
  -> `GET /api/atelier?month=YYYY-MM` (or equivalent server-side fetch path)  
  -> Purpose: fetch month-scoped category list rows  
  -> UI update: render rows with name/icon/limit/carry-next/warn threshold/status

### Switch Month Context

- Change month selector  
  -> `GET /api/atelier?month=YYYY-MM` for new month  
  -> Purpose: refresh list to selected month snapshot  
  -> UI update: replace row values and risk states for selected month

---

## Testing Strategy

### Frontend

- Verify list rows render all required attributes from payload.
- Verify month switching updates list values and status labels.
- Verify warning and overspent states include non-color cues.

### Backend

- Contract tests for month parsing, auth guard, and response shape.
- Integration tests for threshold crossing, overspent behavior, and snapshot fallback.

### End-to-End Validation

- Manual smoke path: open `/app/atelier`, switch month, confirm list row updates and risk state changes.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Code quality gate defined (lint/build/type safety and reuse strategy)
- [x] Testing strategy defined (automated coverage for changed behavior)
- [x] UX consistency gate defined (design-guidelines and canonical route alignment)
- [x] Performance budget defined (p95 target and validation method)
- [x] Documentation impact captured (`docs/codebase-summary.md`, `docs/system-architecture.md`, `docs/project-roadmap.md`)

Post-design re-check status: **PASS** (Phase 0 and Phase 1 artifacts stay within constitution gates).

---

## Risks / Trade-offs

- Carry-next-month visibility is derived from snapshot behavior; historical intent cannot be reconstructed perfectly when month data was manually edited later.
- Server-side month refresh favors consistency over highly interactive client-only filtering.
- Existing Atelier components currently include edit/create affordances; plan requires suppressing these in list-only scope without destabilizing shared component behavior.

---

## Changelog

| Version | Date | Updated By | Change Summary |
|---------|------|------------|----------------|
| v1.0.0 | 2026-04-14 | OpenCode Agent | Initial implementation plan completed through Phase 0 and Phase 1 design artifacts for Atelier list-only scope. |

---
