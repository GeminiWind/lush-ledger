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
- specs/$1/assets/<screen>.png
- specs/shared/design-tokens.md

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
- Use only tokens defined in `specs/shared/design-tokens.md`
- Do not hardcode visual values
- If a token is missing, report it instead of inventing a new value

Visual Fidelity Rules

For frontend work, functional correctness is not enough.

The implementation must visually match the referenced asset in:
- layout hierarchy
- spacing rhythm
- section grouping
- relative emphasis
- token usage

Do not invent a cleaner or simpler layout.
Do not flatten the design into generic cards and grids.
If the result is correct but visually less refined than the asset, revise it before returning.

After implementation, self-review the result against the provided asset.

Check:
- Is the layout hierarchy visually similar?
- Are spacing and grouping close to the asset?
- Are primary and secondary elements emphasized correctly?
- Does the page feel too boxy, too cramped, or too flat compared to the asset?

If yes, revise before returning.

Return:
- files changed
- completed task IDs
- open questions or mismatches

Extra context:
$ARGUMENTS