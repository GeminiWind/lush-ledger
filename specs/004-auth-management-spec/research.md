# Research: Authentication Management

## Decision 1: Password Composition Policy for Registration

- Decision: Registration passwords must include uppercase, lowercase, numeric, and special characters, with minimum length 8 and maximum length 72.
- Rationale: The spec explicitly requires all four character classes; minimum 8 is compatible with current UX expectations, and maximum 72 aligns with bcrypt input handling limits in the current auth stack.
- Alternatives considered:
  - Minimum length 10 or 12: stronger but introduces additional user friction not requested in scope.
  - No max length bound: can cause confusing behavior with hash algorithm limits.

## Decision 2: Email Normalization and Uniqueness Behavior

- Decision: Normalize emails by trimming whitespace and lowercasing before validation and persistence; uniqueness checks use normalized value.
- Rationale: Prevents duplicate accounts from casing/spacing variants and matches existing route-handler behavior.
- Alternatives considered:
  - Case-sensitive uniqueness: allows confusing duplicate identities.
  - Trim only without lowercasing: still permits ambiguous duplicates.

## Decision 3: Auth Error Messaging Model

- Decision: Use field-level errors for validation failures and form-level generic errors for credential failures/system errors.
- Rationale: Meets UX clarity goals while avoiding sensitive disclosures (for example, whether an account exists during login failure).
- Alternatives considered:
  - Fully generic errors for all failures: secure but less actionable for form correction.
  - Highly specific login errors (user-not-found vs wrong-password): clearer but leaks account existence signals.

## Decision 4: Auth Route Redirect Handling

- Decision: Preserve redirect behavior so authenticated users are redirected away from `/login` and `/register` to `/app`.
- Rationale: Already aligned with current auth context and middleware patterns; keeps canonical user flow consistent.
- Alternatives considered:
  - Allow authenticated access to auth pages: adds confusion and duplicate navigation states.
  - Redirect to previous page only: less predictable for first-load and direct-entry scenarios.

## Decision 5: API Contract Shape for Login/Register

- Decision: Keep compact success response (`{ ok: true }`) and standardize error responses around top-level `error` plus optional field details for validation use cases.
- Rationale: Works with current auth client error extraction and minimizes UI-side parsing complexity.
- Alternatives considered:
  - Rich nested envelope for all responses: more expressive but unnecessary complexity for current auth scope.
  - Status-code-only responses with no body: weak UX because UI cannot present clear messages.
