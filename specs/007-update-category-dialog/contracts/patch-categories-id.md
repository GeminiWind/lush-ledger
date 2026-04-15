# PATCH /api/categories/{id}

## Purpose

Update an existing user-owned category from the Atelier edit dialog while enforcing validation, uniqueness, and monthly-cap constraints.

## Triggered By

- User clicks `Update Category` in edit dialog opened from Atelier list card action.

## Request

```json
{
  "name": "Dining",
  "icon": "restaurant",
  "monthlyLimit": 2500000,
  "warningEnabled": true,
  "warnAt": 80,
  "keepLimitNextMonth": true
}
```

### Request Rules

- `name`: required, trimmed, max length follows existing category constraints.
- `monthlyLimit`: positive monetary value.
- `warnAt`: required only when `warningEnabled` is true; integer 1..100.
- `warningEnabled=false`: persisted `warnAt` remains stored but treated as inactive.

## Success Response

`200 OK`

```json
{
  "category": {
    "id": "c1",
    "name": "Dining",
    "icon": "restaurant"
  }
}
```

## Error Responses

### Validation / Business Rule

`400 Bad Request`

```json
{
  "error": "Category name already exists.",
  "errors": {
    "name": "Category name already exists."
  }
}
```

### Unauthorized

`401 Unauthorized`

```json
{
  "error": "Unauthorized"
}
```

### Not Found

`404 Not Found`

```json
{
  "error": "Category not found."
}
```

## Related Functional Requirements

- FR-001, FR-002, FR-003, FR-004
- FR-005, FR-006, FR-007, FR-008, FR-009
- FR-010, FR-011, FR-012, FR-013, FR-014, FR-015, FR-016
- FR-017, FR-018, FR-019, FR-020
