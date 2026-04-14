---
description: Generate an actionable, dependency-ordered tasks.md for the feature based on available design artifacts.
handoffs: 
  - label: Analyze For Consistency
    agent: speckit.analyze
    prompt: Run a project analysis for consistency
    send: true
  - label: Implement Project
    agent: speckit.implement
    prompt: Start the implementation in phases
    send: true
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Pre-Execution Checks

**Check for extension hooks (before tasks generation)**:
- Check if `.specify/extensions.yml` exists in the project root.
- If it exists, read it and look for entries under the `hooks.before_tasks` key
- If the YAML cannot be parsed or is invalid, skip hook checking silently and continue normally
- Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
- For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
  - If the hook has no `condition` field, or it is null/empty, treat the hook as executable
  - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation
- For each executable hook, output the following based on its `optional` flag:
  - **Optional hook** (`optional: true`):
    ```
    ## Extension Hooks

    **Optional Pre-Hook**: {extension}
    Command: `/{command}`
    Description: {description}

    Prompt: {prompt}
    To execute: `/{command}`
    ```
  - **Mandatory hook** (`optional: false`):
    ```
    ## Extension Hooks

    **Automatic Pre-Hook**: {extension}
    Executing: `/{command}`
    EXECUTE_COMMAND: {command}
    
    Wait for the result of the hook command before proceeding to the Outline.
    ```
- If no hooks are registered or `.specify/extensions.yml` does not exist, skip silently

## Outline

1. **Setup**: Run `.specify/scripts/bash/check-prerequisites.sh --json` from repo root and parse FEATURE_DIR and AVAILABLE_DOCS list. All paths must be absolute. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

2. **Load design documents**: Read from FEATURE_DIR:
   - **Required**: plan.md (tech stack, libraries, structure), spec.md (user stories with priorities)
   - **Optional**: data-model.md (entities), contracts/ (interface contracts), research.md (decisions), quickstart.md (test scenarios)
   - Note: Not all projects have all documents. Generate tasks based on what's available.

3. **Execute task generation workflow**:
   - Load plan.md and extract tech stack, libraries, project structure
   - Load spec.md and extract user stories with their priorities (P1, P2, P3, etc.)
   - If data-model.md exists: Extract entities and map to user stories
   - If contracts/ exists: Map interface contracts to user stories
   - If research.md exists: Extract decisions for setup tasks
   - Generate tasks organized by user story (see Task Generation Rules below)
   - Generate dependency graph showing user story completion order
   - Create parallel execution examples per user story
   - Validate task completeness (each user story has all needed tasks, independently testable)

4. **Generate tasks.md**: Use `.specify/templates/tasks-template.md` as structure, fill with:
   - Correct feature name from plan.md
   - Phase 1: Setup tasks (project initialization)
   - Phase 2: Foundational tasks (blocking prerequisites for all user stories)
   - Phase 3+: One phase per user story (in priority order from spec.md)
   - Each phase includes: story goal, independent test criteria, tests (if requested), implementation tasks
   - Final Phase: Polish & cross-cutting concerns
   - All tasks must follow the strict checklist format (see Task Generation Rules below)
   - Clear file paths for each task
   - Dependencies section showing story completion order
   - Parallel execution examples per story
   - Implementation strategy section (MVP first, incremental delivery)

5. **Report**: Output path to generated tasks.md and summary:
   - Total task count
   - Task count per user story
   - Parallel opportunities identified
   - Independent test criteria for each story
   - Suggested MVP scope (typically just User Story 1)
   - Format validation: Confirm ALL tasks follow the checklist format (checkbox, ID, labels, file paths)

6. **Check for extension hooks**: After tasks.md is generated, check if `.specify/extensions.yml` exists in the project root.
   - If it exists, read it and look for entries under the `hooks.after_tasks` key
   - If the YAML cannot be parsed or is invalid, skip hook checking silently and continue normally
   - Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
   - For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
     - If the hook has no `condition` field, or it is null/empty, treat the hook as executable
     - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation
   - For each executable hook, output the following based on its `optional` flag:
     - **Optional hook** (`optional: true`):
       ```
       ## Extension Hooks

       **Optional Hook**: {extension}
       Command: `/{command}`
       Description: {description}

       Prompt: {prompt}
       To execute: `/{command}`
       ```
     - **Mandatory hook** (`optional: false`):
       ```
       ## Extension Hooks

       **Automatic Hook**: {extension}
       Executing: `/{command}`
       EXECUTE_COMMAND: {command}
       ```
   - If no hooks are registered or `.specify/extensions.yml` does not exist, skip silently

Context for task generation: $ARGUMENTS

The tasks.md should be immediately executable - each task must be specific enough that an LLM can complete it without additional context.

## Task Generation Rules

**CRITICAL**: Tasks MUST be organized by user story to enable independent implementation and testing.

**Tests are OPTIONAL**: Only generate test tasks if explicitly requested in the feature specification or if user requests TDD approach.

### Checklist Format (REQUIRED)

Every task MUST strictly follow this format:

```text
- [ ] [TaskID] [P?] [Story?] Description with file path
```

**Format Components**:

1. **Checkbox**: ALWAYS start with `- [ ]` (markdown checkbox)
2. **Task ID**: REQUIRED. Must use category-prefixed sequential task IDs:
   - Shared tasks: `SHARED-T001`, `SHARED-T002`, ...
   - Foundational backend tasks: `BE-FOUND-T001`, `BE-FOUND-T002`, ...
   - Foundational frontend tasks: `FE-FOUND-T001`, `FE-FOUND-T002`, ...
   - Frontend story tasks: `FE-US1-T001`, `FE-US1-T002`, ...
   - Backend story tasks: `BE-US1-T001`, `BE-US1-T002`, ...
   - Integration story tasks: `INT-US1-T001`, `INT-US1-T002`, ...
   - Frontend tests: `TEST-FE-US1-T001`, ...
   - Backend tests: `TEST-BE-US1-T001`, ...
   - E2E tests: `TEST-E2E-US1-T001`, ...
3. **[P] marker**: Include ONLY if task is parallelizable (different files, no dependencies on incomplete tasks)
4. **[Story] label**:
   - Setup phase: NO story label
   - Foundational phase: NO story label
   - User Story phases: REQUIRED (`[US1]`, `[US2]`, `[US3]`, etc.)
   - Polish phase: NO story label
5. **Description**: Clear action with exact file path
6. **References**:
   - Include related functional requirements when applicable, e.g. `(FR-001, FR-004)`
   - Include related contract files when applicable, e.g. ``(`contracts/post-products.md`)``

**Examples**:

**Examples**:

- ✅ CORRECT: `- [ ] FE-US1-T001 [P] [US1] Build LoginPage in frontend/src/features/auth-login/pages/LoginPage.tsx`
- ✅ CORRECT: `- [ ] FE-US1-T002 [US1] Implement login form validation in frontend/src/features/auth-login/components/LoginForm.tsx (FR-001, FR-002)`
- ✅ CORRECT: `- [ ] BE-US1-T003 [US1] Implement POST /auth/login endpoint in backend/src/features/auth-login/routes/auth.py (`contracts/post-auth-login.md`)`
- ✅ CORRECT: `- [ ] BE-US1-T004 [US1] Implement authentication service in backend/src/features/auth-login/services/auth_service.py`
- ✅ CORRECT: `- [ ] INT-US1-T005 [US1] Map login success response to redirect in frontend/src/features/auth-login/pages/LoginPage.tsx`
- ✅ CORRECT: `- [ ] TEST-FE-US1-T006 [P] [US1] Add login form interaction test in frontend/tests/integration/test_login_flow.tsx`
- ✅ CORRECT: `- [ ] TEST-BE-US1-T007 [P] [US1] Add contract test for POST /auth/login in backend/tests/contract/test_post_auth_login.py`
- ✅ CORRECT: `- [ ] TEST-E2E-US1-T008 [P] [US1] Add login E2E test in tests/e2e/test_auth_login.spec.ts`

- ❌ WRONG: `- [ ] FE-US1-T001 [P] [US1] Build [Page/View] in frontend/src/features/[feature-name]/pages/[Page].tsx`
- ❌ WRONG: `- [ ] BE-US1-T002 [US1] Implement [METHOD] [endpoint] in backend/src/features/[feature-name]/routes/[route].py`
- ❌ WRONG: `- [ ] TEST-FE-US1-T003 [P] [US1] Add test for [user flow] in frontend/tests/integration/test_[name].tsx`
- ❌ WRONG: `# Tasks: [FEATURE NAME]`
### Task Organization

1. **From User Stories (spec.md)** - PRIMARY ORGANIZATION:
   - Each user story (P1, P2, P3...) gets its own phase
   - Map all related components to their story:
     - Models needed for that story
     - Services needed for that story
     - Interfaces/UI needed for that story
     - If tests requested: Tests specific to that story
   - Mark story dependencies (most stories should be independent)

2. **From Contracts**:
   - Map each interface contract → to the user story it serves
   - If tests requested: Each interface contract → contract test task [P] before implementation in that story's phase

3. **From Data Model**:
   - Map each entity to the user story(ies) that need it
   - If entity serves multiple stories: Put in earliest story or Setup phase
   - Relationships → service layer tasks in appropriate story phase

4. **From Setup/Infrastructure**:
   - Shared infrastructure → Setup phase (Phase 1)
   - Foundational/blocking tasks → Foundational phase (Phase 2)
   - Story-specific setup → within that story's phase

### Phase Structure

- **Phase 1**: Setup (project initialization)
- **Phase 2**: Foundational (blocking prerequisites - MUST complete before user stories)
- **Phase 3+**: User Stories in priority order (P1, P2, P3...)
  - Within each story: Tests (if requested) → Models → Services → Endpoints → Integration
  - Each phase should be a complete, independently testable increment
- **Final Phase**: Polish & Cross-Cutting Concerns
