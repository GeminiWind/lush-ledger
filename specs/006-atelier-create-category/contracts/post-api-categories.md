# POST /api/categories

## Purpose
Create a new user-owned category from the Atelier modal and persist month-scoped limit settings for current and next month.

## Triggered By
- Clicking `Add Category` in the Add Category modal on `/app/atelier`

## Request
```json
{
  "name": "Luxury Travel",
  "icon": "flight",
  "monthlyLimit": 5000000,
  "keepLimitNextMonth": true,
  "warningEnabled": true,
  "warnAt": 80
}
```

Notes:
- `name` is required and trimmed before validation.
- `monthlyLimit` must be non-negative.
- `warnAt` must be integer 1..100 when warning is enabled.

## Success Response

```json
{
  "category": {
    "id": "cat_travel",
    "userId": "user_123",
    "name": "Luxury Travel",
    "icon": "flight"
  }
}
```

## Error Response

Validation/business failure example:

```json
{
  "error": "Category name already exists for this month."
}
```

Field/range failure example:

```json
{
  "error": "Warn threshold must be between 1 and 100."
}
```

Unauthorized example:

```json
{
  "error": "Unauthorized"
}
```

Additional error cases:
- Cap overflow (current or next month) returns `400` with recoverable guidance.
- System failure returns `500` with non-technical recoverable message.

## Related Functional Requirements

- FR-001
- FR-002
- FR-003
- FR-004
- FR-005
- FR-006
- FR-007
- FR-008
- FR-009
- FR-010
- FR-011
- FR-013
- FR-014
- FR-016
- FR-017
