# Phase 02: Author .feature files + shared step definitions

## Context Links
- Parent plan: [plan.md](./plan.md)
- Depends on: [phase-01-poc-and-config.md](./phase-01-poc-and-config.md) (PoC must pass first)
- Research: [Gherkin patterns](./research/researcher-02-gherkin-patterns-state-handoff.md) §1, §3, §4

## Overview
- Date: 2026-07-02
- Description: Write `.feature` files for all 6 flows and the shared/per-feature step definitions that implement them, reusing existing e2e helpers and locator strategies (incl. `getByRole("checkbox", {name})` for the custom Checkbox component).
- Priority: P1
- Implementation status: complete
- Review status: pending user review

## Key Insights
- Layout: centralized split — `tests/e2e/features/*.feature` + `tests/e2e/features/steps/*.ts` (shared steps reused across nearly all 6 features per research recommendation).
- `createBdd(test)` binds `Given`/`When`/`Then` to Playwright fixtures (`page`, `request`, etc.) — no need for a Cucumber World; fixtures resolve by parameter name same as `test()`.
- Existing UI has 2 checkbox fields using the custom `<button role="checkbox">` component: register's "Accept terms" (has explicit `aria-label`) and login's "Remember this session" (relies on label-wrap accessible name) — reuse `page.getByRole("checkbox", { name })` in a shared `I check {string}` step, matching the locators already fixed in `tests/e2e/register.spec.ts`/`login.spec.ts` this session.
- All other form fields (email, password, fullName, confirmPassword, name, monthlyLimit) are native `<input name="...">` — a shared `I fill {string} with {string}` step can key off `name` attribute directly (or a label→name lookup map, simpler: keep using `input[name="..."]`-equivalent via `page.locator(...)` since these aren't going away).

## Requirements
### Functional
- One `.feature` file per existing spec (6 total): `register.feature`, `login.feature`, `create-category.feature`, `update-category.feature`, `delete-category.feature`, `ledger-date-grouping.feature`.
- **Scenario granularity (per validation decision):** split each feature into multiple `Scenario`s by distinct assertion/behavior, matching the current 1:1 mapping to existing `test(...)` blocks (several spec files already contain more than one `test()` — those become sibling Scenarios rather than one monolithic Scenario). Concretely, 10 Scenarios total across 6 features:
  - `register.feature` — 1 Scenario (source has one `test()`): "Register with valid details redirects to the app and stores credentials" — field-value/checkbox/form-ready assertions stay inline in this one Scenario since they gate the same submit action, not a distinct behavior.
  - `login.feature` — 1 Scenario (source has one `test()`): "Log in with valid stored credentials redirects to the app".
  - `create-category.feature` — 3 Scenarios, matching the 3 `test()`s in `create-category.spec.ts`: "Create a category from the atelier", "Create category shows validation errors for invalid input", "Unauthorized user is redirected to login".
  - `update-category.feature` — 1 Scenario (source has one `test()`): "Update an existing category's name and monthly limit".
  - `delete-category.feature` — 3 Scenarios, matching the 3 `test()`s in `delete-category.spec.ts`: "Delete success removes category from active atelier list", "Delete cancel keeps category unchanged", "Delete in-use category preserves ledger entry via Uncategorized" (this last one needs a `When`/`Then` step that calls `/api/ledger` and `/api/categories` directly via `request`/`page.evaluate`, preserving the existing API-driven assertions — do not simplify away the API calls).
  - `ledger-date-grouping.feature` — 1 Scenario (source has one `test()` inside a `describe`): "Today and Yesterday headers appear in the correct order for mixed-date transactions".
- Shared step definitions for: navigation (`Given I am on the "..." page`), field fill, checkbox check, button click, URL assertion, form-ready assertion (`data-client-ready="true"`).
- State-handoff steps (per Phase 3's design, implemented here as step bodies): `Given a registered user exists` (reads `credentials.json`), `Given I am logged in` (performs login using those credentials), `Given a category named {string} exists` (reads `category.json`).
- Preserve all existing assertions from the current `.spec.ts` files (nothing gets weaker) — e.g. `toHaveValue`, `toBeChecked`, `toHaveURL` with the same regex/timeout values.

### Non-functional
- Step definitions must stay small and composable — no giant catch-all steps; reuse across features is the point of the centralized layout.

## Architecture
```
tests/e2e/features/
  register.feature
  login.feature
  create-category.feature
  update-category.feature
  delete-category.feature
  ledger-date-grouping.feature
  steps/
    navigation.steps.ts      (Given I am on "..." page / And I wait for the page to be ready)
    form.steps.ts            (When I fill "..." with "..." / And I check "...")
    assertions.steps.ts      (Then I should be redirected to "..." / field value/checked assertions)
    auth.steps.ts            (Given a registered user exists / Given I am logged in — wraps e2e-credentials.ts)
    category.steps.ts        (Given a category named "..." exists — wraps e2e-category.ts)
```

## Related Code Files
### Create
- `tests/e2e/features/register.feature`
- `tests/e2e/features/login.feature`
- `tests/e2e/features/create-category.feature`
- `tests/e2e/features/update-category.feature`
- `tests/e2e/features/delete-category.feature`
- `tests/e2e/features/ledger-date-grouping.feature`
- `tests/e2e/features/steps/navigation.steps.ts`
- `tests/e2e/features/steps/form.steps.ts`
- `tests/e2e/features/steps/assertions.steps.ts`
- `tests/e2e/features/steps/auth.steps.ts`
- `tests/e2e/features/steps/category.steps.ts`
- `tests/e2e/features/steps/scenario-fixtures.ts` (added during implementation, not in original sketch): a `test.extend()`-based Playwright fixture (`scenarioContext`) holding runtime-generated values (email, category name/id, ledger note) that must flow from one step to a later step within the *same* scenario (e.g. register's generated email, delete-category's API-returned category id used later to seed a ledger entry). Module-level `let` variables were rejected because Playwright's `fullyParallel: true` config can run scenarios concurrently within a worker, which would leak state across concurrent scenarios; a per-test fixture is scenario-scoped and safe. Bound into `auth.steps.ts` and `category.steps.ts` only — `playwright-bdd`'s `ImportTestGuesser` auto-detects and imports this custom test in generated files that use it.
- `tests/e2e/features/steps/step-helpers.ts` (added during implementation): small pure helpers (`escapeRegExp`, `actionButtonPattern`, `buildUniqueEmail`, `REGISTER_PASSWORD`) shared across step files, avoiding duplicating the same 3-line regex-building logic in 3 places.
### Reference (unchanged, reused from step defs)
- `tests/e2e/helpers/e2e-credentials.ts`
- `tests/e2e/helpers/e2e-category.ts`

## Implementation Steps
1. Write `register.feature` — translate `register.spec.ts` 1:1: fill fullName/email/password/confirmPassword, check "Accept terms", assert field values, assert form ready, click "Join the Atelier", assert redirect to `/app`, then a final step that writes credentials via the existing helper (keep this explicit in Gherkin, e.g. `Then my credentials should be saved for later scenarios`).
2. Write `login.feature` — `Given a registered user exists` (reads credentials.json), fill email/password, check "Remember this session", assert values, click "Sign In", assert redirect.
3. Write `create-category.feature`, `update-category.feature`, `delete-category.feature` — each starts with `Given I am logged in` (uses credentials.json), CRUD action, assertion; create-category ends by saving the category name via the existing helper.
4. Write `ledger-date-grouping.feature` — `Given I am logged in`, then whatever grouping assertions the original spec makes (read `tests/e2e/ledger-date-grouping.spec.ts` for exact current assertions before translating).
5. Implement step files, one concern per file as laid out in Architecture. Reuse `getByRole("checkbox", {name})` exactly as already fixed in the current specs.
6. Run `npx bddgen` locally after each feature file to catch missing-step errors early (playwright-bdd reports undefined steps at generation time, not just at test run time).

## Todo List
- [x] Write all 6 `.feature` files
- [x] Implement `navigation.steps.ts`, `form.steps.ts`, `assertions.steps.ts`
- [x] Implement `auth.steps.ts` (wraps `e2e-credentials.ts`)
- [x] Implement `category.steps.ts` (wraps `e2e-category.ts`)
- [x] `npx bddgen` runs clean with zero "missing step" errors (verified via a temporary validation-only config, removed after confirming; the real per-project wiring is Phase 3's job)

## Success Criteria
- `npx bddgen` generates spec files for all 6 features (10 Scenarios total, per the granularity above) with no undefined-step warnings.
- Generated spec file assertions match the original `.spec.ts` files' assertions 1:1 (no coverage regression) — do a manual side-by-side diff before Phase 3.

## Risk Assessment
- Medium: translating implicit Playwright actions into readable Gherkin without losing precision (e.g. exact timeout values like `{ timeout: 20_000 }` on URL assertions) — carry these through as step parameters or constants, don't drop them.
- Low: step definition reuse is additive, doesn't touch existing `.spec.ts` files yet (those are removed in Phase 3, after the new suite is proven).

## Security Considerations
None beyond what the original specs already covered (test credentials are throwaway e2e accounts).

## Next Steps
- Proceed to [phase-03-wire-projects-migrate-handoff.md](./phase-03-wire-projects-migrate-handoff.md) once all 6 features generate cleanly.
