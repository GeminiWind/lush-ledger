# DELETE /api/categories/{id}

## Purpose

Soft-delete a user-owned category from active Atelier view, while preserving history by reassigning linked transactions to system `Uncategorized` category.

## Triggered By

- User confirms deletion in `DeleteCategoryDialog` from Atelier category list.

## Request

Path parameter:
- `id` (string): target category id

Body:
- none

Headers:
- authenticated session required

## Success Response

`200 OK`

```json
{
  "ok": true,
  "deletedCategoryId": "cat_123",
  "reassignedToCategoryId": "cat_uncategorized_1"
}
```

## Error Responses

### Unauthorized

`401 Unauthorized`

```json
{
  "error": "Unauthorized"
}
```

### Not Found (missing or already soft-deleted)

`404 Not Found`

```json
{
  "error": "Category not found."
}
```

### Validation / Business Rule

`400 Bad Request`

```json
{
  "error": "Validation failed.",
  "errors": {
    "id": "Invalid category id."
  }
}
```

### Server Failure

`500 Internal Server Error`

```json
{
  "error": "Unable to delete category. Please try again."
}
```

## Side Effects

- Target category is soft-deleted (`deletedAt` set).
- Linked transactions are reassigned to user system `Uncategorized` category.
- Active list query no longer returns deleted category.

## Related Functional Requirements

- FR-001, FR-002, FR-003, FR-004, FR-005
- FR-006, FR-007, FR-008, FR-009, FR-010, FR-011
- FR-012, FR-013, FR-014
