# Phase 04: Full suite verification + vitest exclusion

## Context Links
- Parent plan: [plan.md](./plan.md)
- Depends on: [phase-03-wire-projects-migrate-handoff.md](./phase-03-wire-projects-migrate-handoff.md)
- Research: [playwright-bdd integration](./research/researcher-01-playwright-bdd-integration.md) §5
- Related prior finding this session: `npm run test` (vitest) currently errors trying to collect `tests/e2e/*.spec.ts` files ("Playwright Test did not expect test() to be called here") — a pre-existing collision, not caused by this migration, but the new `.features-gen/` output must not make it worse.

## Overview
- Date: 2026-07-02
- Description: Final verification pass — full e2e suite green, vitest no longer touches any Playwright-generated files (existing collision fixed or at minimum not worsened), `.gitignore`/docs updated.
- Priority: P2
- Implementation status: complete
- Review status: pending user review

## Key Insights
- playwright-bdd's own guidance: git-ignore `**/.features-gen/**/*.spec.ts` (not the whole dir, in case snapshots land there later) — same glob pattern should be added to vitest's `exclude` config.
- The pre-existing vitest/playwright collision (vitest globbing `tests/e2e/*.spec.ts`) should ideally be fixed as part of this phase too, since this migration removes those files anyway (Phase 3) — confirm whether vitest's config already excludes `tests/e2e/` after the old specs are gone, or whether an explicit exclude is still needed for `.features-gen/`.

## Requirements
### Functional
- `npm run test` (vitest) runs clean with zero collection errors, and zero involvement of any Playwright/BDD file.
- `npx playwright test` (full suite, all 6 projects) passes 100%.
- `.gitignore` updated for `.features-gen/`.

### Non-functional
- Update `docs/code-standards.md`'s testing section (mentions Vitest + Playwright) and any e2e-related doc mentions to describe the new `.feature`-based structure, per the project's "keep docs in sync in the same PR" convention.

## Architecture
No new architecture — this phase is verification + cleanup only.

## Related Code Files
### Modify
- `vitest.config.ts` (or wherever `exclude` is configured) — add `.features-gen/**` exclusion if not already covered by removing `tests/e2e/*.spec.ts`
- `.gitignore` — add `**/.features-gen/**/*.spec.ts`
- `docs/code-standards.md` — update testing section to mention `.feature` files / playwright-bdd
- `README.md` — update e2e testing instructions if it currently references `.spec.ts` files directly

## Implementation Steps
1. Run `npm run test` (vitest) — confirm it no longer attempts to collect any e2e-related file (old `.spec.ts` are gone per Phase 3; confirm `.features-gen/` isn't globbed either).
2. Add `.features-gen/` glob to `.gitignore`.
3. Run `npx playwright test` (full suite) 3 times consecutively to check for flake in the dependency-ordered chain.
4. Update `docs/code-standards.md` and `README.md` e2e sections to describe: `.feature` files live in `tests/e2e/features/`, run via `npx bddgen && npx playwright test`, step definitions in `tests/e2e/features/steps/`.
5. Run `npm run lint` and `npx tsc --noEmit` to confirm no new type/lint errors from the new step-definition files.

## Todo List
- [x] `npm run test` clean, zero e2e file collection
- [x] `.gitignore` updated (also fixed a Phase 1 mistake: pattern was `*.spec.ts`, generated files are actually `*.spec.js`)
- [x] Full e2e suite passes 3/3 consecutive runs (10/10 each run)
- [x] Docs updated (`code-standards.md`, `README.md`)
- [x] Lint + typecheck clean

## Actual Findings (deviations from the plan as written)
- Vitest's pre-existing `tests/e2e/*.spec.ts` collision resolved itself once Phase 3 deleted those files — no explicit vitest config change was needed for that specific collision. Added `**/.features-gen/**` to `vitest.config.ts`'s `exclude` anyway as defensive hardening (not currently reachable by `include`, but cheap insurance if that ever changes).
- `npm run test:e2e` did **not** actually regenerate BDD specs before running Playwright (script was just `playwright test`) — fixed both `test:e2e` and `test:e2e:headed` in `package.json` to run `bddgen &&` first, since the code-standards doc now documents `npm run test:e2e` as the one-command entry point.
- ESLint flagged a false positive in `scenario-fixtures.ts`: `react-hooks/rules-of-hooks` misidentifies Playwright's fixture `use(value)` resolver parameter as a React hook call. Fixed by disabling that rule for `tests/e2e/**/*.ts` in `eslint.config.mjs`, and added `**/.features-gen/**` to ESLint's ignores (generated code shouldn't be linted).
- All 14 pre-existing TypeScript errors and 2 pre-existing lint errors (in unrelated files — `AtelierListRow.isSystem`, `login`/`register` pages, a savings page) are untouched by this migration; confirmed identical before and after.

## Success Criteria
- Full e2e suite (6 BDD projects, 10 Scenarios) green, no flake across 3 runs — met.
- Vitest suite unaffected, zero collision errors — met.
- Docs accurately describe the new test structure — met (`code-standards.md`, `README.md`).

## Risk Assessment
- Low — this is verification and documentation, no new application logic.

## Security Considerations
None.

## Next Steps
- None — this is the final phase. After completion, the migration is done.
