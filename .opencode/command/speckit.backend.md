---
description: Implement backend tasks for a feature story
---

Before doing any work:
1. Use the native skill tool to load the `cook` skill.
2. Follow the `cook` skill as the primary implementation workflow for this task.
3. If the `cook` skill is unavailable, stop and report that immediately.

Implement backend for feature: $1
Story: $2

Read:
- specs/$1/plan.md
- specs/$1/data-model.md
- specs/$1/tasks.md
- specs/$1/contracts/

Execute:
- BE-$2-*
- TEST-BE-$2-*

Rules:
- follow contracts exactly
- enforce FR rules
- return structured errors
- do not implement frontend tasks

Return:
- files changed
- completed task IDs
- contract or schema mismatches

Extra context:
$ARGUMENTS