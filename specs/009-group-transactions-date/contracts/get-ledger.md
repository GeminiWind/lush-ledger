# GET /api/ledger

## Purpose

Return authenticated user's ledger transactions and filter metadata required for the ledger activity UI.

## Triggered By

- User opens `/app/ledger`.
- User applies search/filter inputs that refresh ledger results.

## Request

Query params (existing):
- `query` (optional string)
- `type` (optional enum)
- `accountId` (optional string)
- `categoryId` (optional string)
- `startDate` (optional date string)
- `endDate` (optional date string)

Headers:
- authenticated session required

## Success Response

`200 OK`

```json
{
  "summary": {
    "monthExpense": 79250000
  },
  "transactions": [
    {
      "id": "tx_123",
      "date": "2026-05-04T08:45:00.000Z",
      "amount": "318000",
      "type": "expense",
      "notes": "Coffee",
      "account": { "id": "acc_1", "name": "Personal Card" },
      "category": { "id": "cat_1", "name": "Food", "icon": "coffee" }
    }
  ],
  "accounts": [],
  "categories": []
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

### Validation / Request Error

`400 Bad Request`

```json
{
  "error": "Invalid request.",
  "errors": {
    "field": "message"
  }
}
```

### Server Failure

`500 Internal Server Error`

```json
{
  "error": "Unable to load ledger data."
}
```

## UI Contract Notes

- Client derives headers as: `Today`, `Yesterday`, then older locale-formatted calendar dates.
- API does not return pre-grouped buckets.
- `transactions[].date` is mandatory for correct grouping.

## Related Functional Requirements

- FR-001, FR-002, FR-003, FR-004, FR-005
- FR-007, FR-008, FR-009, FR-010, FR-011, FR-012, FR-013
