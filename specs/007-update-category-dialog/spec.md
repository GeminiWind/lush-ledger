# Feature Specification: Atelier Category Update Dialog

## Metadata

- **Name**: Atelier Category Update Dialog
- **Last Updated**: 2026-04-15
- **Updated By**: OpenCode Agent
- **Version**: v1.0.0

**Feature Branch**: `007-update-category-dialog`  
**Created**: 2026-04-15  
**Status**: Draft  
**Input**: User description: "atelier-category update. Update category from atelier list, when click icon Edit it show modal EditCategoryDialog, populate current data of category and click Update Category."

---

## Summary

This feature allows users to update an existing spending category directly from the Atelier list by clicking an edit icon and using an edit dialog. The dialog opens with the category's current values, lets users modify allowed fields, and saves changes with clear success or error feedback. This reduces friction for budget maintenance and improves confidence that category limits and warnings stay accurate.

---

## Clarifications

### Session 2026-04-15

- Q: Should updated category names be unique per user, and if so how should case sensitivity be handled? -> A: Unique per user, case-insensitive, excluding the currently edited category.
- Q: When over-expense warning is disabled, what should happen to the existing warning threshold value? -> A: Preserve the threshold value but ignore it while warning is disabled.

---

## System Scope

- **Feature Type**: Fullstack
- **UI Required**: Yes
- **Backend Required**: Yes
- **Primary Users**: End users managing personal finance categories

---

## Design References *(mandatory when UI is in scope)*

- **Design Source**: Stitch
- **Project**: Expense Analytics & Limits (5432030685985881682)
- **Design Assets Root**: `specs/007-update-category-dialog/assets/`

### Screen Catalog

#### Screen 1: Edit Category Dialog (Update Category Modal)

**Design Reference**
- Source: Stitch
- Screen ID: `f062b702986a4603b23b4f1c9badc222`
- Screenshot: `./assets/update-category-modal.png`
- HTML Export: `./assets/update-category-modal.html`
- Notes: Use this update-category modal as the primary visual reference for edit dialog layout and interaction details.

**Purpose**
- Allow users to edit an existing category without leaving the Atelier list context.

**Description**
- A modal includes fields for category name, monthly spending limit, warning toggle, warning threshold, icon selection grid, and cancel/update actions.
- The modal appears over the Atelier list and preserves the visual hierarchy from the provided Stitch reference.

### Design Rules
- UI implementation MUST follow the provided design assets for layout and component structure.
- Do NOT invent new layouts or interactions unless explicitly required by a functional requirement.
- If the design asset conflicts with functional requirements, the functional requirements win and the mismatch must be documented.

---

## UI Flow Summary *(mandatory when UI is in scope)*

User opens the Atelier list  
→ identifies a category row  
→ clicks the row edit icon  
→ Edit Category Dialog opens with existing category values prefilled  
→ user changes one or more fields  
→ clicks "Update Category"  
→ system validates input and shows saving state  
→ on success: modal closes and updated values appear in the Atelier list  
→ on validation or save failure: modal stays open and shows actionable error messages

---

## UI / UX Requirements *(mandatory when UI is in scope)*

### Screens / Pages
- Atelier list screen
- Edit Category Dialog modal

### Components
- Category row edit trigger (icon button)
- Modal dialog container with close affordance
- Form fields (text, currency, toggle, percentage)
- Icon selection grid
- Primary/secondary action buttons
- Inline validation and global error messaging

### User Interactions
- click edit icon
- open/close modal
- edit field values
- toggle warning on/off
- select icon
- submit update
- cancel update

### UI States
- initial (prefilled)
- loading/saving
- field validation error
- backend save error
- success (modal closes with refreshed row)
- disabled submit when input is invalid

### Transitions
- Atelier list → Edit Category Dialog:
  - Trigger: user clicks edit icon
  - Type: modal open

- Edit Category Dialog → Atelier list:
  - Trigger: update success, cancel, close button, outside click, or Esc key
  - Type: modal close with conditional list refresh

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Update an Existing Category (Priority: P1)

As a budget owner, I can open an existing category in edit mode, update its values, and save so my monthly planning stays current.

**Why this priority**: This is the core user outcome requested and directly affects everyday budget management.

**Independent Test**: From Atelier list, edit one category, save changes, and verify the updated values are visible in the list and retained on refresh.

**UI Flow**: Atelier list row edit icon click -> prefilled dialog -> update fields -> submit -> success close -> list reflects changes.

**Related Screens**:
- Atelier list screen
- Edit Category Dialog (Update Category Modal)

**Acceptance Scenarios**:
1. **Given** a user has at least one category, **When** the user clicks edit on a row, **Then** the dialog opens with the current category values pre-populated.
2. **Given** valid updated values are entered, **When** the user clicks "Update Category", **Then** the system saves the changes and the Atelier list shows updated category data.

---

### User Story 2 - Handle Validation and Save Failures (Priority: P2)

As a budget owner, I receive clear guidance when input is invalid or a save fails so I can correct the issue without re-entering all data.

**Why this priority**: Error handling is essential for trust and prevents data loss during updates.

**Independent Test**: Submit invalid values and simulated save failures; verify specific errors are shown and user-entered values remain in the dialog.

**UI Flow**: Prefilled dialog -> invalid edit or save failure -> error display -> user correction -> resubmit.

**Related Screens**:
- Edit Category Dialog (Update Category Modal)

**Acceptance Scenarios**:
1. **Given** one or more required/invalid fields, **When** the user submits, **Then** the dialog remains open and shows field-level errors.
2. **Given** a temporary save failure, **When** submit is attempted, **Then** a clear retryable error is shown and form values are preserved.

---

### User Story 3 - Dismiss Without Changes (Priority: P3)

As a budget owner, I can cancel or close editing without changing category data.

**Why this priority**: Safe exit behavior prevents accidental edits and aligns with existing modal conventions.

**Independent Test**: Open edit dialog, modify values, cancel/close, then verify no persisted changes were made.

**UI Flow**: Atelier list -> open edit dialog -> modify fields -> cancel/close -> return to list unchanged.

**Related Screens**:
- Atelier list screen
- Edit Category Dialog (Update Category Modal)

**Acceptance Scenarios**:
1. **Given** unsaved edits in the dialog, **When** the user cancels or closes, **Then** the modal closes and no category data is updated.

---

## Edge Cases

- User opens edit dialog for a category that is deleted before submit.
- User sets warning threshold while warning toggle is disabled.
- User enters non-numeric, zero, or negative monthly limit values.
- User attempts to submit while save is already in progress.
- User loses network connection during save.
- User closes dialog via outside click or Esc after editing but before submit.

---

## Requirements *(mandatory)*

### Functional Requirements

#### Validation Rules
- **FR-001**: Category name must be required and trimmed before validation.
- **FR-002**: Monthly spending limit must be a positive monetary value.
- **FR-003**: Warning threshold must be an integer from 1 to 100 when warning is enabled.
- **FR-004**: Warning threshold input must be disabled in the UI and ignored for validation while warning is disabled.

#### Business Rules
- **FR-005**: The edit dialog must load and display current category data for the selected row before user changes.
- **FR-006**: Updating a category must only modify the selected category record and must not create a new category.
- **FR-007**: Updated category values (name, icon, monthly limit, warning settings) must be reflected in the Atelier list after a successful save.
- **FR-008**: Category names must be unique per user in a case-insensitive comparison, excluding the currently edited category when its normalized name is unchanged.
- **FR-009**: When warning is turned off, the last saved warning threshold value must be preserved for future reuse if warning is re-enabled.

#### Permissions
- **FR-010**: Only authenticated users can update categories.
- **FR-011**: Users can update only categories that belong to their own account.

#### System Behavior
- **FR-012**: Clicking a category edit icon must open `EditCategoryDialog` from the Atelier list context.
- **FR-013**: The primary action label in edit mode must be "Update Category".
- **FR-014**: The dialog must support dismissal via close button, outside click, and Esc key.
- **FR-015**: While update is in progress, submit must prevent duplicate requests.
- **FR-016**: Update submission must not require original category fields and must not use stale-snapshot conflict rejection; valid requests update the selected-month values directly.

#### Error Handling
- **FR-017**: Validation errors must be presented clearly next to relevant fields.
- **FR-018**: Save failures must show a clear message and keep user-edited data in the dialog for retry.
- **FR-019**: If the category no longer exists or is inaccessible at submit time, the user must receive a clear non-success message and the list must remain unchanged.
- **FR-020**: Duplicate-name rejection must show a specific actionable message while preserving user-edited inputs for correction and retry.

---

## API-Relevant Behaviors

- UI sends an update request for a specific category when the user clicks "Update Category".
- Backend validates ownership and update payload fields before applying changes.
- Backend returns the updated category data when the update succeeds.
- Validation failures return field-specific error information for UI display.
- Failed updates preserve dialog state so users can correct and retry without re-entry.

---

## Non-Functional Requirements *(mandatory)*

- **NFR-001 (Code Quality)**: Changes must follow existing repository standards and pass quality gates.
- **NFR-002 (Testing)**: Automated coverage must verify successful update, validation errors, and failed-save behavior.
- **NFR-003 (UX Consistency)**: Modal structure and visual behavior must align with supplied Stitch assets and existing Atelier interaction patterns.
- **NFR-004 (Performance)**: In normal conditions, users receive visible success or error feedback within 2 seconds of submitting an update.
- **NFR-005 (Accessibility)**: Dialog must be keyboard operable, maintain visible focus, expose clear labels, and support Esc/outside-click dismissal.

---

## Key Entities *(include if feature involves data)*

- **Category**: A user-owned spending classification with editable attributes including name, icon, and monthly spending limit.
- **Category Warning Settings**: Per-category warning preference and threshold percentage that determine when users are alerted before overspending.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 95% of valid category update attempts complete successfully on first submit under normal operating conditions.
- **SC-002**: 100% of invalid submissions show clear, field-level guidance without closing the dialog.
- **SC-003**: After a successful update, refreshed category values are visible in the Atelier list within one user interaction cycle (modal close -> list visible).
- **SC-004**: In usability checks, users can complete "open edit -> change value -> save" in under 60 seconds without assistance.

---

## Assumptions

- Category editing is available to signed-in end users who already have at least one category.
- Existing category attributes (name, icon, monthly limit, warning setting, warning threshold) are the only fields in scope for update.
- Existing money formatting conventions remain unchanged for this feature.
- The provided Stitch modal is the visual baseline, adapted for edit semantics (title/action text).
- The Atelier list already provides a visible edit trigger per category row.

---

## Out of Scope *(optional but recommended)*

- Creating new categories.
- Deleting or archiving categories.
- Bulk edit of multiple categories in one action.
- Changes to unrelated Atelier features such as monthly cap configuration.

---

## Changelog

| Version | Date | Updated By | Change Summary |
|---------|------|------------|----------------|
| v1.0.0 | 2026-04-15 | OpenCode Agent | Initial specification for Atelier category update dialog with Stitch design references and acceptance criteria. |
