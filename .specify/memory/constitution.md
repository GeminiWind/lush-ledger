<!--
Sync Impact Report
- Version change: N/A (template) -> 1.0.0
- Modified principles:
  - Template Principle 1 -> I. Code Quality Is Non-Negotiable
  - Template Principle 2 -> II. Tests Prove Behavior
  - Template Principle 3 -> III. UX Consistency Across Canonical Flows
  - Template Principle 4 -> IV. Performance Budgets Are Product Requirements
  - Template Principle 5 -> V. Small, Traceable, Reversible Delivery
- Added sections:
  - Engineering Gates
  - Delivery Workflow
- Removed sections:
  - None
- Templates requiring updates:
  - .specify/templates/plan-template.md ✅ updated
  - .specify/templates/spec-template.md ✅ updated
  - .specify/templates/tasks-template.md ✅ updated
  - .specify/templates/commands/*.md ⚠ pending (directory not present)
- Follow-up TODOs:
  - None
-->

# Lush Ledger Constitution

## Core Principles

### I. Code Quality Is Non-Negotiable
All production code MUST be type-safe, readable, and aligned with existing repository patterns.
Changes MUST stay scoped to the requested behavior, avoid speculative abstractions, and
favor reuse of existing modules in `src/features/*`, `src/components/*`, and `src/lib/*`.
Every change MUST pass lint and build checks before merge. Rationale: predictable code
quality lowers regression risk and keeps the MVP maintainable as scope grows.

### II. Tests Prove Behavior
Every feature and bug fix MUST include automated tests at the smallest effective level
(unit, integration, or API contract), plus targeted regression coverage for changed paths.
Tests MUST fail before implementation when introducing new behavior, then pass with the
final change. No task is complete without recorded verification steps. Rationale: tests
are the only repeatable proof that behavior remains correct over time.

### III. UX Consistency Across Canonical Flows
User-facing work MUST preserve consistency across canonical authenticated routes under
`src/app/(dashboard)/app/*` and follow `docs/design-guidelines.md`. Required fields MUST
show the red `(*)` marker, dialogs MUST support backdrop/Esc dismiss, and key financial
states MUST not rely on color alone. New flows MUST preserve language, navigation, and
feedback patterns already used in the product. Rationale: consistent UX builds trust in
financial workflows where ambiguity causes user mistakes.

### IV. Performance Budgets Are Product Requirements
Performance constraints MUST be defined in each spec and validated in implementation.
Interactive user actions (form submit, modal open, route transitions) SHOULD complete
within 200ms p95 on local reference data; pages SHOULD avoid unnecessary client work,
duplicate fetching, and unbounded re-renders. Any intentional budget exception MUST be
documented in plan complexity tracking with mitigation. Rationale: speed is a core part
of daily-entry usability and directly impacts retention.

### V. Small, Traceable, Reversible Delivery
Work MUST be delivered in small increments with clear file-level traceability from spec
to plan to tasks. Each task MUST name concrete file paths and a verifiable outcome.
Documentation updates to `docs/codebase-summary.md`, `docs/system-architecture.md`, and
`docs/project-roadmap.md` are mandatory when behavior changes. Rationale: incremental,
well-documented delivery reduces coordination friction and rollback risk.

## Engineering Gates

Before merge, every change MUST satisfy all gates:

- Quality Gate: `npm run lint` and `npm run build` pass.
- Testing Gate: new or modified behavior is covered by automated tests, with evidence.
- UX Gate: changes conform to `docs/design-guidelines.md` and canonical route structure.
- Performance Gate: applicable budgets/constraints are stated and validated.
- Documentation Gate: affected source-of-truth docs are updated in the same change.

## Delivery Workflow

- Specs MUST include measurable functional and non-functional requirements.
- Plans MUST include a constitution check for quality, testing, UX consistency, and
  performance budgets before implementation starts.
- Tasks MUST be grouped by user story, include mandatory verification tasks, and remain
  independently testable for incremental delivery.
- Pull requests MUST explain behavior change, tests run, UX impact, and performance
  implications in concise review notes.

## Governance

This constitution overrides conflicting local conventions for planning and delivery work.
Amendments require: (1) explicit rationale, (2) updates to dependent templates, and
(3) semantic versioning updates documented in the sync impact report.

Versioning policy:

- MAJOR: remove or redefine a core principle in a backward-incompatible way.
- MINOR: add a principle or materially expand a required gate/section.
- PATCH: clarify wording without changing enforcement expectations.

Compliance review expectations:

- Every plan and PR review MUST include a constitution compliance check.
- Violations MUST be recorded in the plan complexity section with justification and
  a simpler rejected alternative.
- Temporary exceptions MUST include an owner and follow-up date in the related artifact.

**Version**: 1.0.0 | **Ratified**: 2026-04-06 | **Last Amended**: 2026-04-06
