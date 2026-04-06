# Phase 0 Research: Export Transaction CSV

## Decision 1: Add a dedicated ledger export endpoint

- **Decision**: Add a dedicated authenticated endpoint under the ledger API namespace for CSV export instead of overloading the existing ledger JSON list endpoint.
- **Rationale**: A separate endpoint keeps response semantics clear (JSON list vs downloadable file), avoids branching response types in one handler, and keeps consumer behavior explicit.
- **Alternatives considered**:
  - Reuse `GET /api/ledger` with a format query parameter (`format=csv`): rejected because it mixes API contract types and increases accidental break risk for existing consumers.
  - Client-side CSV assembly from rendered page data: rejected because current page data is intentionally limited/paginated and would create filter drift and user-scope risks.

## Decision 2: Reuse existing filter semantics from ledger listing

- **Decision**: Export route accepts and applies the same filter dimensions as the current ledger experience (`query`, `type`, `accountId`, `categoryId`) and adds date range filters for export scope.
- **Rationale**: User expectation is that exported data mirrors current view constraints; shared filter semantics reduce cognitive load and regression risk.
- **Alternatives considered**:
  - Export all transactions regardless of active filters: rejected because it violates expected behavior from the feature spec.
  - Build a separate export-only filter model: rejected because it duplicates logic and raises inconsistency risk.

## Decision 3: CSV format and escaping policy

- **Decision**: Generate RFC-4180-compatible CSV with fixed column order and quote escaping for commas, quotes, and line breaks.
- **Rationale**: Spreadsheet compatibility and deterministic columns are core user outcomes; proper escaping prevents corrupt rows and manual cleanup.
- **Alternatives considered**:
  - TSV output: rejected because feature request explicitly asks for CSV.
  - Minimal escaping only for commas: rejected because embedded quotes/newlines would still break import behavior.

## Decision 4: Performance guardrails for 10k rows

- **Decision**: Optimize export generation as a single read + streaming/string assembly path sized for up to 10,000 rows and validate against the 5-second objective.
- **Rationale**: The spec sets a measurable budget; predictable row limits and efficient transformation keep latency stable.
- **Alternatives considered**:
  - No explicit row target or validation: rejected because it violates constitution and spec performance gates.
  - Background export job + notification flow: rejected as out of scope for this feature iteration.

## Decision 5: Testing strategy in a repo with no current test harness

- **Decision**: Introduce focused automated tests for CSV serialization and export route behavior (auth, user-scoping, filter parity, empty results, escaping) as part of this feature.
- **Rationale**: Constitution requires automated verification for changed behavior; export logic is high-risk for data leakage and formatting defects.
- **Alternatives considered**:
  - Manual QA only: rejected due to repeatability and regression coverage gaps.
  - Broad end-to-end test suite expansion first: rejected because it is disproportionate to the feature scope and delays delivery.

## Decision 6: UX placement and feedback

- **Decision**: Place export control in the existing ledger filter/action area and use existing interaction/copy patterns for loading, empty, success, and error feedback.
- **Rationale**: Keeps flow discoverable without introducing a new navigation path; aligns with canonical route and design-language requirements.
- **Alternatives considered**:
  - Add a new export page under reports: rejected because it adds navigation complexity for a simple action.
  - Silent download with no feedback states: rejected because failure and empty-result cases require clear user guidance.
