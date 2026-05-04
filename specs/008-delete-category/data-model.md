# Data Model: Atelier Delete Category

## Category

### Purpose
User-owned spending category shown in Atelier and eligible for soft deletion.

### Fields
- `id`: string - unique identifier
- `userId`: string - owner identity
- `name`: string - display label
- `icon`: string - icon key
- `deletedAt`: datetime | null - soft-delete marker
- `createdAt`: datetime
- `updatedAt`: datetime

### Constraints
- Unique category identity per record.
- Active category means `deletedAt = null`.
- Delete operation sets `deletedAt` (does not hard-delete row).

### Relationships
- One category to many `CategoryMonthlyLimit` rows.
- One category to many `Transaction` rows (post-delete reassigned).

### Lifecycle
- `active` -> `soft_deleted`

## UncategorizedCategory

### Purpose
System-managed fallback category for reassigned transactions from deleted categories.

### Fields
- `id`: string
- `userId`: string
- `name`: string (canonical: `Uncategorized`)
- `isSystem`: boolean (true)
- `deletedAt`: null (must remain active)

### Constraints
- Exactly one active system uncategorized category per user.
- Must exist before reassignment step commits.

### Relationships
- One uncategorized category can hold many reassigned transactions.

## Transaction

### Purpose
Historical ledger entry retained across category lifecycle changes.

### Fields
- `id`: string
- `userId`: string
- `categoryId`: string | null
- `amount`: decimal
- `occurredAt`: datetime
- `type`: string

### Constraints
- On category delete, linked transactions are reassigned to user `Uncategorized` category.
- Transactions remain intact (no delete) during category deletion.

### Relationships
- Many transactions belong to one category at a time.

## DeleteCategoryAttempt

### Purpose
Represents one user-confirmed delete request and outcome.

### Fields
- `categoryId`: string
- `actorUserId`: string
- `status`: `success | unauthorized | not_found | validation_error | failed`
- `httpStatus`: `200 | 401 | 404 | 400 | 500`
- `error`: string | null

### Constraints
- Confirmation required before request dispatch.
- Duplicate submit blocked while pending.

### Lifecycle
- `idle -> pending -> success | error`
