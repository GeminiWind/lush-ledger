# Data Model: Atelier List

## Category

### Purpose
Represents a user-owned spending category displayed in the Atelier list.

### Fields
- id: string - Unique category identifier.
- userId: string - Owner identity used for data isolation.
- name: string - Category display name.
- icon: string - Category icon token shown in list row.
- createdAt: datetime - Creation timestamp for ordering/fallback behavior.

### Constraints
- Category must belong to the authenticated user.
- Name must be non-empty in persisted records.
- Icon must resolve to a display-safe fallback when missing.

### Relationships
- One-to-many with `CategoryMonthlyLimit` by `categoryId`.
- One-to-many with expense `Transaction` records by `categoryId`.

## CategoryMonthlyLimit

### Purpose
Stores month-scoped budget controls used by Atelier list calculations.

### Fields
- id: string - Unique monthly-limit record id.
- userId: string - Owner identity.
- categoryId: string - Category reference.
- monthStart: date - Start-of-month anchor for snapshot.
- limit: decimal - Budget limit for the month.
- warningEnabled: boolean - Whether warning threshold is active.
- warnAt: integer - Warning threshold percent (1..100).
- createdAt: datetime - Creation timestamp.
- updatedAt: datetime - Last update timestamp.

### Constraints
- Unique per `(userId, categoryId, monthStart)`.
- `warnAt` must remain in range 1 to 100 when warning is enabled.
- Snapshot rows must be user-scoped and month-normalized.

### Relationships
- Belongs to one `Category`.
- Participates in monthly aggregation with category transactions.

## AtelierListRow

### Purpose
Read-model projection for a single category row in Atelier list screen.

### Fields
- categoryId: string - Row identity.
- name: string - Category name for display.
- icon: string - Category icon for display.
- month: string - Selected month key (`YYYY-MM`).
- limit: number - Selected-month category limit.
- spent: number - Selected-month total expense in category.
- usagePercent: number - Selected-month utilization percent.
- warningEnabled: boolean - Warning rule active flag.
- warnAt: number - Warning threshold percent.
- carryNextMonth: boolean - Derived visibility for carry-over to next month.
- status: enum(`healthy`, `warning`, `overspent`, `pending`) - Row risk state.

### Constraints
- `status` follows precedence: `overspent` > `warning` > `healthy`; `pending` only when required data is incomplete.
- `usagePercent` is bounded at 0..100 for display.
- Row can only include category data owned by authenticated user.

### Relationships
- Derived from `Category`, `CategoryMonthlyLimit`, and selected-month transactions.

### Lifecycle (optional)
- selected month resolved -> row projected -> status evaluated -> rendered in list
