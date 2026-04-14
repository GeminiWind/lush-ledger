# POST /api/auth/login

## Purpose
Authenticate an existing user with email and password and establish an authenticated session.

## Triggered By
User submits the login form on `/login`.

## Request
```json
{
  "email": "user@example.com",
  "password": "SecurePass1!",
  "remember": true
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
  "error": "Invalid credentials."
}
```

Possible statuses:
- `400` missing required fields
- `401` invalid credentials
- `429` throttled attempts (`retryAfterMs` may be present)

## Related Functional Requirements

* FR-001
* FR-003
* FR-011
* FR-015
* FR-018
* FR-020
