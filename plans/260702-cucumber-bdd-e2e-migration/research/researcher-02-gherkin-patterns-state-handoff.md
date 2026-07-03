# Research: Gherkin Patterns & Cross-Scenario State Handoff

## 1. Idiomatic Given/When/Then structure

**Auth — register:**
```gherkin
Feature: Account registration

  Scenario: Register a new account
    Given I am on the registration page
    When I fill in the registration form with a unique email and password "Aa!12345"
    And I accept the terms
    And I submit the registration form
    Then I should be redirected to the app dashboard
    And my account credentials should be usable for login
```

Translating the existing `register.spec.ts` actions:
```gherkin
  Scenario: Register a new account with valid details
    Given I am on the "/register" page
    When I fill "Full Name" with "E2E Register User"
    And I fill "Email" with a unique generated email
    And I fill "Password" with "Aa!12345"
    And I fill "Confirm Password" with "Aa!12345"
    And I check "Accept terms"
    And I click "Join the Atelier"
    Then I should be redirected to "/app"
```
`page.getByRole("checkbox", { name: "Accept terms" }).check()` → `And I check "Accept terms"` (a reusable `I check {string}` step wrapping `getByRole('checkbox', {name}).check()`). Field fills collapse into a reusable `I fill {string} with {string}` step keyed off label/name mapping, or a Data Table for multi-field forms:
```gherkin
    When I fill in the registration form:
      | Full Name        | E2E Register User |
      | Email             | <generated>        |
      | Password          | Aa!12345            |
      | Confirm Password  | Aa!12345            |
```

**Auth — login:**
```gherkin
  Scenario: Log in with valid credentials
    Given a registered user exists
    When I log in with their email and password
    And I check "Remember me"
    Then I should be redirected to "/app"
```

**CRUD — category:**
```gherkin
Feature: Budget category management

  Background:
    Given I am logged in

  Scenario: Create a budget category
    When I create a category named "Groceries"
    Then the category "Groceries" should appear in the category list

  Scenario: Update a budget category
    Given a category named "Groceries" exists
    When I rename the category "Groceries" to "Household"
    Then the category "Household" should appear in the category list

  Scenario: Delete a budget category
    Given a category named "Groceries" exists
    When I delete the category "Groceries"
    Then the category "Groceries" should not appear in the category list
```

Sources: general Gherkin/BDD style guidance from BrowserStack and TestQuality (cited in §2) — no playwright-bdd-specific Gherkin style guide was found; the syntax itself is plain Cucumber/Gherkin, playwright-bdd only affects the runner/step-definition layer, not Gherkin phrasing conventions.

## 2. Cross-scenario/cross-feature state dependency — FLAG FOR USER DECISION

This is a genuine design fork; I did not pick one.

**What BDD/Cucumber best-practice sources say:** Scenarios (and by extension `.feature` files) should be independent and runnable in isolation, in any order, without relying on another scenario's side effects. Sources describe this as a core reliability principle — a failing/skipped scenario should never cascade into unrelated failures — and recommend `Background:` for shared *preconditions expressed as steps*, not for reusing literal state objects mutated by a prior scenario. The standard alternatives to run-order-based state reuse are: (a) a `Background` whose Given step performs setup itself (e.g., calls an API to register+login) rather than reading a file written by another spec; (b) a custom World/fixture that programmatically creates a user via API calls in a `Before`/`BeforeScenario` hook; (c) Playwright's native `storageState` fixture to reuse an authenticated session without going through the UI each time. None of the sources found endorse Playwright `projects`+`dependencies` run-ordering as a BDD testing pattern — that's a Playwright-runner mechanism orthogonal to Gherkin/Cucumber semantics, and cucumber-style suites generally assume scenarios can be parallelized/reordered by the runner, which the file-handoff chain would break.

**Option A — Keep the file-based chain, translate into Background/Given steps that read JSON** (minimal change):
- Pros: fastest migration, preserves current test semantics exactly, no risk of introducing new bugs in setup logic, reuses `helpers/e2e-credentials.ts` as-is.
- Cons: not idiomatic BDD — scenarios still can't run standalone, still require Playwright `projects`+`dependencies` (or manual ordering) to guarantee register→login→create→update sequencing, breaks if run with `--grep` on a subset, harder to parallelize, and the "why" of a scenario reading a mystery JSON file is not expressed in Gherkin (violates BDD's goal of tests-as-living-documentation).

**Option B — Redesign each Scenario/feature to be self-sufficient via API-driven `Background` setup** (more idiomatic):
- Pros: each `.feature` runs independently/in parallel, aligns with Cucumber best practice, Gherkin steps like `Given a registered user exists` can be made literally true via a fixture/hook, easier to read as documentation.
- Cons: more implementation work (needs a `Before`/fixture that calls the real register+login flow via API or UI and returns a session/storageState), changes what's being tested (e.g., update-category.spec.ts today exercises "log in via UI then edit a category previously created via UI"; making it self-sufficient likely means seeding the category via API, which is a different flow than what's covered today — testing depth/scope changes), and requires deciding whether "log in" itself should remain a UI scenario or become setup plumbing.

Recommend surfacing this explicitly to the user before the migration plan finalizes: "keep chain via JSON+Background" vs "redesign into independent API-seeded scenarios."

## 3. Sharing data within vs across scenarios in playwright-bdd

playwright-bdd's `createBdd(test)` binds step definitions to Playwright's fixture system rather than a Cucumber World by default — fixtures (`page`, `request`, `browser`, plus BDD fixtures like `$testInfo`, `$tags`) are injected as parameters into `Given/When/Then` functions, resolved automatically from the function signature (similar to how Playwright resolves fixtures in `test()`).

- **Within one scenario:** define a custom Playwright fixture (e.g., `testData` or a scenario-scoped object) via `test.extend(...)`, then request it as a parameter in each step — this fixture is scoped per-test (per-scenario), so state set in one step is visible in later steps of the same scenario and is automatically reset between scenarios. This is the recommended pattern going forward.
- **Cucumber-style compatibility mode** also exists: `createBdd(test, { worldFixture: 'myWorld' })` lets steps use `this` (a World object, e.g. extending `BddWorld`) to stash values like `this._context['order_search_response']` — offered for teams porting existing CucumberJS-style step files, but the fixture-based approach is the native/idiomatic playwright-bdd pattern.
- **Across scenarios/features:** neither World nor per-scenario fixtures persist data — by design, each scenario gets a fresh fixture instance. Cross-scenario sharing must go through an explicit external mechanism: `storageState` files (Playwright's own auth-session reuse), a `BeforeAll`/worker-scoped fixture that seeds shared data once, or (as today) files on disk — but the last option is exactly what §2 flags as non-idiomatic for scenario independence.

Sources: [Question: Custom fixtures in `Cucumber-style steps` #214](https://github.com/vitalets/playwright-bdd/issues/214), [Hooks and Fixtures | DeepWiki](https://deepwiki.com/vitalets/playwright-bdd/4.3-hooks-and-fixtures), [Step Definitions | DeepWiki](https://deepwiki.com/vitalets/playwright-bdd/4.2-step-definitions), [On version 7, is World still supported? #236](https://github.com/vitalets/playwright-bdd/issues/236)

## 4. Recommended file/folder layout

playwright-bdd's own test fixtures/examples show **both** patterns in use, i.e. no single mandated layout, but two common shapes appear:

- **Co-located per-feature**: `features/todo/todo.feature` next to `features/todo/steps.ts` — steps live alongside the one feature they implement.
- **Centralized split**: `features/*.feature` files at the top level with a parallel `features/steps/` directory containing `steps.ts`, `fixtures.ts`, and supporting page objects (e.g. `features/steps/TodoPage.ts`), used when step definitions are shared across multiple `.feature` files.

For lush-ledger's 6 small, mostly-independent specs (register, login, create/update/delete-category, ledger-date-grouping), the centralized split (`e2e/features/*.feature` + `e2e/features/steps/*.ts`) is the better fit since login/checkbox/form-fill steps will be reused across nearly every feature file — co-locating would force duplicating those shared steps per folder. Reserve co-location only if a feature's steps are genuinely feature-specific (e.g. `ledger-date-grouping.feature` assertions).

Sources: [vitalets/playwright-bdd GitHub](https://github.com/vitalets/playwright-bdd), [Playwright-BDD documentation](https://vitalets.github.io/playwright-bdd/) (SPA — index page had no static content fetchable; DeepWiki mirrors used instead), [BrowserStack — Cucumber Best Practices](https://www.browserstack.com/guide/cucumber-best-practices-for-testing), [TestQuality — Gherkin/BDD/Cucumber Guide](https://testquality.com/gherkin-bdd-cucumber-guide-to-behavior-driven-development/)
