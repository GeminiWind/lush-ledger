
# Implementation Plan: [FEATURE]

## Metadata

- **Name**: [FEATURE]
- **Last Updated**: [DATE]
- **Updated By**: [NAME/ROLE]
- **Version**: [e.g., v1.0.0]

**Branch**: `[###-feature-name]`  
**Date**: [DATE]  
**Spec**: [link to spec.md]

---

## Summary

[Short summary of feature + technical approach derived from spec]

---

## Technical Context

**Frontend**: [React / Next.js / etc]  
**Backend**: [FastAPI / Node / etc]  
**Database**: [PostgreSQL / MongoDB / etc]  
**Auth**: [JWT / Session / etc]  

**Testing**:
- FE: [Vitest / Jest]
- BE: [pytest / etc]
- E2E: [Playwright / Cypress]

**Target Platform**: [Web / Mobile / etc]  
**Performance Goals**: [e.g., <200ms response time]  
**Constraints**: [e.g., must support 10k users]  

---

## Architecture Overview

- Frontend handles UI and user interaction
- Frontend communicates with backend via API
- Backend validates input (FR rules)
- Backend processes business logic
- Backend persists data
- Backend returns structured response
- Frontend updates UI based on response

---

## Architecture Flow (Frontend ↔ Backend)

- User interacts with UI (page / modal / form)
- Frontend triggers API request
- Backend validates request (FR-xxx)
- Backend processes and persists data
- Backend returns response
- Frontend updates UI:
  - loading
  - error
  - success

---

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── assets/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── [method-resource].md
└── tasks.md
````

### Source Code (repository root)

```text
frontend/
  src/
    features/
      [feature-name]/
        components/
        pages/
        hooks/
        services/

backend/
  src/
    features/
      [feature-name]/
        routes/
        services/
        models/
        schemas/

frontend/tests/
  unit/
  integration/

backend/tests/
  unit/
  integration/
  contract/

tests/
  e2e/
```

**Structure Decision**: [Explain why this structure is chosen]

---

## Data Model Summary

Detailed data definitions live in `data-model.md`.

Primary entities:

* <Entity A>
* <Entity B>

---

## Data Model Output Format

```md
# Data Model: <Feature Name>

## <Entity Name>

### Purpose

### Fields
- <field>: <type> - <description>

### Constraints
- <rule>

### Relationships
- <relation>

### Lifecycle (optional)
- <state transitions>
```

---

## API Contracts Summary

Detailed API contracts live in `contracts/`.

Primary contracts:

* [METHOD] /api/<resource>
* [METHOD] /api/<resource>/<id>

---

## API Contracts Output Format

Each API contract must be generated as a separate file:

File naming:

* `<method>-<resource>.md` (e.g., `post-products.md`)

````md
# <METHOD> /api/<resource>

## Purpose
<What this endpoint does>

## Triggered By
<UI action>

## Request
```json
{
  ...
}
````

## Success Response

```json
{
  ...
}
```

## Error Response

```json
{
  "errors": {
    "field": "message"
  }
}
```

## Related Functional Requirements

* FR-001
* FR-002

````

---

## UI Implementation Plan

### Pages
- [Page A]

### Components
- [Component A]
- [Component B]

### State Management
- local state / global store

### User Interaction Flow
- User performs [action]
- UI updates [component]
- Submit triggers [API call] (see contracts)
- Handle loading / error / success

### UI States
- loading: disable interaction / show spinner
- error: display message
- success: update UI / close modal / redirect

### Data Fetching
- Initial load
- Refresh after mutation

---

## Backend Implementation Plan

- Define API routes
- Implement validation (FR-xxx)
- Implement business rules
- Implement permission checks
- Persist data to database
- Return structured responses
- Handle errors consistently

---

## UI ↔ API Mapping

### [Flow Name]

- [User Action]
  → [API Call]  
  → Purpose: [...]  
  → UI update: [...]  

---

## Error Handling Strategy

- Validation errors:
  ```json
  { "errors": { "field": "message" } }
````

* System errors:

  * return generic message
  * log internally

* UI handling:

  * field errors → inline
  * system errors → toast/alert

---

## Data Ownership

* Source of truth: Backend API
* Frontend state: derived from API
* Cache strategy: [optional]

---

## Performance Considerations

* API response target: <200ms
* Avoid unnecessary full reloads
* Use pagination / lazy loading where needed

---

## Testing Strategy

### Frontend

* Component rendering
* Form validation
* Interaction flow

### Backend

* API validation
* Business logic
* Data persistence

### E2E

* Full user flow (UI → API → DB → UI)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [ ] Code quality gate defined (lint/build/type safety and reuse strategy)
- [ ] Testing strategy defined (automated coverage for changed behavior)
- [ ] UX consistency gate defined (design-guidelines and canonical route alignment)
- [ ] Performance budget defined (p95 target and validation method)
- [ ] Documentation impact captured (`docs/codebase-summary.md`,
      `docs/system-architecture.md`, `docs/project-roadmap.md`)
---

## Risks / Trade-offs

* [Risk]
* [Decision]

---

## Changelog

| Version | Date   | Updated By  | Change Summary              |
| ------- | ------ | ----------- | --------------------------- |
| v1.0.0  | [DATE] | [NAME/ROLE] | Initial implementation plan |

---
