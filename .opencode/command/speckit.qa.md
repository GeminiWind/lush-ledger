---
description: Validate feature story with QA checks
---

Validate feature: $1
Story: $2

Read:
- specs/$1/spec.md
- specs/$1/plan.md
- specs/$1/tasks.md
- specs/$1/contracts/
- current frontend code
- current backend code

Execute:
- TEST-E2E-US1-*
- any remaining validation tasks
- shared validation INT-* tasks if applicable

Check:
- UI matches spec and assets
- API matches contracts
- FE/BE integration works
- structured errors map correctly to UI

Return:
- tests added
- test results
- mismatches
- suggested fixes

Extra context:
$ARGUMENTS