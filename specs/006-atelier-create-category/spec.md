# Feature Specification: Atelier Create Category

## Metadata

- **Name**: Atelier Create Category
- **Last Updated**: 2026-04-14
- **Updated By**: OpenCode Agent
- **Version**: v1.0.1

**Feature Branch**: `006-atelier-create-category`  
**Created**: 2026-04-14  
**Status**: Draft  
**Input**: User description: "add spec for atelier-create, flow is that from aterlist list screen, there is Add New Category Card, click on it it will show modal then user can fill the information; design screen from Stitch project 5432030685985881682, screen 8030dc0d807d47279166dcb81cbc79b9"

---

## Summary

This feature defines the category creation flow from the Atelier list: user clicks the Add New Category card, a modal opens, user fills category information, and submits to create the category. The feature gives users a fast in-context way to add budget categories without leaving the Atelier workspace. It also standardizes validation, error feedback, and post-create refresh behavior.

---

## Clarifications

### Session 2026-04-14

- Q: What duplicate-name matching scope should the create flow enforce? -> A: Case-insensitive + trim whitespace across all months.
- Q: Which month should new category settings apply to? -> A: Always apply to the real current calendar month, ignoring selected Atelier month.
- Q: What validation error response shape should the API return? -> A: Use field-level `errors` object plus optional top-level `error` for general failures.
- Q: How should duplicate conflict be shown during submit? -> A: Keep modal open, show inline error on category name, and preserve all entered values.

---

## System Scope

- **Feature Type**: Fullstack
- **UI Required**: Yes
- **Backend Required**: Yes
- **Primary Users**: Authenticated end users managing personal spending categories

---

## Design References *(mandatory when UI is in scope)*

- **Design Source**: Stitch
- **Project**: Expense Analytics & Limits (ID: 5432030685985881682)
- **Design Assets Root**: `specs/006-atelier-create-category/assets/`

### Screen Catalog

#### Screen 1: Add Category Modal (Full Icon Grid)

**Design Reference**
- Source: Stitch
- Screen ID: 8030dc0d807d47279166dcb81cbc79b9
- Screenshot: `./assets/add-category-modal-full-icon-grid.png`
- HTML Export: `./assets/add-category-modal-full-icon-grid.html`
- Notes: This screen is the visual source of truth for modal layout, icon selection grid, field hierarchy, and primary/secondary actions.

**Purpose**
- Allow users to create a new category from the Atelier list context without navigating to a separate page.

**Description**
- User sees a modal with category name input, icon picker grid, monthly limit input, carry-forward toggle, over-expense warning toggle, warning percentage input, and Add Category or Discard actions.
- Modal appears as an overlay on top of Atelier context and must be dismissible by close, cancel, outside click, and keyboard escape.

---

#### Screen 2: Atelier List Trigger (Add New Category Card)

**Design Reference**
- Source: Stitch (existing Atelier list asset)
- Screen ID: 3115724136774fe4a1b628580d8d3383
- Screenshot: `../005-atelier-list/assets/atelier-list.png`
- HTML Export: `../005-atelier-list/assets/atelier-list.html`
- Notes: This screen is the source of truth for the Add New Category card visual entry point that launches the create modal.

**Purpose**
- Define where and how users discover and trigger the category creation flow.

**Description**
- User sees Add New Category card in Atelier list and uses this entry to open the create modal.
- Trigger styling, placement, and label should follow this referenced Atelier list asset.

---

### Design Rules
- UI implementation MUST follow the provided design assets for layout and component structure.
- Do NOT invent new layouts or interactions unless explicitly required by a functional requirement.
- If the design asset conflicts with functional requirements, the functional requirements win and the mismatch must be documented.

---

## UI Flow Summary *(mandatory when UI is in scope)*

User opens Atelier list  
→ sees Add New Category card  
→ clicks Add New Category  
→ Add Category modal opens  
→ user fills category information  
→ user submits Add Category  
→ on success: modal closes and Atelier list refreshes with the new category visible  
→ on validation or save failure: modal stays open and shows actionable error feedback

---

## UI / UX Requirements *(mandatory when UI is in scope)*

### Screens / Pages
- Atelier category list page (entry point)
- Add Category modal overlay

### Components
- Add New Category entry card
- Modal dialog shell
- Category name text input
- Icon selection grid
- Monthly limit input
- Keep limit for next month toggle
- Over-expense warning toggle
- Warning threshold percentage input
- Primary submit action and secondary discard action

### User Interactions
- click
- submit
- select
- confirm / cancel

### UI States
- loading
- error
- success
- disabled

### Transitions
- Atelier category list page → Add Category modal overlay:
  - Trigger: click Add New Category card
  - Type: modal open

- Add Category modal overlay → Atelier category list page:
  - Trigger: successful submit, discard, close action, outside click, or escape key
  - Type: modal close and optional list refresh

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a Category From Atelier List (Priority: P1)

As an end user, I want to add a category directly from the Atelier list so I can keep budgeting workflow in one place.

**Why this priority**: This is the core requested flow and primary user value.

**Independent Test**: Open Atelier list, launch modal, enter valid data, submit, and verify new category appears in the list after modal closes.

**UI Flow**: Atelier list -> click Add New Category -> modal opens -> fill fields -> submit -> modal closes -> list refreshes with new row/card.

**Related Screens**:
- Atelier Category List
- Add Category Modal (Full Icon Grid)

**Acceptance Scenarios**:
1. **Given** user is on Atelier list with create permission, **When** user clicks Add New Category, **Then** Add Category modal opens with default field values and a selectable icon.
2. **Given** all required fields are valid, **When** user clicks Add Category, **Then** category is created, modal closes, and the new category is visible in Atelier list.

---

### User Story 2 - Validate Inputs and Recover Quickly (Priority: P1)

As an end user, I want immediate validation feedback so I can fix mistakes without losing entered data.

**Why this priority**: Validation quality directly affects completion rate for category creation.

**Independent Test**: Submit empty or invalid values and verify field-level messages appear while existing inputs remain preserved.

**UI Flow**: Open modal -> enter invalid/missing values -> submit -> see inline messages -> correct values -> resubmit successfully.

**Related Screens**:
- Add Category Modal (Full Icon Grid)

**Acceptance Scenarios**:
1. **Given** category name is blank, **When** user submits, **Then** modal shows an inline required-field message and does not close.
2. **Given** monthly limit is invalid, **When** user submits, **Then** modal shows a limit-specific validation message and preserves other user-entered values.
3. **Given** API rejects create as duplicate name conflict, **When** user submits, **Then** modal stays open, duplicate feedback appears on the category name field, and all other user-entered values remain unchanged.

---

### User Story 3 - Exit Without Saving (Priority: P2)

As an end user, I want to dismiss the modal safely so I can abandon creation when needed.

**Why this priority**: Consistent and predictable modal dismissal behavior is required for usable workflows.

**Independent Test**: Open modal and dismiss through close button, discard action, outside click, and escape key; verify no new category is created.

**UI Flow**: Open modal -> decide not to continue -> dismiss via supported action -> return to unchanged Atelier list.

**Related Screens**:
- Add Category Modal (Full Icon Grid)
- Atelier Category List

**Acceptance Scenarios**:
1. **Given** user has unsaved modal input, **When** user dismisses modal through any supported close interaction, **Then** modal closes and no category is created.
2. **Given** modal is open, **When** user presses escape key, **Then** modal closes and focus returns to Add New Category entry point.

---

## Edge Cases

- User submits a category name that already exists for their account across any month context after normalization (trim + case-insensitive).
- User enters limit value at lower boundary (0) or extremely large values.
- User disables warning toggle while warning percentage input currently has a value.
- User closes modal during an in-flight save request.
- Save succeeds but list refresh is delayed; user must still receive clear success confirmation.

---

## Requirements *(mandatory)*

### Functional Requirements

#### Validation Rules
- **FR-001**: Category name must be required and trimmed of leading/trailing whitespace before validation.
- **FR-002**: Category name length must be between 1 and 50 characters after trimming.
- **FR-003**: Exactly one icon must be selected before category creation is accepted.
- **FR-004**: Monthly limit must be required and must represent a non-negative monetary value.
- **FR-005**: Warning threshold must be an integer percentage from 1 to 100 when warning is enabled.

#### Business Rules
- **FR-006**: New category must be associated with the authenticated user only.
- **FR-007**: System must prevent duplicate category names for the same user across all months using normalized comparison (trimmed and case-insensitive).
- **FR-008**: If keep-limit-for-next-month is enabled, the same limit value must be used as next month initialization for that category.
- **FR-009**: If over-expense warning is disabled, warning threshold value must not trigger warning-state logic for the created category.

#### Permissions
- **FR-010**: Only authenticated users may create categories from Atelier.
- **FR-011**: User can create categories only within their own workspace data scope.

#### System Behavior
- **FR-012**: Clicking Add New Category card must open Add Category modal.
- **FR-013**: Successful creation must close the modal and refresh Atelier list content so the new category is visible without manual page reload.
- **FR-014**: Failed creation must keep the modal open and preserve all user-entered values except fields explicitly rejected by validation rules.
- **FR-015**: Modal must support dismissal via close button, discard action, outside click, and escape key.
- **FR-018**: Category creation must always write settings to the real current calendar month and next month initialization, regardless of which Atelier month is selected in the UI.

#### Error Handling
- **FR-016**: Validation errors must be shown in clear, field-level language that tells users how to fix input.
- **FR-017**: Save failures unrelated to validation must show a non-technical recoverable message with retry path.
- **FR-019**: Validation failures must return a structured field-level `errors` object, and non-field failures may include a top-level `error` message.
- **FR-020**: Duplicate-name conflicts must map to the category name field inline while preserving all non-conflicting form values.

---

## API-Relevant Behaviors

- Opening the modal does not create or modify data.
- Submitting valid modal data sends a create-category request scoped to the current authenticated user.
- Successful create returns the newly created category details needed for Atelier list display.
- Validation failures return field-level messages in an `errors` object suitable for inline display.
- Non-validation failures return recoverable error messages and do not clear current modal inputs.

---

## Non-Functional Requirements *(mandatory)*

- **NFR-001 (Quality)**: Feature behavior must align with existing repository standards and Atelier domain conventions.
- **NFR-002 (Testing)**: Automated and repeatable coverage must include happy-path create, validation errors, duplicate-name rejection, and all modal dismissal paths.
- **NFR-003 (UX Consistency)**: Modal interaction and visual structure must align with provided Stitch design assets.
- **NFR-004 (Performance)**: In normal conditions, modal open and close should each complete within 500 ms for at least 95% of interactions.
- **NFR-005 (Performance)**: In normal conditions, successful category creation including visible list refresh should complete within 2 seconds for at least 95% of attempts.
- **NFR-006 (Accessibility)**: All modal controls must be keyboard navigable, have visible focus states, and provide text labels understandable without color cues.

---

## Key Entities *(include if feature involves data)*

- **Category**: A user-defined spending segment with name, icon, and ownership context.
- **Category Monthly Limit Snapshot**: Month-specific limit settings for a category, including limit amount and next-month carry-forward behavior.
- **Category Warning Configuration**: Rule set that determines whether warning is enabled and the percentage threshold that marks pre-overspend risk.
- **Category Creation Attempt**: A single user submission event containing input values, validation outcomes, and creation result state.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 95% of users can create a new category from Atelier list in under 90 seconds during moderated usability testing.
- **SC-002**: 100% of invalid submissions show at least one actionable validation message and keep the modal open with preserved input context.
- **SC-003**: 100% of successful submissions result in the newly created category being visible in Atelier list immediately after modal close.
- **SC-004**: At least 90% of users report that the modal fields and actions are clear enough to complete category setup without external guidance.
- **SC-005**: Duplicate-category attempts are blocked in 100% of tested cases for the same user when names differ only by case and/or surrounding whitespace, regardless of month.

---

## Assumptions

- The feature is available to authenticated end users in the existing Atelier budgeting area.
- Atelier list already contains an Add New Category entry point and remains the launch context for this modal.
- Monthly limit uses the user's active currency context and always applies to the real current calendar month for creation.
- Default modal values are warning enabled at 80% and keep-limit-for-next-month enabled unless user changes them.
- Only one category is created per modal submission.

---

## Out of Scope *(optional but recommended)*

- Editing existing categories.
- Deleting categories.
- Bulk category import or multi-create workflows.
- Category sharing across multiple users.
- Notification channel delivery configuration (email/push/in-app) beyond warning threshold setting.

---

## Changelog

| Version | Date | Updated By | Change Summary |
|---------|------|------------|----------------|
| v1.0.0 | 2026-04-14 | OpenCode Agent | Initial Atelier create-category specification drafted with Stitch design references and downloaded design assets. |
| v1.0.1 | 2026-04-14 | OpenCode Agent | Added Atelier list trigger screen reference to reuse `atelier-list.html`/`atelier-list.png` for the Add New Category button UI source. |
