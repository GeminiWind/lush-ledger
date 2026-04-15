# Quickstart: Atelier Category Update Dialog

## Goal

Implement and verify category edit flow from Atelier list with prefilled modal, safe update handling, and refreshed list state.

## Prerequisites

- Branch: `007-update-category-dialog`
- Dependencies installed: `npm install`
- Local env ready for app + Prisma generation

## Implementation Steps

1. Wire edit trigger in `CategoryAtelierGrid` so row action opens edit dialog for that row.
2. Align dialog behavior and copy in `EditCategoryModal` with spec:
   - prefill values from selected category
   - action label: `Update Category`
   - preserve warning threshold when warning disabled
   - keep dismiss behavior (Esc/backdrop/close)
3. Extend category PATCH route in `src/app/api/categories/[id]/route.ts`:
   - enforce case-insensitive name uniqueness excluding current category
   - keep existing cap validations and structured errors
4. Update API client/service typing in `src/features/atelier/services/index.ts` for validation payload handling.
5. Add/adjust i18n keys in `src/features/i18n/locales/en.json` and `src/features/i18n/locales/vi.json` for validation copy.

## Verification Steps

1. Run focused automated tests:

```bash
npm run test -- tests/contract/category-api.contract.test.ts
npm run test -- tests/integration/atelier-list.integration.test.tsx
```

2. Run full gate checks:

```bash
npm run lint
npm run build
```

3. Manual smoke validation on `/app/atelier`:
   - open edit dialog from a category card
   - verify prefilled fields and icon
   - submit valid edit and confirm refreshed values
   - trigger duplicate-name validation
   - disable warning and confirm threshold persistence behavior

## Documentation Updates Required Before Merge

- `docs/codebase-summary.md`
- `docs/system-architecture.md`
- `docs/project-roadmap.md`

## Verification Log (Phase 6)

Execution date: 2026-04-15

### Automated checks

- `npm run test -- tests/contract/category-api.contract.test.ts` -> pass (`19 passed`)
- `npm run test -- tests/integration/atelier-edit-category-modal.integration.test.tsx` -> pass (`7 passed`)
- `npm run test -- tests/integration/atelier-list.integration.test.tsx` -> pass (`6 passed`)
- `npm run lint` -> pass with 1 warning (`@next/next/no-img-element` in `src/features/savings/pages/CancelledSavingsPlanDetailPageView.tsx`)
- `npm run build` -> pass with existing non-blocking warnings (middleware deprecation notice, BullMQ dynamic import warning)

### Quickstart checklist status

- Edit trigger + prefill flow: verified by integration coverage (`atelier-edit-category-modal.integration.test.tsx`)
- PATCH validation behavior: verified by contract coverage (`category-api.contract.test.ts`)
- Structured error mapping and retry guidance: verified by integration coverage (`atelier-edit-category-modal.integration.test.tsx`)
- Dismiss-without-save behavior: verified by integration coverage (`atelier-edit-category-modal.integration.test.tsx`, `atelier-list.integration.test.tsx`)
- Documentation updates applied: `docs/codebase-summary.md`, `docs/system-architecture.md`, `docs/project-roadmap.md`
