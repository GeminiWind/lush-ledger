# Phase 03: Wire projects, migrate state handoff, remove old specs

## Context Links
- Parent plan: [plan.md](./plan.md)
- Depends on: [phase-02-features-and-steps.md](./phase-02-features-and-steps.md)
- Research: [playwright-bdd integration](./research/researcher-01-playwright-bdd-integration.md) §3

## Overview
- Date: 2026-07-02
- Description: Replace the 5 hand-written-spec `projects[]` entries in `playwright.config.ts` with BDD-project equivalents (same names, same `dependencies` chain, each with its own `defineBddConfig()`/`outputDir`), confirm the file-based state handoff works correctly when invoked from `Given` steps, then remove the old `.spec.ts` files.
- Priority: P1
- Implementation status: complete
- Review status: pending user review

## Key Insights
- Current chain to preserve exactly: `register` → `login` (depends on register) → `create-category` (depends on login) → `update-category` (depends on create-category); `delete-category` depends on `login` directly. `ledger-date-grouping` currently has no project wiring — decide whether to keep it standalone (depends on `login` only, like `delete-category`) or leave unwired; recommend wiring it to `login` for consistency now that it's a first-class feature.
- Each project needs a **unique `outputDir`** — use `defineBddProject()` helper (wraps `defineBddConfig()`, derives `outputDir` from project name) to avoid manual collision bugs.
- A project's `testDir` will now be its BDD output dir, but `features`/`steps` globs should point at the shared `tests/e2e/features/` tree filtered appropriately (playwright-bdd supports `tags` filtering at generation time if per-project feature-file separation is needed — simpler alternative: keep one `.feature` file per project/scenario as authored in Phase 2, point each project's `features` glob at just its own file).

## Requirements
### Functional
- All 6 flows run as BDD-generated projects with the exact same dependency ordering as today.
- `playwright/.e2e/credentials.json` and `category.json` handoff still works, now triggered from `Given` steps instead of directly in spec bodies.
- `webServer` config unchanged.

### Non-functional
- Old `tests/e2e/*.spec.ts` files removed only after the new suite is verified equivalent (do this at the end of this phase, not before).

## Architecture
```ts
// playwright.config.ts (shape)
import { defineBddProject } from "playwright-bdd";

projects: [
  defineBddProject({ name: "register", features: "tests/e2e/features/register.feature", steps: "tests/e2e/features/steps/**/*.ts" }),
  defineBddProject({ name: "login", features: "tests/e2e/features/login.feature", steps: "tests/e2e/features/steps/**/*.ts", dependencies: ["register"] }),
  defineBddProject({ name: "create-category", features: "tests/e2e/features/create-category.feature", steps: "tests/e2e/features/steps/**/*.ts", dependencies: ["login"] }),
  defineBddProject({ name: "update-category", features: "tests/e2e/features/update-category.feature", steps: "tests/e2e/features/steps/**/*.ts", dependencies: ["create-category"] }),
  defineBddProject({ name: "delete-category", features: "tests/e2e/features/delete-category.feature", steps: "tests/e2e/features/steps/**/*.ts", dependencies: ["login"] }),
  defineBddProject({ name: "ledger-date-grouping", features: "tests/e2e/features/ledger-date-grouping.feature", steps: "tests/e2e/features/steps/**/*.ts", dependencies: ["login"] }),
]
```
(Exact `defineBddProject()` return shape/options to be confirmed against installed package version's types during implementation — Phase 1's PoC already exercises this helper.)

## Related Code Files
### Modify
- `playwright.config.ts` — replace 5 `projects[]` entries with 6 `defineBddProject()`-based ones (adds `ledger-date-grouping` as a named project)
### Delete (end of phase, after verification)
- `tests/e2e/register.spec.ts`
- `tests/e2e/login.spec.ts`
- `tests/e2e/create-category.spec.ts`
- `tests/e2e/update-category.spec.ts`
- `tests/e2e/delete-category.spec.ts`
- `tests/e2e/ledger-date-grouping.spec.ts`

## Implementation Steps
1. Update `playwright.config.ts` per the Architecture shape above.
2. Run `npx bddgen` — confirm all 6 projects generate without errors, each into its own `outputDir`.
3. Run `npx playwright test --project=register` alone, then `--project=login` alone (should transitively run `register` first) — confirm state handoff (credentials.json) round-trips correctly through the new `Given`-step-based flow.
4. Run the full chain: `npx playwright test --project=update-category` (should transitively run register→login→create-category→update-category) and `--project=delete-category`, `--project=ledger-date-grouping`.
5. Compare pass/fail and assertion coverage against a fresh run of the OLD suite (`git stash` the config changes temporarily, run old suite, unstash) to confirm no regression before deleting anything.
6. Delete the 6 old `.spec.ts` files once the new suite is confirmed equivalent.

## Todo List
- [x] Update `playwright.config.ts` with 6 BDD projects + preserved dependency chain
- [x] `npx bddgen` succeeds for all 6 projects with unique outputDirs
- [x] Individual project runs pass (register, login alone)
- [x] Full dependency-chain runs pass (update-category, delete-category, ledger-date-grouping)
- [x] Side-by-side comparison against old suite shows no coverage regression
- [x] Old `.spec.ts` files deleted

## Actual Findings (deviations from the plan as written)
- **`ledger-date-grouping` was never actually executed by the old suite**: it had no `testMatch` entry in any of the 5 old projects, so `npm run test:e2e` silently never ran it. Old-suite baseline via `git stash` on `playwright.config.ts` confirms: 9/9 passed, `ledger-date-grouping.spec.ts` not among them.
- Wiring it to `login` (per the plan's confirmed decision) exposed a **pre-existing gap**: the test asserted "Today"/"Yesterday" ledger-grouping headers but never seeded any transactions for those dates — it implicitly relied on stale local state from manual runs. Verified this is not a migration regression by running the original `.spec.ts` directly against a fresh e2e user (bypassing the BDD translation entirely) — it failed identically. Per user decision, added a new `Given two ledger transactions exist dated today and yesterday` step (API-seeded via `page.evaluate(fetch(...))`, same pattern as `delete-category`'s ledger steps) to `ledger-date-grouping.feature`, making the scenario self-sufficient.
- That seeding step initially had a **timezone bug**: used `date.toISOString().slice(0, 10)` (UTC date) while the app groups "Today"/"Yesterday" using local time (Luxon `DateTime` default zone in `src/lib/date.ts`). On this container (UTC+7, early morning at test time), UTC was still the previous day, silently shifting both seeded transactions back a day. Fixed with a local-date formatter (`toLocalISODate`) instead of `toISOString()`.
- Final suite: **10/10 passed** in a single clean run (fresh credentials/category files), vs. old suite's 9/9 — net coverage increase (delete-category's `ledger-date-grouping` now actually runs), no regression.

## Success Criteria
- `npx playwright test` (all projects) passes 10/10 (6 projects, 10 Scenarios) — exceeds the old suite's 9/9 baseline since `ledger-date-grouping` is now wired in and actually executes for the first time.
- Dependency ordering verified stable: register→login→create-category→update-category and register→login→delete-category / →ledger-date-grouping all confirmed via direct project runs.

## Risk Assessment
- Medium: `defineBddProject()`'s exact option surface may differ slightly from the sketch above depending on installed version — verify against actual TypeScript types during implementation, don't guess.
- Low: state handoff logic itself is unchanged (same JSON helper functions), only the call site moves from spec body to step body.

## Security Considerations
None — test tooling only, same throwaway e2e credentials as before.

## Next Steps
- Proceed to [phase-04-verify-and-exclude.md](./phase-04-verify-and-exclude.md) for full-suite verification and vitest exclusion cleanup.
