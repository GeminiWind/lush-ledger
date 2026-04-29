# Feature Specification: Atelier Delete Category

## Metadata

- **Name**: Atelier Delete Category
- **Last Updated**: 2026-04-24
- **Updated By**: OpenCode Agent
- **Version**: v1.0.0

**Feature Branch**: `008-delete-category`  
**Created**: 2026-04-24  
**Status**: Draft  
**Input**: User description: "implement delete category feature"

---

## Summary

This feature allows users to delete an existing category from the Atelier category list through a confirmation dialog. It ensures deletion is intentional, prevents accidental loss through cancel-safe behavior, and keeps related spending records usable after deletion. The goal is to make category cleanup quick while preserving data continuity for financial history.

---

## Clarifications

### Session 2026-04-29

- Q: How should historical transactions be handled after category deletion? → A: Reassign transactions to a system "Uncategorized" category.
- Q: Should category deletion be soft or hard delete? → A: Soft delete with `deletedAt`, hidden from active list.
- Q: What response should be returned when deleting an already deleted or non-existent category? → A: Return `404 Not Found`.

---

## System Scope

- **Feature Type**: Fullstack
- **UI Required**: Yes
- **Backend Required**: Yes
- **Primary Users**: Authenticated end users managing personal spending categories

---

## Design References *(mandatory when UI is in scope)*

- **Design Source**: Other (existing Atelier interaction patterns)
- **Project**: Lush Ledger Atelier (existing in-product patterns)
- **Design Assets Root**: `specs/008-delete-category/assets/`

### Screen Catalog

#### Screen 1: Atelier Category List (Delete Entry Point)

**Design Reference**
- Source: Stitch (existing Atelier list reference)
- Screen ID: `3115724136774fe4a1b628580d8d3383`
- Screenshot: `../005-atelier-list/assets/atelier-list.png`
- HTML Export: `../005-atelier-list/assets/atelier-list.html`
- Notes: Reuse existing row action placement and hierarchy for the delete trigger.

**Purpose**
- Let users initiate category deletion from the same list where categories are managed.

**Description**
- User sees a delete action on each eligible category row.
- Trigger is available without navigating away from Atelier.

---

#### Screen 2: Delete Category Confirmation Dialog

**Design Reference**
- Source: Stitch (Expense Analytics & Limits)
- Screen ID: `a32d33272b0346cbab9240b48260dacf`
- Screenshot: `./assets/delete-category-modal-stitch.png`
- HTML Export: `./assets/delete-category-modal-stitch.html`
- Notes: Use this Stitch modal as the primary visual/layout source for destructive-action hierarchy and copy tone.

**Purpose**
- Require explicit user confirmation before removing a category from the active Atelier list.

**Description**
- Dialog shows category identity, deletion consequence summary, and Cancel/Delete actions.
- Dialog supports close button, outside click, and keyboard escape when no submit is in progress.

### Design Rules
- UI implementation MUST follow the provided design assets for layout and component structure.
- Do NOT invent new layouts or interactions unless explicitly required by a functional requirement.
- If the design asset conflicts with functional requirements, the functional requirements win and the mismatch must be documented.

---

## UI Flow Summary *(mandatory when UI is in scope)*

User opens Atelier list  
→ identifies a category no longer needed  
→ clicks delete action on that category row  
→ Delete Category confirmation dialog opens  
→ user reviews message and either cancels or confirms  
→ on success: dialog closes and category no longer appears in the list  
→ on failure: dialog remains open and shows a clear recoverable error

---

## UI / UX Requirements *(mandatory when UI is in scope)*

### Screens / Pages
- Atelier category list page
- Delete Category confirmation dialog

### Components
- Category row delete trigger
- Confirmation dialog shell
- Consequence/help text block
- Primary destructive action and secondary cancel action
- Inline/global error messaging area

### User Interactions
- click delete action
- open confirmation dialog
- confirm delete
- cancel delete
- dismiss dialog via close, outside click, or escape key

### UI States
- idle
- confirming
- deleting (in progress)
- delete success (dialog close + list refresh)
- delete failure (dialog remains open)
- disabled action while request is pending

### Transitions
- Atelier category list page → Delete Category confirmation dialog:
  - Trigger: click category delete action
  - Type: modal open

- Delete Category confirmation dialog → Atelier category list page:
  - Trigger: successful delete, cancel, close action, outside click, or escape key
  - Type: modal close with conditional list refresh

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Delete an Existing Category (Priority: P1)

As an end user, I can delete a category I no longer use so my Atelier list stays relevant and easier to manage.

**Why this priority**: Deletion is the primary requested business outcome.

**Independent Test**: From Atelier list, open delete dialog for one category, confirm deletion, and verify the category is removed from list results.

**UI Flow**: Atelier list -> click delete on row -> confirmation dialog -> confirm delete -> success close -> list updates without deleted category.

**Related Screens**:
- Atelier category list page
- Delete Category confirmation dialog

**Acceptance Scenarios**:
1. **Given** the user has at least one category, **When** the user confirms delete for a category, **Then** that category is removed from the user-visible Atelier list.
2. **Given** deletion succeeds, **When** the dialog closes, **Then** the user remains in Atelier context and can continue managing remaining categories.

---

### User Story 2 - Prevent Accidental Deletion (Priority: P1)

As an end user, I need a clear confirmation step so I do not remove categories by mistake.

**Why this priority**: Deletion is destructive and requires explicit intent verification.

**Independent Test**: Open delete dialog and cancel through each supported dismissal path; verify no category is removed.

**UI Flow**: Atelier list -> open delete dialog -> cancel/close/escape/outside click -> return to unchanged list.

**Related Screens**:
- Atelier category list page
- Delete Category confirmation dialog

**Acceptance Scenarios**:
1. **Given** a delete dialog is open, **When** the user selects cancel, **Then** the dialog closes and no deletion occurs.
2. **Given** a delete dialog is open, **When** the user dismisses via close button, outside click, or escape key, **Then** the dialog closes and no deletion occurs.

---

### User Story 3 - Preserve Transaction Continuity (Priority: P2)

As an end user, I need existing transactions to remain usable after category deletion so historical records are not broken.

**Why this priority**: Data continuity protects trust in reporting and ledger history.

**Independent Test**: Delete a category that is referenced by transactions, then verify those transactions still appear and no longer depend on the deleted category.

**UI Flow**: Open delete dialog for in-use category -> confirm delete -> system updates linked records -> dialog closes -> history remains viewable.

**Related Screens**:
- Delete Category confirmation dialog
- Atelier category list page

**Acceptance Scenarios**:
1. **Given** a category is referenced by existing transactions, **When** deletion is confirmed, **Then** transactions remain accessible and are no longer linked to the deleted category.

---

## Edge Cases

- User attempts to delete a category that was already removed in another session.
- User triggers delete while a previous delete request for the same category is still in progress.
- User loses network connection during delete confirmation.
- User tries to delete a category outside their ownership scope.
- Category has historical transactions and must be removed without breaking transaction visibility.

---

## Requirements *(mandatory)*

### Functional Requirements

#### Validation Rules
- **FR-001**: Delete confirmation must require explicit user action in the confirmation dialog before category removal is attempted.
- **FR-002**: Delete requests must include a valid target category identifier.

#### Business Rules
- **FR-003**: Deleting a category must soft-delete it by setting `deletedAt` and removing it from the user's active category list.
- **FR-004**: If the deleted category is referenced by existing transactions, those transactions must remain retained and must be reassigned to a system "Uncategorized" category.
- **FR-005**: Deleting one category must not modify unrelated categories.

#### Permissions
- **FR-006**: Only authenticated users can delete categories.
- **FR-007**: Users can delete only categories they own.

#### System Behavior
- **FR-008**: Triggering delete from a category row must open a confirmation dialog for that specific category.
- **FR-009**: While deletion is in progress, repeat delete submissions for that category must be prevented.
- **FR-010**: On successful deletion, the dialog must close and the Atelier category list must refresh to reflect removal.
- **FR-011**: If the user cancels or dismisses the dialog, no deletion attempt is executed.

#### Error Handling
- **FR-012**: If the category does not exist at delete time (including already soft-deleted), the system must return `404 Not Found` and keep the UI consistent.
- **FR-013**: If deletion fails due to temporary issues, the user must see a clear retryable error message without unintended data changes.
- **FR-014**: Validation and business rule failures must return structured error information that can be displayed in the dialog.

---

## API-Relevant Behaviors

- UI sends a delete request for a specific category when user confirms in the dialog.
- Backend validates ownership and category existence before applying deletion.
- Successful deletion returns a success response that allows list-state refresh.
- If category deletion affects linked transaction records, response still indicates successful category removal while preserving transaction accessibility.
- Linked transactions are reassigned to the system "Uncategorized" category during successful deletion.
- Failed deletions return structured error information usable by the confirmation dialog.
- Deleting an already deleted or non-existent category returns `404 Not Found` with structured error information.

---

## Non-Functional Requirements *(mandatory)*

- **NFR-001 (Code Quality)**: Changes must follow existing repository patterns and pass established quality gates.
- **NFR-002 (Testing)**: Automated coverage must verify success path, cancellation path, ownership protection, and failure handling.
- **NFR-003 (UX Consistency)**: Confirmation dialog behavior and hierarchy must align with existing destructive-action patterns in the product.
- **NFR-004 (Performance)**: Under normal conditions, users must see visible success or failure feedback within 2 seconds after confirming deletion.
- **NFR-005 (Accessibility)**: Confirmation dialog must be keyboard operable, keep visible focus, and support accessible labels for destructive and cancel actions.

---

## Key Entities *(include if feature involves data)*

- **Category**: User-owned spending classification that can be removed when no longer needed.
- **Category** has lifecycle states: active, soft-deleted (`deletedAt` set).
- **Transaction**: Historical money movement record that may have previously referenced a category and must remain intact after category deletion.
- **Uncategorized Category**: System-managed fallback category used when deleted categories had linked transactions.
- **Delete Category Attempt**: A user-confirmed action event with outcome states (success, validation failure, not-found, or transient failure).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 95% of valid category deletion attempts complete successfully on first confirmation under normal conditions.
- **SC-002**: 100% of cancellation and dismiss flows result in zero category deletions.
- **SC-003**: 100% of tested deletions for categories with historical transactions preserve transaction visibility after deletion.
- **SC-004**: In moderated usability checks, at least 90% of users correctly identify and complete or cancel the delete action without facilitator guidance.

---

## Assumptions

- Deletion is initiated from the existing Atelier category list row actions.
- Each delete action targets one category at a time.
- Historical transactions should remain stored and accessible even if their previous category is removed.
- Existing authentication and user data-isolation behavior applies to delete operations.
- Existing modal behavior conventions (outside click and escape dismissal) are retained for this dialog.

---

## Out of Scope *(optional but recommended)*

- Bulk deletion of multiple categories in one action.
- Undo/restore workflow after deletion.
- Editing category fields as part of delete flow.
- Reworking non-category areas of Atelier.

---

## Changelog

| Version | Date | Updated By | Change Summary |
|---------|------|------------|----------------|
| v1.0.0 | 2026-04-24 | OpenCode Agent | Initial specification for Atelier category deletion flow with confirmation, data continuity, and acceptance criteria. |
