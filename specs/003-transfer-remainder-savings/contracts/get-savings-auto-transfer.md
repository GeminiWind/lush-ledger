# GET /api/savings/auto-transfer

## Purpose
Return the authenticated user's current month-end auto-transfer configuration and eligible destination plans summary.

## Triggered By
Opening auto-transfer settings in Atelier/Savings UI.

## Request
```json
{}
```

## Success Response

```json
{
  "enabled": true,
  "allocations": [
    {
      "savingsPlanId": "plan_123",
      "percentage": 35
    },
    {
      "savingsPlanId": "plan_456",
      "percentage": 25
    }
  ],
  "allocationTotalPercentage": 60,
  "eligiblePlans": [
    {
      "id": "plan_123",
      "name": "Emergency Fund",
      "status": "active",
      "remainingTargetAmount": 2500000
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

* FR-001
* FR-002
* FR-004
* FR-008
* FR-009
* FR-010
* FR-013
