# Research: playwright-bdd integration with existing playwright.config.ts

Sources fetched directly (raw GitHub markdown + package.json), not training memory.

## 1. Current config API: `defineBddConfig()` and `createBdd()`

Minimal example (from `docs/getting-started/write-first-test.md`):

```js
// playwright.config.js
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'sample.feature',   // glob/dir for .feature files
  steps: 'steps.js',            // glob/dir for step definitions
});

export default defineConfig({
  testDir,
  reporter: 'html',
});
```

```ts
// steps.js
import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

Given('I am on home page', async ({ page }) => {
  await page.goto('https://playwright.dev');
});
When('I click link {string}', async ({ page }, name) => {
  await page.getByRole('link', { name }).click();
});
Then('I see in title {string}', async ({ page }, keyword) => {
  await expect(page).toHaveTitle(new RegExp(keyword));
});
```

Run with `npx bddgen && npx playwright test` (bddgen generates `.spec.js`/`.spec.ts` files from the `.feature` files into `outputDir` before the normal Playwright runner executes them).

Full `defineBddConfig()` options (from `docs/configuration/options.md`):
- `features: string | string[]` — path(s)/glob to `.feature` files, default ext `*.feature`, resolved relative to config file.
- `steps: string | string[]` — path(s)/glob to step-definition files, default ext `*.{js,mjs,cjs,ts,mts,cts}`, resolved relative to config file.
- `outputDir: string` — default `.features-gen`; directory for generated spec files, relative to config file.
- `tags: string` — Cucumber tag expression to filter scenarios at generation time (e.g. `'@desktop and not @slow'`); overridable via CLI `--tags`.
- `featuresRoot`, `language`, `examplesTitleFormat`, `quotes`, `missingSteps`, `verbose` — secondary options not relevant here.

There is also a `defineBddProject()` helper (see Q3) that wraps `defineBddConfig()` and returns `{ name, testDir }` for use inside `projects[]`.

Generated output is plain Playwright test code, e.g.:
```js
// Generated from: sample.feature
import { test } from 'playwright-bdd';
test.describe('Playwright site', () => {
  test('Check get started link', async ({ Given, When, Then }) => {
    await Given('I am on home page');
    ...
  });
});
```

Source: https://raw.githubusercontent.com/vitalets/playwright-bdd/main/docs/getting-started/write-first-test.md, https://raw.githubusercontent.com/vitalets/playwright-bdd/main/docs/configuration/options.md

## 2. Compatibility with Playwright ^1.59.x

`package.json` peerDependencies: `"@playwright/test": ">=1.44"`. Current playwright-bdd version is **9.2.0**, requires Node.js `>=20`. No upper bound is pinned, so `^1.59.1` satisfies the `>=1.44` peer range — no known incompatibility surfaced in docs or package metadata.

Source: https://raw.githubusercontent.com/vitalets/playwright-bdd/main/package.json (fetched via WebFetch summarization; peerDependencies confirmed as `>=1.44`)

## 3. Interaction with `projects[]` / `dependencies` (MOST IMPORTANT — see caveat below)

`docs/configuration/multiple-projects.md` confirms `defineBddConfig()`'s return value **is** a normal `testDir` string, so it plugs directly into a project's `testDir`:

```ts
export default defineConfig({
  projects: [
    {
      name: 'project-one',
      testDir: defineBddConfig({
        outputDir: '.features-gen/one',
        features: 'project-one/**/*.feature',
        steps: 'project-one/steps/**/*.ts',
      }),
    },
    {
      name: 'project-two',
      testDir: defineBddConfig({
        outputDir: '.features-gen/two',
        features: 'project-two/**/*.feature',
        steps: 'project-two/steps/**/*.ts',
      }),
    },
  ],
});
```
Key requirement: **each project needs its own unique `outputDir`** to avoid one project's generated files overwriting another's (doc explicitly warns: "you should also set a unique `outputDir` for each project to avoid conflicts"). The `defineBddProject()` helper automates this by deriving `outputDir` from the project name and returning `{ name, testDir }` to spread into the project object. Non-BDD projects (e.g. an auth setup project) can coexist in the same config as long as they keep their own `testDir`.

**Caveat / what the docs do NOT explicitly say:** none of the fetched pages (`multiple-projects.md`, `options.md`, `write-first-test.md`, `writing-features/index.md`) mention Playwright's `dependencies: [...]` project field at all — neither confirming nor denying it works with BDD-generated projects. Because `defineBddConfig()` only affects where feature-derived `.spec.ts` files land (i.e., it's purely a `testDir` value) and generated files are consumed by the stock Playwright Test runner exactly like hand-written specs, `dependencies` — which operates at the **project level** (Playwright runs all tests in a dependency project to completion before starting the dependent project) and has no awareness of testDir contents — has no documented reason to behave differently for BDD-generated projects. This is architecturally consistent (`dependencies` is orthogonal to how the project's test files were produced), but it is an inference, not a doc-confirmed guarantee.

Separately, playwright-bdd promotes **Gherkin tags + `--tags` CLI filtering** as its own idiomatic mechanism for slicing which scenarios get generated/run (`docs/writing-features/index.md`): `npx bddgen --tags "@desktop and not @slow" && npx playwright test`, and notes that since Playwright 1.42, Gherkin tags map onto native Playwright tags (usable with Playwright's own `--grep`/tag filtering). This is a *scenario-selection* mechanism, not a *run-order* mechanism — it does not replace `dependencies`' ordering guarantee (run project A to completion, then project B). No doc page frames tags as an alternative to `dependencies` for enforcing spec-file run order.

**Practical implication for this repo's "login depends on register" case:** the existing pattern (`login` project → `dependencies: ["register"]`) should keep working unchanged as long as each BDD project (`register`, `login`, etc.) gets its own `defineBddConfig()`/`defineBddProject()` call with a distinct `outputDir`, and `dependencies` continues to reference project `name`s the same way it does today. This should be verified empirically in a spike/PoC before committing to the migration plan, since no GitHub issue or doc thread explicitly confirms `dependencies` + BDD projects together (issue #166 "Multiple projects with native playwright and BDD" and #372 were checked — both are open questions about mixed BDD/non-BDD or monorepo-shared-config setups, not the dependencies-ordering scenario specifically, and neither had a maintainer-confirmed resolution in the fetched content).

Sources: https://raw.githubusercontent.com/vitalets/playwright-bdd/main/docs/configuration/multiple-projects.md, https://raw.githubusercontent.com/vitalets/playwright-bdd/main/docs/writing-features/index.md, https://github.com/vitalets/playwright-bdd/issues/166, https://github.com/vitalets/playwright-bdd/issues/372

## 4. `webServer` config interaction

No dedicated doc page addresses `webServer` at all — searched `docs/` tree (getting-started, configuration, guides, writing-features, writing-steps, api.md, cli.md, faq.md) and found no mention. This is consistent with the tool's design: `defineBddConfig()`/`bddgen` only affects `testDir`/generated spec files at the file-system level, before the Playwright Test runner starts; `webServer` is a runner-level config option applied identically regardless of whether tests were hand-written or BDD-generated. No special handling should be required for `npm run build && npm run start` as the `webServer.command`.

## 5. Keeping generated output out of other test runners' scan paths (e.g. vitest)

`docs/guides/ignore-generated-files.md` addresses **git-ignore**, not other test-runner exclusion, but the same glob applies directly to vitest's `exclude` config:
```
**/.features-gen/**/*.spec.js
```
(Recommendation is to ignore only the generated `*.spec.js`/`*.spec.ts` files rather than the whole `.features-gen` directory, because Playwright writes snapshot files alongside specs inside that directory that you may want to keep/version; alternatively redirect snapshots elsewhere via `snapshotPathTemplate`.) No playwright-bdd doc page specifically discusses vitest/jest glob collisions — this exclusion pattern is the closest documented guidance and should be added to whatever `exclude`/`testPathIgnorePatterns` vitest config currently causes the `tests/e2e/*.spec.ts` collision, pointed at the chosen `outputDir` (default `.features-gen`, or a custom path if configured).

Source: https://raw.githubusercontent.com/vitalets/playwright-bdd/main/docs/guides/ignore-generated-files.md

## Unresolved / needs a spike before finalizing the plan

1. **Q3 is not doc-confirmed**: whether `projects[].dependencies` (run-order enforcement) works unmodified across BDD-generated projects when each has its own `defineBddConfig()`/`outputDir`. Strongly inferred to work (dependencies operate on project boundaries, not file provenance) but not explicitly stated in docs, and the two related GitHub issues (#166, #372) are unresolved questions about adjacent scenarios (mixed BDD/non-BDD in one config; monorepo shared-config imports), not this exact case. **Recommend a throwaway PoC**: two BDD projects (`register`, `login`) each with their own `defineBddConfig()` call and `dependencies: ['register']` on the `login` project, confirm Playwright still serializes them correctly.
2. No official statement on vitest/jest-specific exclusion — only git-ignore guidance was found; the glob pattern is a reasonable transplant but not doc-verified for that use case.
3. `webServer` interaction is inferred from architecture (no explicit doc section), not directly confirmed by a written statement in the docs.
