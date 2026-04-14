# Feature Specification: Atelier List

## Metadata

- **Name**: Atelier List
- **Last Updated**: 2026-04-14
- **Updated By**: OpenCode Agent
- **Version**: v1.0.4

**Feature Branch**: `005-atelier-list`  
**Created**: 2026-04-14  
**Status**: Draft  
**Input**: User description: "build atelier-list to show all category. Ech category has name, icon, limit for specified month, keep limit for next mont and over-expense warning at specfied percentage"

---

## Summary

This feature defines a read-focused Atelier category list that shows every category with its key monthly control settings: name, icon, limit, next-month carry-forward behavior, and warning threshold. It helps users review budget controls quickly for the selected month and catch at-risk categories before overspending. The goal is to make budget governance visible and actionable in one place without including category create or update flows.

## Clarifications

### Session 2026-04-14

- Q: How should carry-forward be represented in list rows? -> A: Show carry-forward as derived outcome: true when next month snapshot keeps the same limit as current month, false otherwise.
- Q: What defaults apply when selected-month settings are missing? -> A: Use defaults limit=0, carry-forward=false, warningEnabled=true, warnAt=80.
- Q: Which timezone defines selected month boundaries? -> A: Use user profile timezone, with app default fallback when missing.
- Q: What is the canonical row ordering for list stability? -> A: Sort by category name A-Z, tie-break by category ID.
- Q: How should pending status be presented in-row? -> A: Show explicit text label "Pending data" and keep row visible.

---

## System Scope

- **Feature Type**: Fullstack
- **UI Required**: Yes
- **Backend Required**: Yes
- **Primary Users**: End users managing personal spending categories

---

## Design References *(mandatory when UI is in scope)*

- **Design Source**: Stitch
- **Project**: Expense Analytics & Limits (ID: 5432030685985881682)
- **Design Assets Root**: `specs/005-atelier-list/assets/`

### Screen Catalog

#### Screen 1: Atelier List

**Design Reference**
- Source: Stitch
- Screen ID: 3115724136774fe4a1b628580d8d3383
- Screenshot: `./assets/atelier-list.png`
- HTML Export: `./assets/atelier-list.html`
- Notes: Screen title in Stitch is "Fiscal Atelier (Period Dropdown)" and this screen is the source of truth for list layout.

**Purpose**
- Present all categories with monthly limit configuration and spend-risk status in one scannable list.

**Description**
- User sees all categories with category name, icon, selected-month limit, carry-forward flag, warning percentage, and current spend status.
- User can change month context and immediately see month-specific values and statuses.

---

### Design Rules
- UI implementation MUST follow the provided design assets for layout and component structure.
- Do NOT invent new layouts or interactions unless explicitly required by a functional requirement.
- If the design asset conflicts with functional requirements, the functional requirements win and the mismatch must be documented.

---

## UI Flow Summary *(mandatory when UI is in scope)*

User opens Atelier list  
→ sees all categories and their selected-month settings  
→ optionally changes month context  
→ list refreshes to selected-month values  
→ user scans at-risk and overspent indicators  
→ user decides follow-up actions outside this feature scope

---

## UI / UX Requirements *(mandatory when UI is in scope)*

### Screens / Pages
- Atelier category list page

### Components
- Category list/grid
- Month selector
- Limit progress and warning status indicator
- Empty-state panel for no categories

### User Interactions
- click
- navigate
- select
- filter

### UI States
- loading
- error
- empty
- disabled

### Transitions
- Atelier category list page → Atelier category list page (new month context):
  - Trigger: month selection change
  - Type: in-page refresh

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Review All Category Limits (Priority: P1)

As a budget-conscious user, I want one Atelier list showing all categories and their monthly controls so I can quickly understand my budget setup.

**Why this priority**: The core request is visibility of all category limit settings in a single view.

**Independent Test**: Seed multiple categories and verify each category row includes name, icon, selected-month limit, carry-forward flag, and warning percentage.

**UI Flow**: Open Atelier page -> view category list -> scan category rows -> change month -> verify displayed values update.

**Related Screens**:
- Atelier Category List

**Acceptance Scenarios**:
1. **Given** categories exist for the user, **When** the user opens Atelier list, **Then** all categories appear with name, icon, monthly limit, carry-forward setting, and warning percentage.
2. **Given** the user changes month context, **When** the list reloads, **Then** each category row reflects values for the selected month.

---

### User Story 2 - Understand Warning Threshold Context (Priority: P2)

As a user, I want to see each category's warning percentage alongside limit and spend status so I can judge risk before overspending.

**Why this priority**: Warning context is needed to interpret at-risk states in the list.

**Independent Test**: Load categories with varied warning percentages and verify each row shows threshold value and corresponding status.

**UI Flow**: Open Atelier list -> inspect warning percentage and spend status per row -> compare categories by risk level.

**Related Screens**:
- Atelier Category List

**Acceptance Scenarios**:
1. **Given** category warning percentages are configured, **When** the user views Atelier list, **Then** each row displays its warning percentage.
2. **Given** categories have different warning settings, **When** the list is loaded, **Then** each row reflects its own threshold instead of a shared default.

---

### User Story 3 - Receive At-Risk and Overspend Signals (Priority: P1)

As a user, I want warning states when spending approaches or exceeds category limits so I can react before budget overruns grow.

**Why this priority**: Warning signals are a direct business value output of the Atelier list.

**Independent Test**: Prepare category spend values below, at, and above configured thresholds and verify status messaging and visual indicators in list rows.

**UI Flow**: Open Atelier list -> system calculates spending ratio per category -> warning or overspend status appears in relevant rows.

**Related Screens**:
- Atelier Category List

**Acceptance Scenarios**:
1. **Given** category spend reaches or exceeds warning threshold but remains within limit, **When** the list is viewed, **Then** the row shows an at-risk warning state.
2. **Given** category spend exceeds monthly limit, **When** the list is viewed, **Then** the row shows an overspent state with clear emphasis.

---

## Edge Cases

- Category list has no records for the user.
- Selected month has no spending yet but category limits exist.
- Warning percentage is set to boundary values (1% and 100%).
- Category data exists but one row is missing warning threshold value for the selected month.
- Partial data load occurs where category metadata loads but spend totals are delayed.

---

## Requirements *(mandatory)*

### Functional Requirements

#### Business Rules
- **FR-001**: Atelier list must display all categories owned by the current user.
- **FR-002**: Each listed category must show name, icon, selected-month limit, carry-forward setting, and warning percentage.
- **FR-003**: Warning state must trigger when spend reaches or exceeds the configured warning percentage of the selected-month limit.
- **FR-004**: Overspent state must trigger when spend is greater than the selected-month limit.
- **FR-005**: Carry-forward setting shown in the list must be derived from snapshot outcome: true when the next-month snapshot limit equals the selected-month limit for the same category, otherwise false.

#### Permissions
- **FR-006**: Users must only view their own categories and monthly limit settings.

#### System Behavior
- **FR-007**: Changing month context must refresh category rows to show that month values and spend status.
- **FR-007**: Changing month context must refresh category rows to show that month values and spend status, where month boundaries are resolved using user profile timezone (fallback to app default timezone).
- **FR-008**: If monthly settings do not yet exist for a selected month, the list must show defaults `limit=0`, `carry-forward=false`, `warningEnabled=true`, `warnAt=80`, plus a non-blocking message.
- **FR-009**: Category rows must remain readable and ordered consistently across refreshes.
- **FR-009**: Category rows must remain readable and ordered consistently across refreshes using canonical ordering by category name (A-Z), with category ID as tie-breaker.

#### Error Handling
- **FR-010**: If category list loading fails, the UI must show a recoverable error state with retry action.
- **FR-011**: If spend status calculation data is delayed or partial, the UI must display available row data and mark unavailable status as pending.
- **FR-011**: If spend status calculation data is delayed or partial, the UI must display available row data, keep the row visible, and show explicit status label `Pending data`.

---

## API-Relevant Behaviors

- UI requests category list data when the user opens Atelier or changes month context.
- Backend returns complete category row data needed for list rendering in a selected month.
- List operations enforce user-level data isolation.

---

## Non-Functional Requirements *(mandatory)*

- **NFR-001 (Quality)**: Feature behavior must align with existing repository standards and current Atelier domain conventions.
- **NFR-002 (Testing)**: Functional behavior must be covered by repeatable tests for list display, month switching, warning-state thresholds, and carry-forward visibility.
- **NFR-003 (UX Consistency)**: UI layout and interaction patterns must align with approved design references and existing navigation conventions.
- **NFR-004 (Performance)**: In normal conditions, loading or refreshing the category list for a selected month should complete within 2 seconds for at least 95% of attempts.
- **NFR-005 (Accessibility)**: Warning and overspent statuses must be understandable without relying on color alone and must remain keyboard navigable.

---

## Key Entities *(include if feature involves data)*

- **Category Budget Profile**: A user-defined spending category with identity attributes (name and icon) and budget-control settings.
- **Category Monthly Limit Snapshot**: The month-specific limit amount for a category, including carry-forward outcome for next month.
- **Category Warning Rule**: The configured warning percentage used to mark a category as at-risk before overspending.
- **Category Spend Status**: The calculated state for a selected month (normal, at-risk, overspent) based on actual spend versus configured limits.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of categories visible to a user are shown in Atelier list with all required attributes (name, icon, monthly limit, carry-forward setting, warning percentage).
- **SC-002**: At least 95% of users can locate and verify a category's monthly limit settings within 30 seconds during usability testing.
- **SC-003**: 100% of category rows in the selected month show either a computed spend status or explicit text `Pending data` when status inputs are incomplete.
- **SC-004**: 100% of categories whose spending crosses configured warning or overspend thresholds show the correct status in the selected month view.
- **SC-005**: At least 90% of users report that budget warning information is clear enough to decide whether action is needed.

---

## Assumptions

- The feature applies to authenticated end users in the existing personal finance workspace.
- Category controls are managed per month, with current month selected by default when opening Atelier.
- Month boundaries use user profile timezone; if missing, the app default timezone applies.
- Warning threshold behavior is percentage-based against the selected-month limit.
- Carry-forward, when enabled, applies only to next month limit initialization and does not alter historical months.
- Existing Atelier list design assets are sufficient for implementation without adding new screens.

---

## Out of Scope *(optional but recommended)*

- Creating new categories.
- Updating category settings.
- Push/email/in-app notification delivery channels for budget warnings.
- Multi-user/shared-budget workflows.
- Automatic creation of new categories from transaction import flows.
- Cross-currency category limits within the same user account.

---

## Changelog

| Version | Date | Updated By | Change Summary |
|---------|------|------------|----------------|
| v1.0.0 | 2026-04-14 | OpenCode Agent | Initial Atelier category limits list specification drafted from user request and existing repository design references. |
| v1.0.1 | 2026-04-14 | OpenCode Agent | Narrowed scope to Atelier list-only behavior and removed create/update flows from stories, requirements, and API behavior. |
| v1.0.2 | 2026-04-14 | OpenCode Agent | Updated design references to explicit Stitch atelier-list screen and linked downloaded assets. |
| v1.0.3 | 2026-04-14 | OpenCode Agent | Renamed feature to atelier-list and updated branch/folder references. |
| v1.0.4 | 2026-04-14 | OpenCode Agent | Added clarification decisions for carry-forward derivation, missing-month defaults, timezone, ordering, and pending status label. |
