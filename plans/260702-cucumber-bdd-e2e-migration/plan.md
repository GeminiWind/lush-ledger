---
title: "Migrate e2e suite to Gherkin/.feature BDD format via playwright-bdd"
description: "Convert 6 Playwright e2e specs to .feature files with Given/When/Then steps using playwright-bdd, preserving the existing project-dependency run order"
status: complete
priority: P3
effort: 6h
branch: feat/core-component
tags: [testing, e2e, bdd, cucumber, playwright]
created: 2026-07-02
---

# Plan: Cucumber/Gherkin BDD Migration for e2e Suite

## Background
User wants e2e tests converted to Given/When/Then `.feature` files, Cucumber-style. Tooling: `playwright-bdd` (chosen over standalone `@cucumber/cucumber` to preserve the existing `playwright.config.ts` projects/dependencies/webServer setup — see [research](./research/researcher-01-playwright-bdd-integration.md)). Scope: all 6 existing specs (register, login, create-category, update-category, delete-category, ledger-date-grouping).

**Design decision (resolved with user):** keep the current file-based state handoff (`playwright/.e2e/credentials.json`, `category.json`) wrapped in `Background`/`Given` steps, rather than redesigning scenarios to be independently API-seeded. This is a deliberate deviation from strict BDD-scenario-independence best practice ([research](./research/researcher-02-gherkin-patterns-state-handoff.md) §2, Option A) — minimal risk, preserves current test semantics and coverage exactly.

**Open technical risk carried into Phase 1:** whether Playwright's `projects[].dependencies` ordering still works when each project's `testDir` comes from `defineBddConfig()`. Not doc-confirmed either way — must be verified with a throwaway PoC before committing to the full migration.

## Phases

| # | Phase | Status | File |
|---|-------|--------|------|
| 1 | PoC + tooling install + config scaffold | complete | [phase-01-poc-and-config.md](./phase-01-poc-and-config.md) |
| 2 | Author .feature files + shared step definitions | complete | [phase-02-features-and-steps.md](./phase-02-features-and-steps.md) |
| 3 | Wire projects, migrate state handoff, remove old specs | complete | [phase-03-wire-projects-migrate-handoff.md](./phase-03-wire-projects-migrate-handoff.md) |
| 4 | Full suite verification + vitest exclusion | complete | [phase-04-verify-and-exclude.md](./phase-04-verify-and-exclude.md) |

## Key Decisions
- Tooling: `playwright-bdd` v9.2.0 (peer-compatible with `@playwright/test` ^1.59.1, no known conflicts).
- Layout: centralized split — `tests/e2e/features/*.feature` + `tests/e2e/features/steps/*.ts` (shared steps reused across nearly all 6 features; co-location would duplicate them).
- State handoff: kept as-is (JSON files), reused from `tests/e2e/helpers/e2e-credentials.ts` / `e2e-category.ts`, invoked from `Given` steps instead of directly in `.spec.ts` bodies.
- Project dependency chain: unchanged (register → login → create-category → update-category; delete-category → login), each project gets its own `defineBddConfig()`/unique `outputDir` per playwright-bdd's multi-project requirement.
- Generated output: `.features-gen/<project-name>/` at repo root, git-ignored per playwright-bdd's own guidance, vitest `exclude` updated with the same glob to stop the existing vitest/playwright collection collision from also swallowing generated files.

## Validation Summary

**Validated:** 2026-07-02
**Questions asked:** 4

### Confirmed Decisions
- PoC fallback: if Phase 1's dependency-ordering PoC fails, stop and re-plan rather than pre-designing a fallback now.
- `ledger-date-grouping` gets wired to depend on `login`, consistent with the other 5 features (was standalone before).
- Scenario granularity: split each `.feature` file into multiple Scenarios where a flow has distinct assertions, rather than 1 feature = 1 Scenario (deviates from the plan's original "1:1, lowest risk" recommendation — user chose better BDD readability over minimal-diff translation).
- Old `.spec.ts` files deleted in Phase 3 once the new suite is verified equivalent, same session (no separate follow-up).

### Action Items
- [x] Revise `phase-02-features-and-steps.md`: update Gherkin examples/guidance to split each feature into multiple Scenarios by distinct assertion/behavior — done: 10 Scenarios across 6 features, matching the 10 existing `test()` blocks (1 each for register/login/update-category/ledger-date-grouping, 3 each for create-category/delete-category).

## Next Steps
Review phase-01 (contains the PoC that de-risks the rest of the plan), then:
> **Best Practice:** Run `/clear` before implementing to start with fresh context.
> Then run `/cook plans/260702-cucumber-bdd-e2e-migration/plan.md` to begin implementation.
