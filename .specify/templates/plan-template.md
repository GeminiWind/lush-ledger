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
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── [endpoint-name].md
│   └── [endpoint-name].md          
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->
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
tests/
├── contract/
├── integration/
└── unit/
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

---

## Data Model
Detailed data definitions live in `data-model.md`.

Primary entities:
- <Entity A>
- <Entity B>


## Data Model Output Format

The data model must be generated in `data-model.md` using the following structure:

```txt
# Data Model: <Feature Name>

## <Entity Name>

### Purpose

### Fields
- <field>: <type> - <description>

### Constraints
- <rule>

### Relationships
- <relation if any>

### Lifecycle (optional)
- <state transitions if any>
```

## Contracts
Detailed API contracts live in `contracts/`.

Primary contracts:
- [METHOD] /api/<resource>
- [METHOD] /api/<resource>/<id>


## API Contracts Output Format

Each API contract must be generated as a separate file in `contracts/` using the following structure:

File naming:
- <method>-<resource>.md (e.g., post-products.md)

Template:

`````txt
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

## Success Response

```json
{
  "id": "uuid",
  "name": "Product A",
  "price": 100,
  "status": "draft",
  "created_at": "timestamp"
}
```

## Error Response

```json
{
  "errors": {
    "name": "Required",
    "price": "Must be greater than 0"
  }
}
```

## Related Functional Requirements

* FR-001
* FR-002
* FR-004

`````

## UI Implementation Plan

### Pages

* [Page A]

### Components

* [Component A]
* [Component B]

### State Management

* local state / global store

### User Interaction Flow

* User clicks [action]
* UI shows [component]
* User inputs data
* Submit triggers [API call] (e.g POST /api/products)
* Handle loading / error / success

### UI States

* loading: disable interaction / show spinner
* error: display message
* success: update UI / close modal / redirect

### Data Fetching

* Initial load
* Refresh after mutation

---

## Backend Implementation Plan

* Define API routes
* Implement validation (FR-xxx)
* Implement business rules
* Implement permission checks
* Persist data to database
* Return structured responses
* Handle errors consistently

---
## UI ↔ API Mapping

### Page Load

- Product Dashboard load
  → GET /api/products  
  → Purpose: fetch product list  
  → UI update: render ProductList  

---

### Create Product Flow

- Click "Create Product" button  
  → No API call  
  → UI update: open ProductFormModal  

- Submit Create Product form  
  → POST /api/products  
  → Payload: { name, price, status }  
  → Success:
    - close modal
    - refresh product list (GET /api/products)
  → Error:
    - show validation errors inline  

---

### Update Product (if applicable)

- Click "Edit Product"  
  → No API call  
  → UI update: open edit form  

- Submit update form  
  → PUT /api/products/:id  
  → Success:
    - update item in list
  → Error:
    - show error message  

---

### Delete Product (if applicable)

- Click "Delete Product"  
  → DELETE /api/products/:id  
  → Success:
    - remove item from list  
  → Error:
    - show error notification  

---

### Error Handling Mapping

- Validation errors  
  → map to form fields  

- System errors  
  → show toast / alert  

---

### Loading States

- API request pending  
  → disable submit button  
  → show spinner  

---

### Notes

- All API responses must follow defined contract format  
- All mutations must trigger UI update or data refetch  

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

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [ ] Code quality gate defined (lint/build/type safety and reuse strategy)
- [ ] Testing strategy defined (automated coverage for changed behavior)
- [ ] UX consistency gate defined (design-guidelines and canonical route alignment)
- [ ] Performance budget defined (p95 target and validation method)
- [ ] Documentation impact captured (`docs/codebase-summary.md`,
      `docs/system-architecture.md`, `docs/project-roadmap.md`)

## Risks / Trade-offs
- [Risk]
- [Decision]

## Changelog

| Version | Date | Updated By | Change Summary |
|---------|------|------------|----------------|
| v1.0.0 | [DATE] | [NAME/ROLE] | Initial implementation plan generated from template. |

