# Quickstart: Atelier Create Category

## Prerequisites

- Install dependencies: `npm install`
- Ensure `.env` is configured (including `JWT_SECRET`)
- Ensure local database contains at least one authenticated user with Atelier access

## 1) Start application

- Run: `npm run dev`
- Open: `/app/atelier`

## 2) Validate trigger entry point

- Confirm Add New Category card is visible in Atelier list context.
- Confirm trigger styling/placement follows `specs/005-atelier-list/assets/atelier-list.html`.
- Click trigger and verify Add Category modal opens.

## 3) Validate modal UX behavior

- Confirm modal fields are present: name, icon, limit, keep-next-month, warning toggle, warn-at, actions.
- Confirm required field marker appears on required fields.
- Confirm modal can be dismissed by:
  - close button
  - discard action
  - outside click
  - `Esc` key

## 4) Validate successful create flow

- Enter valid values and submit.
- Confirm submit loading state appears and duplicate submit is prevented.
- Confirm modal closes on success and new category appears in Atelier list after refresh.

## 5) Validate validation and recoverability

- Submit empty name -> confirm required message.
- Submit invalid limit/warn-at values -> confirm actionable validation message.
- Attempt duplicate category name in same scope -> confirm create is blocked with clear message.
- Confirm failed submit preserves user-entered values for correction.

## 6) Validate contract behavior

- `POST /api/categories`

Expected:
- Success returns created category payload.
- Unauthorized request returns `401`.
- Invalid payload returns `400` with recoverable error message.
- Duplicate/cap-overflow business failures return non-technical actionable message.

## 7) Run quality gates

- Lint: `npm run lint`
- Build: `npm run build`
- Tests: `npm run test -- category-api.contract.test.ts atelier-create-category-modal.integration.test.tsx`

## 8) Documentation updates before merge

If behavior changes during implementation, update in the same change:

- `docs/codebase-summary.md`
- `docs/system-architecture.md`
- `docs/project-roadmap.md`
