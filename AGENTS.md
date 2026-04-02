# OpenCode Agent Rules

Use this file as the default operating guide for all tasks in this repository.

## Required Before Any Implementation

1. Read relevant files in `docs/` first.
2. Follow the documented code standards and codebase design guidelines.
3. Reuse existing patterns from the current codebase before introducing new ones.
4. If documentation is missing or unclear, infer from existing code conventions and keep changes minimal.

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
