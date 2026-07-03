# Phase 01: PoC + tooling install + config scaffold

## Context Links
- Parent plan: [plan.md](./plan.md)
- Research: [playwright-bdd integration](./research/researcher-01-playwright-bdd-integration.md), [Gherkin patterns](./research/researcher-02-gherkin-patterns-state-handoff.md)

## Overview
- Date: 2026-07-02
- Description: Install `playwright-bdd`, and — before touching the real suite — run a throwaway 2-project PoC to confirm `projects[].dependencies` still enforces run order when each project's `testDir` comes from `defineBddConfig()`. This is the load-bearing assumption for the whole plan; if it fails, the plan needs to fall back to a different ordering mechanism (e.g. a single combined project with tagged scenario ordering, or `test.step` sequencing) before Phase 2 starts.
- Priority: P0 within this plan (blocks everything else)
- Implementation status: complete
- Review status: pending user review

## Key Insights
- `defineBddConfig({ features, steps, outputDir })` returns a plain `testDir` string — drops directly into a Playwright `projects[]` entry's `testDir` field.
- Each project needs a **unique `outputDir`** (playwright-bdd docs warn generated files collide otherwise). Use `defineBddProject()` helper to automate deriving `outputDir` from project name.
- `dependencies` is a Playwright Test runner concept (serializes project execution), fully orthogonal to how a project's files were produced — inferred to work, not doc-confirmed. This phase's PoC is the verification step.
- No known `webServer` interaction issues (bddgen only generates files before the runner starts).

## Requirements
### Functional
- `playwright-bdd` installed as a dev dependency, version compatible with `@playwright/test` ^1.59.1 (peer range `>=1.44`, so current pin is fine).
- A throwaway PoC with 2 minimal BDD projects (`poc-a`, `poc-b`) where `poc-b` has `dependencies: ["poc-a"]`, each backed by a trivial `.feature` file, proving Playwright still runs `poc-a` to completion before starting `poc-b`.
### Non-functional
- PoC must be fully removed (feature files, step files, config entries) before Phase 2 — it's a throwaway spike, not part of the shipped suite.

## Architecture
No production architecture yet — this phase only validates a runner-level assumption. If the PoC fails, STOP and re-plan Phase 3 before proceeding (do not silently work around it inside Phase 2/3).

## Related Code Files
### Modify
- `package.json` — add `playwright-bdd` devDependency
- `playwright.config.ts` — temporarily add 2 PoC projects (to be removed after verification)
### Create (temporary, removed at end of phase)
- `tests/e2e/.poc/poc-a.feature`, `tests/e2e/.poc/poc-b.feature`
- `tests/e2e/.poc/steps.ts`

## Implementation Steps
1. `npm install --save-dev playwright-bdd`
2. Create `tests/e2e/.poc/poc-a.feature`: single trivial scenario (e.g. `Given a value is set to "a"` writing to a temp file).
3. Create `tests/e2e/.poc/poc-b.feature`: single trivial scenario asserting the temp file contains `"a"` (fails if `poc-a` hasn't run first).
4. Create `tests/e2e/.poc/steps.ts` with the corresponding `Given`/`Then` step defs using `createBdd()`.
5. Add two temporary projects to `playwright.config.ts`:
   ```ts
   { name: "poc-a", testDir: defineBddConfig({ features: "tests/e2e/.poc/poc-a.feature", steps: "tests/e2e/.poc/steps.ts", outputDir: ".features-gen/poc-a" }) },
   { name: "poc-b", testDir: defineBddConfig({ features: "tests/e2e/.poc/poc-b.feature", steps: "tests/e2e/.poc/steps.ts", outputDir: ".features-gen/poc-b" }), dependencies: ["poc-a"] },
   ```
6. Run `npx bddgen && npx playwright test --project=poc-b` (this should transitively run `poc-a` first due to `dependencies`). Confirm both pass and that `poc-a` genuinely executes before `poc-b` (check reporter output order / timestamps).
7. Run `npx playwright test --project=poc-a` alone too, to confirm it's independently runnable.
8. **Decision gate**: if dependency ordering does NOT work as expected, stop and flag to user — do not proceed to Phase 2 with the current architecture; alternatives to evaluate: single project with ordered `test.step`s reading Gherkin tags, or keep old projects/dependencies but only for non-BDD "setup" specs that call the BDD scenarios programmatically (more invasive, would need a new mini-plan).
9. If PoC succeeds: remove `tests/e2e/.poc/`, the 2 temporary project entries, and any generated `.features-gen/poc-*` output.

## Todo List
- [ ] Install `playwright-bdd`
- [ ] Build PoC feature files + steps
- [ ] Add temporary PoC projects to config
- [ ] Run PoC, confirm dependency ordering works
- [ ] Clean up PoC artifacts
- [ ] Add `.features-gen/` to `.gitignore` (per playwright-bdd guidance: ignore `**/.features-gen/**/*.spec.ts`, not the whole dir, in case snapshots are added later)

## Success Criteria
- `playwright-bdd` installed, version confirmed compatible.
- PoC demonstrates `poc-b` never runs before `poc-a` completes, across 3+ consecutive runs (rule out flake).
- No PoC artifacts remain in the repo after this phase.

## Risk Assessment
- **High**: if dependency ordering doesn't work, Phases 2-4 as currently scoped need rework. This phase exists specifically to surface that risk early and cheaply (throwaway PoC) rather than discovering it mid-migration.
- Low risk otherwise — this phase makes no changes to the real suite.

## Security Considerations
None — test tooling only.

## Next Steps
- On success: proceed to [phase-02-features-and-steps.md](./phase-02-features-and-steps.md).
- On failure: pause, report findings to user, re-scope remaining phases before continuing.
