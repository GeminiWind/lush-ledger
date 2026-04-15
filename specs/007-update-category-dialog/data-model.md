# Data Model: Atelier Category Update Dialog

## Category

### Purpose

Represents a user-owned spending category that can be renamed and re-iconed from the Atelier list edit flow.

### Fields

- `id`: string - unique category identifier
- `userId`: string - owner identifier used for access scoping
- `name`: string - user-visible category label
- `icon`: string - material symbol identifier for category card/dialog
- `createdAt`: datetime - creation timestamp

### Constraints

- `name` is required and trimmed.
- `name` must be unique per user under case-insensitive comparison.
- Same-category updates exclude current record from uniqueness checks.

### Relationships

- One `Category` to many `CategoryMonthlyLimit` snapshots.
- One `Category` to many `Transaction` records.

## CategoryMonthlyLimit

### Purpose

Stores per-month budget limit and warning settings used by Atelier list and edit dialog behavior.

### Fields

- `id`: string - unique limit row identifier
- `userId`: string - owner identifier
- `categoryId`: string - associated category
- `monthStart`: datetime - month scope key
- `limit`: decimal - monthly limit value
- `warningEnabled`: boolean - warning on/off state
- `warnAt`: integer - warning threshold percentage
- `createdAt`: datetime - row creation timestamp
- `updatedAt`: datetime - row update timestamp

### Constraints

- Unique on (`userId`, `categoryId`, `monthStart`).
- `limit` must satisfy feature validation (positive for edit submissions).
- `warnAt` must be 1..100 when warnings are enabled.
- When warnings are disabled, `warnAt` is preserved and excluded from active validation behavior.

### Relationships

- Many `CategoryMonthlyLimit` rows belong to one `Category`.
- Current-month and next-month rows are both updated in edit flow.

## CategoryEditSnapshot (Request Model)

### Purpose

Captures original values seen when dialog opened so server can detect stale updates and reject conflicts.

### Fields

- `originalName`: string - initial category name at dialog open
- `originalIcon`: string - initial icon at dialog open
- `originalMonthlyLimit`: number - initial current-month limit at dialog open
- `originalWarningEnabled`: boolean - initial warning toggle state
- `originalWarnAt`: number - initial warning threshold

### Constraints

- Snapshot values must be present for conflict-safe update requests.
- Server compares snapshot values against latest persisted values before applying update.
- Mismatch triggers conflict response (`409`) with retry guidance.

### Lifecycle

- Created client-side at dialog open.
- Submitted once per update attempt.
- Discarded after modal close.

## Update Request/Response View

### Update Input (logical)

- `name`, `icon`, `monthlyLimit`, `warningEnabled`, `warnAt`, `keepLimitNextMonth`
- plus `CategoryEditSnapshot` for optimistic concurrency

### Update Success Output (logical)

- Updated category identity and display attributes used to refresh Atelier card rendering.

### Update Error Output (logical)

- `400`: field-level validation/business rule errors
- `401`: unauthenticated request
- `404`: category missing or inaccessible
- `409`: stale dialog conflict detected
