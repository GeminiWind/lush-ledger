# Feature Specification: Month-End Remainder Transfer to Savings Plan

## Metadata
- **Name**: Month-End Remainder Transfer to Savings Plan
- **Last Updated**: 2026-04-08
- **Updated By**: OpenCode Agent
- **Version**: v1.0.5

**Feature Branch**: `003-transfer-remainder-savings`  
**Created**: 2026-04-08  
**Status**: Ready for Dev  
**Input**: User description: "add spec for swapping remanider to saving plan at the end of month system automactyl take the reaminder transfer to saving plan based on the percentage configured by user"

## Summary
Enable users to automatically move configurable percentages of their month-end positive remainder into one or more savings plans. This reduces manual transfer work and helps users consistently split leftover monthly funds across multiple goals.

## Clarifications

### Session 2026-04-08
- Q: How should auto-transfer behave when the calculated transfer exceeds the remaining target amount? -> A: Cap transfer at the remaining target amount and keep the extra remainder unallocated.
- Q: Which timezone should define month-end cutoff for auto-transfer execution? -> A: Use each user's configured timezone.
- Q: Which plan statuses are eligible for month-end auto-transfer destination? -> A: Only active and funded plans are eligible.
- Q: Should auto-transfer support a single destination or multiple destinations with configured percentages? -> A: Support multiple destination plans with per-plan percentages.

## System Scope
- This is a fullstack feature including frontend UI and backend API.

## UI Scope & Design References *(mandatory when UI is in scope)*
- **UI Required**: Yes
- **Design Source**: Stitch
- **Project**: Expense Analytics & Limits (ID: `5432030685985881682`)
- **Primary Screen(s)**:
  - Fiscal Atelier (Plan List Editing) (ID: `b3392e96020c42359cee81e875067e1a`)
  - Auto transfer to savings settings area aligned to Atelier context (`/app/atelier`)
  - End-of-month transfer activity visibility on ledger-related views
- **Design Assets**:
  - Screenshot: `specs/003-transfer-remainder-savings/assets/fiscal-atelier-plan-list-editing.png`
  - HTML/Spec export: `specs/003-transfer-remainder-savings/assets/fiscal-atelier-plan-list-editing.html`

### UI Flow Summary
- User opens Atelier page.
- User sees an option to enable end-of-month auto-transfer of remainder.
- User configures one or more destination savings plans and per-plan percentages.
- User saves the setting.
- At month close, the system evaluates positive remainder and applies the configured transfer.
- User sees success result as an added savings contribution and updated plan progress.
- If transfer is skipped or fails, user sees a clear reason.

### UI / UX Requirements

#### Screens / Pages
- Atelier page (`/app/atelier`): add and manage auto-transfer configuration and show latest month-end run result.
- Ledger page (`/app/ledger`): show auto-transfer transactions in transaction history.
- Savings page (`/app/savings`): show savings progress impact from auto-transfer transactions.

#### Components
- Toggle for enabling/disabling auto-transfer.
- Allocation list control (multiple rows).
- Per-plan percentage input control.
- Savings plan selector per allocation row.
- Status/notice panel for the most recent month-end run.

#### Required Field Indicators
- All required fields in auto-transfer configuration must show a red `(*)` marker (including destination plan selector and percentage input per allocation row).

#### User Interactions
- Enable or disable rule.
- Add/remove destination plan allocation rows.
- Select destination savings plan for each row.
- Enter and update per-plan percentage values.
- Save configuration and review confirmation.

#### UI States
- loading while retrieving current configuration.
- validation error for invalid percentage, missing plan, duplicate plan, or invalid total allocation.
- empty state when no eligible savings plan exists.
- success confirmation after saving settings.
- informational state when month-end run is skipped.

#### Transitions
- Inline save confirmation after settings update.
- Month-end result appears as updated savings progress and activity entry.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure auto-transfer rule (Priority: P1)
As a user, I can set end-of-month transfer allocations across multiple savings plans so leftover funds are moved automatically without manual actions.

**Why this priority**: Configuration is the core control point; without it, automatic month-end behavior cannot happen.

**Independent Test**: Open savings settings, enable auto-transfer, configure multiple plan allocations with valid percentages, save, and verify the configuration persists and reloads correctly.

**UI Flow**: User opens monthly savings plan settings, enables rule, adds allocation rows, sets plan + percentage per row, saves, and sees confirmation.

**Acceptance Scenarios**:
1. **Given** the user has eligible savings plans, **When** they save one or more allocation rows with per-row percentages from 1 to 100 and total allocation percentage from 1 to 100, **Then** the configuration is stored and shown as active.
2. **Given** the user enters invalid allocation data (missing plan, duplicate plan, invalid percentage, or total percentage above 100), **When** they try to save, **Then** the system blocks save and shows a clear validation message.

---

### User Story 2 - Automatic month-end transfer execution (Priority: P1)
As a user with an active rule, I want the system to automatically transfer part of my month-end remainder to savings so progress happens consistently.

**Why this priority**: The automatic transfer is the direct business value promised by the feature.

**Independent Test**: With an active rule and a positive month-end remainder, run month-close processing and verify that the correct transfer amount is recorded and savings progress increases.

**UI Flow**: Month closes, system applies rule, user later sees transfer in savings progress and activity history.

**Acceptance Scenarios**:
1. **Given** an active auto-transfer rule and a positive month-end remainder, **When** month-close processing runs, **Then** the system calculates and applies transfers for each configured allocation row.
2. **Given** an active auto-transfer rule but month-end remainder is zero or negative, **When** month-close processing runs, **Then** no transfer is created and the run is marked as skipped with reason.
3. **Given** month-end processing has run, **When** the user opens `/app/ledger` and `/app/savings`, **Then** ledger shows transfer transactions with date, amount, destination plan, and transfer type, and savings shows updated per-plan saved progress.

## Edge Cases
- User has auto-transfer enabled but all savings plans are ineligible at month close.
- Configured plan is removed or becomes unavailable after setup and before month close.
- Calculated transfer exceeds remaining target amount for the selected plan.
- User configures duplicate savings plans in multiple allocation rows.
- Sum of configured allocation percentages exceeds 100.
- Calculated transfer amount rounds to zero due to very small positive remainder.
- User updates configuration on the same day as month-close processing.
- Month-close processing is retried; duplicate transfers for the same month must not be created.

## Requirements *(mandatory)*

### Functional Requirements

#### Validation Rules
- **FR-001**: System must require at least one destination savings plan allocation row when auto-transfer is enabled, and each selected plan must be in `active` or `funded` status.
- **FR-002**: Each allocation percentage must be an integer from 1 to 100, and total allocation percentage across all rows must be from 1 to 100 when auto-transfer is enabled.
- **FR-003**: System must allow users to disable auto-transfer without deleting the chosen plan reference.
- **FR-004**: System must prevent duplicate savings plan selection across allocation rows.

#### Business Rules
- **FR-005**: For each user, system must calculate month-end remainder as that month’s unallocated positive amount after normal monthly transactions are finalized.
- **FR-006**: If remainder is positive, each plan transfer amount must equal `remainder * plan allocation percentage`, rounded to the product currency’s smallest unit, and capped at that plan’s remaining target amount.
- **FR-007**: If remainder is zero or negative, system must not create any transfer.
- **FR-008**: System must create at most one month-end auto-transfer run record per user per calendar month.

#### Permissions
- **FR-009**: Users can only create, update, view, or disable auto-transfer settings for their own account.
- **FR-010**: Users can only target savings plans that belong to their own account.

#### System Behavior
- **FR-011**: System must execute auto-transfer processing at month end for all users with active rules, based on each user's configured timezone.
- **FR-012**: Successful auto-transfer must increase saved progress for each destination savings plan that receives an applied amount and be visible in user activity history.
- **FR-013**: System must store the month, evaluated remainder, full allocation configuration, per-plan applied/skipped results, and skip reason when relevant.
- **FR-014**: If a configured savings plan is unavailable at execution time, system must skip only that plan allocation and continue processing remaining valid allocations in the same run.

#### Activity History Visibility Rules
- **FR-017**: `/app/ledger` must display month-end auto-transfer entries with transaction date, transfer amount, destination savings plan, and transfer type label.
- **FR-018**: `/app/savings` must reflect the progress impact of month-end auto-transfer entries in each affected savings plan summary.

#### Error Handling
- **FR-015**: System must show clear, user-friendly errors when configuration save fails.
- **FR-016**: System must preserve the previous valid configuration when an update attempt fails.

### Non-Functional Requirements *(mandatory)*
- **NFR-001 (Clarity)**: Users must understand whether auto-transfer is active, disabled, applied, or skipped from visible status text.
- **NFR-002 (Reliability)**: Month-end processing must avoid duplicate transfers for the same user and month, including retry situations.
- **NFR-003 (Auditability)**: Each month-end run outcome must be traceable with enough detail for user support and reconciliation.

### Key Entities *(include if feature involves data)*
- **Auto-Transfer Rule**: User-defined setting containing enabled state and a list of destination plan allocations (plan + percentage).
- **Month-End Remainder Evaluation**: Monthly snapshot containing evaluated remainder, allocation configuration, per-plan calculated/applied amounts, execution status, and skip reasons.
- **Savings Transfer Record**: Financial activity entries that link per-plan month-end transfer results to savings progress.

## API-Relevant Behaviors
- UI requests current auto-transfer configuration and eligible savings plan choices.
- UI submits create/update/disable actions for the auto-transfer rule.
- Backend returns saved allocation configuration and latest month-end run per-plan result details.
- Backend returns structured validation and business-rule errors for unsupported input or invalid plan selection.
- After successful updates, UI refreshes savings progress and recent activity state.

## Success Criteria *(mandatory)*

### Measurable Outcomes
- **SC-001**: 95% of users who enable this feature complete configuration in under 2 minutes.
- **SC-002**: 100% of month-end runs with positive remainder and valid configuration produce exactly one month-end run record and one or more per-plan transfer entries (based on configured allocations) for that month.
- **SC-003**: 100% of month-end runs with non-positive remainder produce no transfer and a visible skipped reason.
- **SC-004**: In post-release feedback, at least 80% of users who enabled the feature report reduced manual effort for savings contributions.

## Assumptions
- The product already has a monthly close process that can evaluate each user’s month-end financial position.
- Savings plans have an eligibility concept, and only active/funded plans are valid transfer targets.
- Currency rounding follows existing application behavior for monetary amounts.
- This feature applies to individual users only and does not introduce shared or multi-user savings plans.

## Changelog

| Version | Date | Updated By | Change Summary |
|---------|------|------------|----------------|
| v1.0.0 | 2026-04-08 | OpenCode Agent | Initial draft for automated month-end remainder transfer to savings plan. |
| v1.0.1 | 2026-04-08 | OpenCode Agent | Added Stitch UI references and downloaded design assets for Fiscal Atelier screen. |
| v1.0.2 | 2026-04-08 | OpenCode Agent | Clarified over-target transfer handling by capping transfer at remaining goal amount. |
| v1.0.3 | 2026-04-08 | OpenCode Agent | Clarified month-end cutoff timezone as per-user configured timezone. |
| v1.0.4 | 2026-04-08 | OpenCode Agent | Clarified eligible destination statuses as active and funded only. |
| v1.1.0 | 2026-04-08 | OpenCode Agent | Expanded auto-transfer scope to support multiple destination savings plans with per-plan percentages. |
| v1.1.1 | 2026-04-08 | OpenCode Agent | Updated Stitch design reference and assets to Fiscal Atelier (Plan List Editing). |
