# Data Model: Atelier Create Category

## Category

### Purpose
Represents a user-owned spending category created from the Atelier modal.

### Fields
- id: string - Unique category identifier.
- userId: string - Owner identity used for scope enforcement.
- name: string - Category display name.
- icon: string - Icon token selected from modal icon grid.
- createdAt: datetime - Creation timestamp.

### Constraints
- Must belong to the authenticated user.
- Name must be non-empty after trimming.
- Name must be unique within the enforced create scope (same user and current month context).
- Icon must fall back to a safe default when absent/invalid.

### Relationships
- One-to-many with `CategoryMonthlyLimit` by `categoryId`.
- One-to-many with `Transaction` by `categoryId`.

## CategoryMonthlyLimit

### Purpose
Stores month-scoped settings created during category creation for current and next month snapshots.

### Fields
- id: string - Unique monthly-limit row id.
- userId: string - Owner identity.
- categoryId: string - Category reference.
- monthStart: date - Snapshot month anchor.
- limit: decimal - Monthly limit value.
- warningEnabled: boolean - Warning toggle state.
- warnAt: integer - Warning threshold percent.
- createdAt: datetime - Created timestamp.
- updatedAt: datetime - Last updated timestamp.

### Constraints
- Unique per `(userId, categoryId, monthStart)`.
- `limit` must be zero or greater.
- `warnAt` must be integer in range 1..100 when warning is enabled.
- Current and next month projected limits must not exceed corresponding monthly cap snapshot.

### Relationships
- Belongs to one `Category`.
- Compared against `UserMonthlyCap` for overflow validation.

## CategoryCreateInput

### Purpose
Represents the modal submission payload for category creation.

### Fields
- name: string - Required user-entered category name.
- icon: string - Required selected icon token.
- monthlyLimit: number - Non-negative limit value.
- keepLimitNextMonth: boolean - Carry-forward behavior for next month initialization.
- warningEnabled: boolean - Whether warning rule is active.
- warnAt: number - Warning threshold percentage.

### Constraints
- `name` length must be between 1 and 50 after trimming.
- `monthlyLimit` must be finite and non-negative.
- `warnAt` must be integer 1..100 when warning is enabled.

### Lifecycle
- draft input -> client validation -> API validation -> accepted/rejected

## CategoryCreateResult

### Purpose
Represents the API mutation outcome used by modal UX and list refresh behavior.

### Fields
- ok: boolean - Indicates success/failure outcome.
- category: object - Created category on success.
- errors: object - Field-level errors when validation fails.
- error: string - Recoverable top-level message for business/system failure.

### Constraints
- Success response must include created category id.
- Validation/system failures must not create partial category state.

### Lifecycle
- pending -> success (modal close + refresh) OR failure (modal stays open with feedback)
