# OpenCode Agent Rules

This file is the single source of truth for agent behavior in this repository.

## Canonical Agent Mapping

1. `AGENTS.md` (this file): canonical instructions for OpenCode.
2. If any external/tool-level guidance conflicts with this file, follow `AGENTS.md`.

## Required Before Any Implementation

1. Read relevant files in `docs/` first.
2. Follow the documented code standards and codebase design guidelines.
3. Reuse existing patterns from the current codebase before introducing new ones.
4. If documentation is missing or unclear, infer from existing code conventions and keep changes minimal.

## OpenCode Execution Defaults

1. Prefer concise execution: do the work first, ask only when genuinely blocked.
2. Use repository-native tools and patterns before introducing alternatives.
3. Keep edits minimal, scoped, and reversible.
4. For multi-step tasks, report progress and results clearly.
5. Never perform destructive git/file actions unless explicitly requested.

## API Documentation Policy (Mandatory)

For every external library/framework API usage:

1. Always use Context7 to resolve the library ID.
2. Always query Context7 docs for the exact API/feature being implemented.
3. Prefer official docs from Context7 over memory or random snippets.
4. If docs and existing code conflict, follow project code conventions and note the tradeoff.

## Implementation Quality Bar

1. Keep code aligned with existing architecture, naming, and folder conventions.
2. Avoid unnecessary dependencies and avoid broad refactors unless requested.
3. Keep changes focused on the task scope.
4. Validate with lint/tests/build when relevant before marking work done.

## Output Expectations

1. Briefly state which `docs/` references informed the implementation.
2. Briefly state which Context7 documentation was used for external APIs.
3. Summarize changes and any assumptions made.

## Search Tooling Rules

1. Use Exa tools for web search and web content discovery by default.
2. Use `grep_searchGitHub` for GitHub code search examples and usage patterns.
3. Avoid substituting generic web/code search tools unless Exa or `grep_searchGitHub` cannot satisfy the need.

## Instruction Precedence

1. System/developer/runtime instructions from OpenCode CLI.
2. Repository rules in `AGENTS.md`.
3. Direct user request for the current task.

If two rules conflict, follow the higher-precedence source and mention assumptions briefly in the final response.

## Active Technologies
- TypeScript (Next.js App Router project, TypeScript ^5) + Next.js route handlers, Prisma, existing auth/session helpers, existing i18n utilities (001-export-transaction-csv)
- SQLite via Prisma (read-only use for export generation); downloadable CSV file response (001-export-transaction-csv)
- TypeScript (^5) in Next.js App Router application + Next.js route handlers, Prisma ORM, existing auth/session helpers, TanStack Query-driven client mutation patterns, existing i18n dictionaries (002-allocate-leftover-savings)
- SQLite via Prisma (`UserMonthlyCap`, `CategoryMonthlyLimit`, `SavingsPlan`, `Transaction`) (002-allocate-leftover-savings)
- TypeScript (^5), Next.js App Router, Node.js runtime + Next.js route handlers, Prisma ORM, BullMQ, Redis client (`ioredis`), existing auth/session helpers (002-allocate-leftover-savings)
- SQLite (Prisma models) + Redis (BullMQ queue state) (002-allocate-leftover-savings)

## Recent Changes
- 001-export-transaction-csv: Added TypeScript (Next.js App Router project, TypeScript ^5) + Next.js route handlers, Prisma, existing auth/session helpers, existing i18n utilities
