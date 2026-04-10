# GET /api/savings/auto-transfer/latest-run

## Purpose
Return the authenticated user's latest month-end auto-transfer execution outcome for UI status and support visibility.

## Triggered By
Loading latest run status panel in Atelier/Savings pages.

## Request
```json
{}
```

## Success Response

```json
{
  "monthStart": "2026-04-01",
  "timezone": "Asia/Ho_Chi_Minh",
  "status": "applied",
  "remainderAmount": 5000000,
  "allocationTotalPercentage": 60,
  "planResults": [
    {
      "savingsPlanId": "plan_123",
      "configuredPercentage": 35,
      "calculatedAmount": 1750000,
      "appliedAmount": 1500000,
      "status": "applied",
      "skipReason": null,
      "transactionId": "txn_987"
    },
    {
      "savingsPlanId": "plan_456",
      "configuredPercentage": 25,
      "calculatedAmount": 1250000,
      "appliedAmount": 1250000,
      "status": "applied",
      "skipReason": null,
      "transactionId": "txn_988"
    }
  ]
}
```

## Error Response

```json
{
  "errors": {
    "auth": "Unauthorized"
  }
}
```

## Related Functional Requirements

* FR-005
* FR-006
* FR-007
* FR-008
* FR-011
* FR-012
* FR-013
* FR-014
