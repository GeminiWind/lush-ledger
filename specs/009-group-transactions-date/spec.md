# Feature Specification: Ledger Transaction Display Groups

## Metadata

- **Name**: Ledger Transaction Display Groups
- **Last Updated**: 2026-05-04
- **Updated By**: OpenCode (AI Agent)
- **Version**: v1.0.6

**Feature Branch**: `009-group-transactions-date`  
**Created**: 2026-05-04  
**Status**: Draft  
**Input**: User description: "show list of transactions to show today yesterday and the past"

---

## Summary

This feature updates the ledger activity UI so users can immediately see transactions grouped by recency on page load. The required workflow is: user opens ledger page and sees date headers for Today, Yesterday, and older calendar dates. Date headers are rendered using the user's locale.

## Clarifications

### Session 2026-05-04

- Q: Should "All Remaining Transactions" be a nested parent section or flat date headers? -> A: Flat date headers for all groups: Today, Yesterday, then calendar dates (for example May 3rd).
- Q: Should date headers use locale formatting or fixed English format? -> A: Use user-locale date formatting.

---

## System Scope

- **Feature Type**: Frontend-only
- **UI Required**: Yes
- **Backend Required**: No
- **Primary Users**: End user

---

## Design References *(mandatory when UI is in scope)*

- **Design Source**: Stitch
- **Project**: Expense Analytics & Limits (`5432030685985881682`)
- **Design Assets Root**: `specs/009-group-transactions-date/assets/`

### Screen Catalog

#### Screen 1: Transaction Ledger (No Budgets)

**Design Reference**
- Source: Stitch
- Screen ID: `8707857d0f4d46f4ad60b4f31b10a2b7`
- Screenshot: `./assets/transaction-ledger-no-budgets.png`
- HTML Export: `./assets/transaction-ledger-no-budgets.html`
- Notes: Assets are downloaded from Stitch hosted URLs using `curl -L`.

**Purpose**
- Present transaction activity in a clean ledger view with clear day-group headings.

**Description**
- User lands on ledger activity page and sees transactions grouped by recent day buckets.
- Section headings are prominent and separated visually for quick scanning.

---

### Design Rules
- UI implementation MUST follow the referenced Stitch screen structure and interaction style.
- Do NOT introduce unrelated layout changes outside transaction list display grouping.
- If existing app patterns conflict with Stitch visuals, functional requirements win and mismatch must be documented.

---

## UI Flow Summary *(mandatory when UI is in scope)*

User opens Ledger page  
-> transaction list loads  
-> UI groups entries into flat date headers: Today, Yesterday, then locale-formatted calendar dates for older entries  
-> user scans the sections from most recent to older  
-> user can still use existing ledger filters and actions

---

## UI / UX Requirements *(mandatory when UI is in scope)*

### Screens / Pages
- Ledger activity page (`/app/ledger`)

### Components
- Transaction list
- Date group headers
- Transaction row cards
- Empty-state message

### User Interactions
- navigate
- scroll
- filter
- search
- edit/delete row actions (existing behavior preserved)

### UI States
- loading
- error
- empty
- success

### Transitions
- Ledger route -> grouped ledger list:
  - Trigger: route load
  - Type: inline render

- Filter/search update -> regrouped ledger list:
  - Trigger: apply filters or search query
  - Type: UI refresh

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View today's transactions first (Priority: P1)

As an end user, when I open the ledger page I can immediately see my Today transactions at the top.

**Why this priority**: This is the primary user outcome and the first section expected in workflow.

**Independent Test**: Open ledger with at least one transaction dated today and verify it appears under Today.

**UI Flow**: Open ledger -> Today section renders first -> user reviews recent entries.

**Related Screens**:
- Ledger activity page

**Acceptance Scenarios**:
1. **Given** the user has one or more transactions dated today, **When** they open the ledger page, **Then** those transactions appear under a "Today" section.
2. **Given** both today and older transactions exist, **When** the page renders, **Then** the Today section appears before all other date groups.

---

### User Story 2 - View yesterday's transactions (Priority: P2)

As an end user, I can see yesterday's transactions under a separate section so I can compare recent spending day by day.

**Why this priority**: Yesterday is part of the required workflow and supports quick recency review.

**Independent Test**: Open ledger with yesterday transactions and verify they appear under Yesterday.

**UI Flow**: Open ledger -> scroll below Today -> view Yesterday section.

**Related Screens**:
- Ledger activity page

**Acceptance Scenarios**:
1. **Given** the user has one or more transactions dated yesterday, **When** they open the ledger page, **Then** those transactions appear under a "Yesterday" section.

---

### User Story 3 - View older transactions by date (Priority: P3)

As an end user, I can see all transactions older than yesterday under direct calendar date headers (for example 30 April, 29 April), so historical activity remains easy to scan.

**Why this priority**: The workflow explicitly requires visibility for all remaining transactions beyond yesterday while preserving date-level readability.

**Independent Test**: Open ledger with transactions older than yesterday and verify they appear under direct calendar date headers after Today and Yesterday.

**UI Flow**: Open ledger -> scroll past Today and Yesterday -> view older entries grouped by date labels.

**Related Screens**:
- Ledger activity page

**Acceptance Scenarios**:
1. **Given** the user has one or more transactions older than yesterday, **When** they open the ledger page, **Then** those transactions appear under direct date labels (for example "30 April", "29 April").
2. **Given** no transactions exist for one of the three sections, **When** the page renders, **Then** the empty section is hidden and other populated sections remain visible.

---

## Edge Cases

- What happens when only one of Today, Yesterday, or a specific older date has transactions?
- What happens when there are no transactions for all three sections?
- What happens when a user keeps the page open across midnight and section membership changes?
- What happens when filtered results remove all entries from one or more sections?
- What happens when a transaction has an invalid or missing date?

---

## Requirements *(mandatory)*

### Functional Requirements

#### Validation Rules
- **FR-001**: Each rendered transaction must include a usable date value for day-bucket assignment.
- **FR-002**: Transactions with invalid date values must not be shown under incorrect day headers.

#### Business Rules
- **FR-003**: Ledger UI must display flat date headers with Today first, Yesterday second, then older calendar dates.
- **FR-004**: Older transactions must appear under direct calendar date headers and not inside a nested parent section.
- **FR-005**: Frontend is responsible for deriving date-header grouping from transaction date values.
- **FR-006**: Existing ledger actions (search/filter/export/edit/delete) must remain available after UI grouping update.
- **FR-013**: Calendar date headers for older entries must be formatted using the authenticated user's locale.

#### Permissions
- **FR-007**: Users can only view their own transaction data in grouped UI sections.

#### System Behavior
- **FR-008**: Grouping must be recalculated whenever the visible transaction list changes (for example via filter/search refresh).
- **FR-009**: Empty groups should be hidden to reduce visual noise.
- **FR-010**: If no transactions match current criteria, UI must show a clear empty state.

#### Error Handling
- **FR-011**: If transaction data fails to load, UI must show an error state instead of incomplete grouping.
- **FR-012**: Group labels and list rendering must remain stable under partial refresh or retry behavior.

---

## API-Relevant Behaviors

- Client receives transaction records with date values.
- Frontend performs grouping into date headers: Today, Yesterday, then calendar dates.
- No additional backend grouping contract is required for this feature.

---

## Non-Functional Requirements *(mandatory)*

- **NFR-001 (Code Quality)**: Change MUST pass lint and build gates and follow existing repository patterns.
- **NFR-002 (Testing)**: Change MUST define automated test coverage for grouped rendering and empty/error states.
- **NFR-003 (UX Consistency)**: Ledger activity page MUST align with the referenced Stitch screen for transaction list presentation.
- **NFR-004 (Performance)**: Grouped list should render within 2 seconds for typical monthly user transaction volume.
- **NFR-005 (Accessibility)**: Date group headers must remain readable and navigable by assistive technologies.

---

## Key Entities *(include if feature involves data)*

- **Transaction**: User-owned ledger entry including date, amount, type, account, category, and optional notes.
- **Display Group**: UI-only date header label (Today, Yesterday, or locale-formatted calendar date) derived from transaction date.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In acceptance testing, 100% of transactions dated today are displayed under Today.
- **SC-002**: In acceptance testing, 100% of transactions dated yesterday are displayed under Yesterday.
- **SC-003**: In acceptance testing, 100% of transactions older than yesterday are displayed under the correct calendar date header.
- **SC-004**: At least 90% of users can identify entries in Today, Yesterday, and older date headers within 15 seconds on first view.
- **SC-005**: In acceptance testing, 100% of older date headers are rendered in the authenticated user's locale format.

---

## Assumptions

- The ledger page already has access to transaction date values needed for frontend grouping.
- Grouping behavior is scoped to UI display and does not require backend endpoint changes.
- Existing filters and transaction actions remain unchanged in function.
- Stitch assets downloaded to `specs/009-group-transactions-date/assets/` are the source of truth for visual reference.

---

## Out of Scope *(optional but recommended)*

- Changing non-ledger routes or non-ledger page IA.
- Reworking non-transaction ledger layout areas unrelated to day-grouped display.
- Introducing new API endpoints or changing transaction data model.
- Adding new transaction mutation capabilities.

---

## Changelog

| Version | Date | Updated By | Change Summary |
|---------|------|------------|----------------|
| v1.0.6 | 2026-05-04 | OpenCode (AI Agent) | Clarified locale-formatted date headers for all older calendar-date groups. |
| v1.0.5 | 2026-05-04 | OpenCode (AI Agent) | Clarified flat date-header model: Today, Yesterday, then calendar dates (no nested remaining section). |
| v1.0.4 | 2026-05-04 | OpenCode (AI Agent) | Clarified US3: remaining transactions stay grouped by explicit calendar dates. |
| v1.0.3 | 2026-05-04 | OpenCode (AI Agent) | Updated grouping scope to Today, Yesterday, and All Remaining Transactions. |
| v1.0.2 | 2026-05-04 | OpenCode (AI Agent) | Updated spec to UI-focused transaction display using Stitch references and Today/Yesterday/2 Days Ago workflow. |
| v1.0.1 | 2026-05-04 | OpenCode (AI Agent) | Narrowed scope to transaction listing only; frontend handles date grouping. |
| v1.0.0 | 2026-05-04 | OpenCode (AI Agent) | Initial spec draft for date-grouped transaction list. |
