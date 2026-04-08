# PUT /api/savings/auto-transfer

## Purpose
Create or update the authenticated user's month-end auto-transfer rule.

## Triggered By
User submits auto-transfer settings form.

## Request
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
  ]
}
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
  "status": "saved"
}
```

## Error Response

```json
{
  "errors": {
    "allocations": "At least one allocation is required",
    "allocations[0].percentage": "Must be between 1 and 100",
    "allocationTotalPercentage": "Total must be between 1 and 100",
    "allocations[1].savingsPlanId": "Plan must be active/funded, unique, and belong to current user"
  }
}
```

## Related Functional Requirements

* FR-001
* FR-002
* FR-004
* FR-003
* FR-009
* FR-010
* FR-015
* FR-016
