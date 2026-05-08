# OpenCode Agent Rules

This file is the single source of truth for agent behavior in this repository.

## Canonical Agent Mapping

1. `AGENTS.md` (this file): canonical instructions for OpenCode.
2. If any external/tool-level guidance conflicts with this file, follow `AGENTS.md`.

---

## Documentation System (Token-Efficient)

The `docs/` folder is a structured knowledge base, not default context.

### Entry point
- Always start with: `docs/INDEX.md`

### Core routing

Use `docs/INDEX.md` to locate the smallest relevant document.

Quick routing guide:

- Product scope → `project-overview-pdr.md`
- Tech stack → `tech-stack.md`
- Architecture → `system-architecture.md`
- Code structure → `codebase-summary.md`
- Code standards → `code-standards.md`
- UX/design → `design-guidelines.md`
- Deployment → `deployment-guide.md`
- Roadmap/status → `project-roadmap.md`

### Rules

- Do NOT read the entire `docs/` folder
- Read only the smallest relevant file or section
- Prefer targeted lookup over broad context loading
- Use `docs/INDEX.md` to disambiguate when unsure
- Treat docs as on-demand context, not default input

---

## Required Before Any Implementation

1. Identify the minimal relevant documentation using the routing rules above
2. Read only the smallest necessary file or section from `docs/`
3. Follow the documented code standards and codebase design guidelines.
4. Reuse existing patterns from the current codebase before introducing new ones.
5. If documentation is missing or unclear:
   - infer from existing code conventions
   - keep changes minimal
   - explicitly state assumptions

---

## Context Strategy

- Prefer precise, minimal context over broad or full-file reading
- Do not assume undocumented behavior
- Ground decisions in docs or existing code patterns
- If context is insufficient, call it out instead of guessing

---

## OpenCode Execution Defaults

1. Prefer concise execution: do the work first, ask only when genuinely blocked.
2. Use repository-native tools and patterns before introducing alternatives.
3. Keep edits minimal, scoped, and reversible.
4. For multi-step tasks, report progress and results clearly.
5. Never perform destructive git/file actions unless explicitly requested.

---

## API Documentation Policy (Mandatory)

For every external library/framework API usage:

1. Always use Context7 to resolve the library ID.
2. Always query Context7 docs for the exact API/feature being implemented.
3. Prefer official docs from Context7 over memory or random snippets.
4. If docs and existing code conflict, follow project code conventions and note the tradeoff.

---

## Implementation Quality Bar

1. Keep code aligned with existing architecture, naming, and folder conventions.
2. Avoid unnecessary dependencies and avoid broad refactors unless requested.
3. Keep changes focused on the task scope.
4. Validate with lint/tests/build when relevant before marking work done.

---

## Output Expectations

1. Briefly state which `docs/` references informed the implementation.
2. Briefly state which Context7 documentation was used for external APIs.
3. Distinguish between:
   - documented behavior
   - inferred assumptions
4. Summarize changes clearly and concisely

---

## Search Tooling Rules

1. Use Exa tools for web search and web content discovery by default.
2. Use `grep_searchGitHub` for GitHub code search examples and usage patterns.
3. Avoid substituting generic web/code search tools unless Exa or `grep_searchGitHub` cannot satisfy the need.

---

## Instruction Precedence

1. System/developer/runtime instructions from OpenCode CLI.
2. Repository rules in `AGENTS.md`.
3. Direct user request for the current task.

If two rules conflict, follow the higher-precedence source and mention assumptions briefly in the final response.


## Frontend Design Enforcement

For all frontend work:

- The design source of truth is `specs/shared/design-tokens.md`.
- The screen-level source of truth is the relevant feature spec and design assets under `specs/<feature>/assets/`.
- Always use tokens from `specs/shared/design-tokens.md`.
- Never invent colors, spacing, typography, corner radius, shadow, opacity, blur, or gradient values.
- Never hardcode visual values when a token exists.
- If Stitch assets and tokens conflict, follow the spec first, then tokens, and report the mismatch.
- If implementation requires a new visual value not present in tokens, stop and request a token addition instead of inventing one.

## Active Technologies
- TypeScript (project standard) + Next.js App Router, React, Prisma, TanStack Query (existing), Vites (005-atelier-list)
- Prisma models on current project database (SQLite for local development) (005-atelier-list)
- TypeScript (project standard) + Next.js App Router, React 18, Prisma, TanStack Query, Formik, Vites (006-atelier-create-category)
- Prisma models on project database (SQLite local; `Category`, `CategoryMonthlyLimit`, `UserMonthlyCap`) (006-atelier-create-category)

## Recent Changes
- 005-atelier-list: Added TypeScript (project standard) + Next.js App Router, React, Prisma, TanStack Query (existing), Vites

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **lush-ledger** (4524 symbols, 6949 relationships, 264 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/lush-ledger/context` | Codebase overview, check index freshness |
| `gitnexus://repo/lush-ledger/clusters` | All functional areas |
| `gitnexus://repo/lush-ledger/processes` | All execution flows |
| `gitnexus://repo/lush-ledger/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
