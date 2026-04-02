# Savings Plan Status Flow

This document defines the expected lifecycle for a savings plan in Lush Ledger.

## Status lifecycle

`active` -> `funded` -> `completed` -> `archive`

Alternate branch:

`active` -> `cancelled`
`funded` -> `cancelled`

## Transition rules

1. **Create plan**
   - A newly created plan starts as `active`.

2. **Add contribution**
   - When at least one contribution is added, UI-derived status becomes `funded`.

3. **Reach target**
   - When saved amount reaches or exceeds target amount, UI-derived status becomes `completed`.

4. **Archive completed plans**
   - `completed` plans cannot be cancelled.
   - `completed` plans should only move to `archive`.

5. **Cancel eligibility**
   - Cancellation is allowed only when plan is `active` or `funded`.
   - `cancelled` is a terminal state for that plan lifecycle.

## UX/API behavior notes

- Cancel action is shown only for `active` and `funded` plans.
- Cancel flow creates a refund transaction that returns saved amount to the default wallet.
- `funded` and `completed` are currently derived from saved progress on the savings view.
