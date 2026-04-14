---
description: Implement frontend tasks for a feature story
---

Before doing any work:
1. Use the native skill tool to load the `cook` skill.
2. Follow the `cook` skill as the primary implementation workflow for this task.
3. If the `cook` skill is unavailable, stop and report that immediately.

Read:
- specs/$1/spec.md
- specs/$1/plan.md
- specs/$1/tasks.md
- specs/$1/contracts/
- specs/$1/assets/

Execute:
- FE-$2-*
- TEST-FE-$2-*
- FE-owned INT-US1-*


Priority:
1. Follow design assets EXACTLY
2. Follow UI Flow + Transitions
3. Follow UI ↔ API Mapping
4. Follow contracts

Rules:
- Do NOT invent UI
- Do NOT change API
- Only implement FE files
- Do NOT implement backend tasks.


Return:
- files changed
- completed task IDs
- open questions or mismatches

Extra context:
$ARGUMENTS