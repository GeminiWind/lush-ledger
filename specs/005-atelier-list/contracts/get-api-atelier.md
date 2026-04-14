# GET /api/atelier?month=YYYY-MM

## Purpose
Return the authenticated user's month-scoped Atelier list data, including category row attributes required by the list screen.

## Triggered By
- Opening `/app/atelier`
- Changing month context in Atelier list screen

## Request
```json
{
  "query": {
    "month": "2026-04"
  }
}
```

Notes:
- `month` is optional; when omitted, current month is used.
- Invalid month format must return validation error.

## Success Response

```json
{
  "month": "2026-04",
  "categories": [
    {
      "id": "cat_food",
      "name": "Food",
      "icon": "restaurant",
      "limit": 5000000,
      "spent": 4200000,
      "usagePercent": 84,
      "warningEnabled": true,
      "warnAt": 80,
      "carryNextMonth": true,
      "status": "warning"
    }
  ]
}
```

## Error Response

```json
{
  "errors": {
    "month": "month must be in YYYY-MM format"
  }
}
```

Additional error cases:
- Unauthorized request:

```json
{
  "errors": {
    "auth": "Unauthorized"
  }
}
```

## Related Functional Requirements

- FR-001
- FR-002
- FR-003
- FR-004
- FR-005
- FR-006
- FR-007
- FR-008
- FR-010
- FR-011
