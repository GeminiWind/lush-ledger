# POST /api/auth/register

## Purpose
Create a new user account with full name, unique email, and secure password, then establish an authenticated session.

## Triggered By
User submits the registration form on `/register`.

## Request
```json
{
  "fullName": "Alex Carter",
  "email": "alex@example.com",
  "password": "StrongPass1!",
  "acceptedTerms": true
}
```

## Success Response

```json
{
  "ok": true
}
```

## Error Response

```json
{
  "error": "Password must be 8 to 72 characters and include uppercase, lowercase, number, and special character.",
  "errors": {
    "password": "Password must be 8 to 72 characters"
  }
}
```

Possible statuses:
- `400` invalid or missing fields
- `409` duplicate email
- `429` throttled attempts (`retryAfterMs` may be present)
- `500` unexpected registration failure

## Related Functional Requirements

* FR-002
* FR-003
* FR-004
* FR-005
* FR-006
* FR-007
* FR-008
* FR-022
* FR-009
* FR-010
* FR-015
* FR-019
* FR-020
* FR-021
