# Data Model: Month-End Remainder Transfer to Savings Plan

## AutoTransferRule

### Purpose
Stores user preferences for automatic month-end remainder transfer into one or more savings plans.

### Fields
- id: string - Unique rule identifier.
- userId: string - Owner of the rule.
- enabled: boolean - Whether month-end auto-transfer is active.
- allocations: array - List of destination allocations (`savingsPlanId`, `percentage`).
- allocationTotalPercentage: integer - Sum of all allocation percentages.
- updatedAt: datetime - Last configuration update time.

### Constraints
- At most one current active rule per user.
- At least one allocation is required when `enabled = true`.
- Each allocation percentage is required and must be 1..100.
- Sum of allocation percentages must be 1..100.
- Allocation savings plans must be unique within rule.
- Every selected plan must belong to same user and be `active` or `funded`.
- Monthly differences are supported by storing a snapshot of the applied configuration in each `AutoTransferRun.planResults` record for that month.

### Relationships
- Many-to-one to User (`userId -> User.id`).
- One-to-many logical mapping to SavingsPlan through allocation rows.

### Lifecycle (optional)
- disabled -> enabled (valid allocation set with eligible plans)
- enabled -> disabled (plan reference may be retained)

## AutoTransferRun

### Purpose
Represents the month-end evaluation result for a user rule, including applied or skipped transfer outcome.

### Fields
- id: string - Unique run identifier.
- userId: string - User whose month-end was evaluated.
- monthStart: datetime - Canonical month key in user timezone context.
- timezone: string - User timezone used for cutoff.
- remainderAmount: decimal - Calculated month-end remainder.
- allocationTotalPercentage: integer - Total allocation percentage used in evaluation.
- planResults: array - Per-plan evaluation rows (`savingsPlanId`, `configuredPercentage`, `calculatedAmount`, `appliedAmount`, `status`, `skipReason`, `transactionId`).
- status: enum(`applied`,`skipped`) - Result type.
- skipReason: string nullable - Reason when status is skipped.
- createdAt: datetime - Run creation timestamp.

### Constraints
- Unique per `userId + monthStart`.
- Run `status = skipped` when all planResults are skipped.
- Run `status = applied` when at least one planResult is applied.
- For each planResult, `skipReason` is required when planResult status is skipped.
- For each planResult, `transactionId` is required when planResult status is applied.
- For each planResult, `appliedAmount` must be <= remaining target at evaluation time.

### Relationships
- Many-to-one to User.
- One-to-many linkage to SavingsPlan and Transaction through planResults rows.

### Lifecycle (optional)
- pending evaluation (process state) -> applied
- pending evaluation (process state) -> skipped

## SavingsTransferRecord

### Purpose
Existing ledger transaction entry that records money movement from month-end remainder into savings.

### Fields
- transactionId: string - Existing transaction identifier.
- userId: string - Transaction owner.
- savingsPlanId: string - Destination plan linkage for each applied plan result.
- type: string - Must be `transfer_to_saving_plan`.
- amount: decimal - Applied transfer amount.
- date: datetime - Posting date for the transfer.
- notes: string nullable - Context note including month-end source.

### Constraints
- Must belong to same user as related AutoTransferRun.
- Must only be created for `applied` run status.

### Relationships
- Many-to-one to SavingsPlan via `Transaction.savingsPlanId`.
- One-to-one logical link from AutoTransferRun via `transactionId`.
