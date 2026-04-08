# Feature Specification: Allocate Monthly Remainder to Savings Plans

## Metadata

- **Name**: Allocate Monthly Remainder to Savings Plans
- **Last Updated**: 2026-04-08
- **Updated By**: OpenCode Agent
- **Version**: v1.0.7

**Feature Branch**: `002-allocate-leftover-savings`  
**Created**: 2026-04-07  
**Status**: Approved (Ready for Dev)
**Input**: User description: "swap the remaing of month expense to active/funded saving plan by priority (percentage)"

## UI Design References *(optional, include when UI is in scope)*

- **UI Required**: Yes
- **Design Source**: Stitch
- **Project**: Expense Analytics & Limits (ID: `5432030685985881682`)
- **Primary Screen(s)**:
  - Fiscal Atelier (Cleaned Saving Plan List) (ID: `68a914716bf54b798ea572b8ed46f12f`)
- **Design Assets**:
  - Screenshot: `specs/002-allocate-leftover-savings/assets/fiscal-atelier-cleaned-saving-plan-list.png`
  - HTML/Spec export: `specs/002-allocate-leftover-savings/assets/fiscal-atelier-cleaned-saving-plan-list.html`
- **Implementation Notes**: Use this screen as the visual and interaction reference for visibility rules, remainder summary, and allocation messaging in the Fiscal Atelier flow.

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Allocate monthly remainder by priority (Priority: P1)

As a signed-in user managing savings goals, I want the remaining monthly amount after expenses to be allocated to eligible savings plans by priority percentage so my leftover money is distributed automatically.

**Why this priority**: This is the core requested outcome and delivers immediate value by converting leftover month-end money into progress on savings goals.

**Independent Test**: Can be fully tested by setting a month with known remaining amount, assigning priority percentages to eligible plans, triggering end-of-month processing, and verifying each plan receives the correct contribution.

**Acceptance Scenarios**:

1. **Given** a user has a positive remaining monthly amount and at least one eligible savings plan, **When** end-of-month processing starts, **Then** the system automatically distributes the full remaining amount across eligible plans using configured priority percentages.
2. **Given** multiple eligible plans with different percentages, **When** allocation completes, **Then** higher-percentage plans receive larger contributions in proportion to those percentages.
3. **Given** a user has zero remaining monthly amount, **When** end-of-month processing starts, **Then** the system performs no allocation changes and records no transfer-to-savings transaction.

---

### User Story 2 - Respect plan eligibility and limits (Priority: P2)

As a user, I want allocation to include only active or funded plans and stop at each plan's remaining target need so contributions never go to ineligible plans or exceed plan targets.

**Why this priority**: Correct plan eligibility and target protection are essential for trust and financial accuracy.

**Independent Test**: Can be tested by mixing active, funded, completed, archived, and cancelled plans with known remaining targets and verifying only eligible plans receive amounts up to their target gap.

**Acceptance Scenarios**:

1. **Given** a user has plans in different statuses, **When** allocation runs, **Then** only plans currently eligible for contribution receive allocated amounts.
2. **Given** a plan would receive more than its remaining target gap, **When** allocation runs, **Then** that plan is capped at its target and any leftover amount is redistributed to other eligible plans.
3. **Given** total remaining month amount is greater than total remaining need of all eligible savings plans, **When** allocation completes, **Then** only the needed amount is transferred to savings plans and the leftover amount remains unchanged outside savings allocation.

---

### User Story 3 - Review and trust allocation results (Priority: P3)

As a user, I want a clear allocation summary before and after completion so I can understand where my monthly remainder goes and confirm the result.

**Why this priority**: Transparency reduces confusion and support requests, especially when several plans share the same remainder pool.

**Independent Test**: Can be tested by completing end-of-month processing and confirming the user can view the month used, total amount allocated, per-plan contribution, and any unallocated balance.

**Acceptance Scenarios**:

1. **Given** end-of-month processing is completed, **When** the user views allocation results, **Then** the user sees the calculated monthly remainder and final per-plan distribution.
2. **Given** allocation has completed, **When** the user views results, **Then** the user sees a final summary with total allocated amount, per-plan contribution amounts, and reason for any unallocated remainder.

---

### Edge Cases

- Remaining monthly amount is zero or negative after expenses.
- No active or funded savings plans exist at allocation time.
- Priority percentages are missing or do not total 100% across eligible plans.
- Rounding causes fractional remainder after percentage-based split.
- All eligible plans become fully funded before the entire monthly remainder is consumed.
- Total monthly cap is not greater than the sum of all category limits.
- End-of-month processing is retried for the same month after partial failure.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST calculate each user's monthly remaining amount as monthly allowance minus recognized month expenses during end-of-month processing.
- **FR-002**: System MUST automatically execute monthly remainder allocation once at the end of each month for each eligible user.
- **FR-002B**: Automatic end-of-month execution MUST run from a cron job schedule in production runtime (not via manual user-triggered action).
- **FR-002A**: System MUST make the remainder-to-savings allocation feature visible and available only when the total limit of all categories is lower than the total monthly cap; otherwise it MUST be hidden or unavailable.
- **FR-003**: System MUST include only savings plans in `active` or `funded` status during allocation.
- **FR-004**: Users MUST be able to define and update priority percentages for eligible savings plans.
- **FR-005**: System MUST enforce that eligible plan priorities used in an allocation total 100% before applying end-of-month allocation.
- **FR-006**: System MUST distribute the remaining monthly amount across eligible plans proportional to their configured priority percentages.
- **FR-007**: System MUST cap each plan's received amount at its remaining target need and redistribute any excess to other eligible plans until no eligible need remains.
- **FR-007A**: If the remaining monthly amount exceeds the total remaining need of all eligible savings plans, system MUST transfer only the needed amount and leave the excess remainder unchanged.
- **FR-008**: System MUST preserve amount accuracy using deterministic rounding so the sum of allocated amounts plus any reported unallocated remainder equals the original monthly remainder.
- **FR-009**: System MUST treat a remaining monthly amount of zero as a no-op: no allocation run is applied, no plan balances change, and no transfer-to-savings transaction is created.
- **FR-010**: System MUST publish an allocation result summary for the processed month that includes remaining amount, eligible plans, and applied per-plan distribution.
- **FR-011**: System MUST show a post-allocation summary that includes total allocated amount, per-plan applied contributions, and any unallocated balance with reason.
- **FR-012**: System MUST record each allocation result in month-level history so users can review what was allocated and to which plans.
- **FR-013**: System MUST log every applied swap/allocation amount as a transaction with type `transfer_to_saving_plan` so allocation activity is auditable.
- **FR-014**: Each `transfer_to_saving_plan` transaction MUST be traceable to the related month and target savings plan in allocation history.

### Non-Functional Requirements *(mandatory)*

- **NFR-001 (Reliability)**: For the same month and unchanged input data, allocation results MUST be consistent across repeated calculations.
- **NFR-002 (Understandability)**: Allocation summaries MUST be understandable by non-technical users and clearly explain totals, per-plan amounts, and unallocated remainder reasons.
- **NFR-003 (Performance)**: For users with up to 30 eligible plans, 95% of allocation runs MUST complete and present final results within 3 seconds.
- **NFR-004 (Auditability)**: Users MUST be able to review allocation history for at least the previous 12 months.

### Key Entities *(include if feature involves data)*

- **Monthly Remainder**: The amount left after subtracting recognized monthly expenses from the user's monthly allowance for a specific month.
- **Savings Plan Priority**: A user-defined percentage weight assigned to each eligible savings plan for month-end distribution.
- **Allocation Run**: A single month-specific distribution event containing the source remainder amount, eligibility snapshot, computed splits, and final applied amounts.
- **Allocation Entry**: A per-plan contribution result produced by an allocation run, including planned amount, applied amount, and any capped difference.
- **Savings Transfer Audit Transaction**: A transaction record created for each applied allocation with type `transfer_to_saving_plan`, used to audit remainder-to-plan transfers.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 99% of eligible end-of-month allocation jobs complete successfully on first processing attempt.
- **SC-002**: In validation samples, 100% of allocation runs distribute funds only to eligible plans and never exceed any plan target gap.
- **SC-003**: At least 98% of allocation runs reconcile exactly, where source remainder equals total allocated plus reported unallocated remainder.
- **SC-004**: Within one release cycle, support questions about month-end leftover distribution decrease by at least 40% compared to the prior cycle.

## Assumptions

- The feature applies to authenticated users who already track monthly allowance and expenses in the product.
- "Remaining month expense" is interpreted as the unspent amount for that month (monthly allowance minus recognized expenses).
- Remainder swap/allocation is system-triggered automatically at end of month by cron schedule; manual triggering is out of scope for this iteration.
- Priority percentages are maintained by users and are expected to be reviewed before running allocation.
- Existing savings plan lifecycle definitions determine plan contribution eligibility.

## Changelog

| Version | Date | Updated By | Change Summary |
|---------|------|------------|----------------|
| v1.0.0 | 2026-04-07 | OpenCode Agent | Initial spec draft for allocating monthly remainder to eligible savings plans by priority percentage. |
| v1.0.1 | 2026-04-07 | OpenCode Agent | Clarified zero-remainder behavior as no-op and added auditable transfer transaction type `transfer_to_saving_plan`. |
| v1.0.2 | 2026-04-07 | OpenCode Agent | Clarified that swap runs automatically at end of month and aligned requirements and scenarios to scheduled execution. |
| v1.0.3 | 2026-04-07 | OpenCode Agent | Added rule to run swap only when total category limits are below monthly cap and clarified excess remainder stays unchanged after funding eligible plans. |
| v1.0.4 | 2026-04-08 | OpenCode Agent | Added Stitch screen reference and downloaded PNG/HTML assets for implementation and QA traceability. |
| v1.0.5 | 2026-04-08 | OpenCode Agent | Replaced obsolete Stitch screen reference with Fiscal Atelier (Cleaned Saving Plan List) and updated PNG/HTML asset paths. |
| v1.0.6 | 2026-04-08 | OpenCode Agent | Clarified that month-end allocation scheduling runs in-process at server runtime instead of relying on manual/external API invocation. |
| v1.0.7 | 2026-04-08 | OpenCode Agent | Updated scheduling requirement to cron-job driven month-end execution and aligned implementation expectation accordingly. |
