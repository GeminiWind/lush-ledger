# Research: Ledger Transaction Display Groups

## Decision 1: Flat headers, no nested remaining bucket

- **Decision**: Render flat headers in this order: `Today`, `Yesterday`, then older calendar date headers.
- **Rationale**: Matches clarified product behavior, reduces visual hierarchy complexity, and keeps scan path direct.
- **Alternatives considered**:
  - Nested `All Remaining Transactions` section with child dates (rejected by clarification)
  - All dates only, no `Today`/`Yesterday` semantic labels (lower recency clarity)

## Decision 2: Locale-aware older date labels

- **Decision**: Format older date headers using authenticated user's locale settings.
- **Rationale**: Aligns with existing i18n standards and prevents mixed-language date presentation.
- **Alternatives considered**:
  - Fixed English month/day labels
  - ISO date labels (`YYYY-MM-DD`)

## Decision 3: Day-boundary grouping rules

- **Decision**: Use local day comparisons for `Today` and `Yesterday`; all earlier rows use formatted calendar dates.
- **Rationale**: Keeps mental model consistent for daily finance review.
- **Alternatives considered**:
  - UTC day boundary grouping (can mismatch user expectation)
  - Relative labels beyond yesterday (e.g., "3 days ago")

## Decision 4: API contract treatment

- **Decision**: Reuse existing `GET /api/ledger` contract; no new endpoint.
- **Rationale**: Feature is presentation-only and existing payload already includes transaction date values.
- **Alternatives considered**:
  - Backend pre-grouped response shape
  - Additional query flags for grouping modes

## Decision 5: Test strategy depth

- **Decision**: Prioritize frontend integration tests for grouping/ordering/locale/empty states; backend tests only if payload gap discovered.
- **Rationale**: Behavior change is in UI derivation logic, not server rules.
- **Alternatives considered**:
  - E2E-only verification (too coarse)
  - Broad backend test expansion (out of scope)
