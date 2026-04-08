# Master Prompt for Codex — Audit + Targeted Improvements for School Parliament Website

## Role and Operating Mode

You are Codex acting as a senior staff software engineer, software architect, performance engineer, accessibility engineer, and release owner.

Your task is to perform a **full project audit first**, then implement a **bounded but high-quality set of improvements** in the existing school parliament website project.

Work like a production engineer, not like a code generator.

You must:
- inspect the codebase before changing anything;
- understand the current stack, routing, rendering model, state management, styling approach, build system, and deployment approach;
- identify the true root causes of current issues;
- create a plan;
- execute changes carefully;
- verify the result with tests/build/manual checks;
- document all meaningful changes.

Do not start blind edits before the audit.

---

## Context

This is an already implemented website for the school parliament of **МАОУ СОШ №3 города Можайска**. The product already exists, but it needs a focused improvement pass.

The existing project includes public pages such as:
- Главная
- О парламенте
- Состав министерства / состав парламента
- Новости
- События
- Документы
- Инициативы
- Отчеты
- Галерея
- Достижения
- Вступить
- Контакты
- Поиск

There is also an admin area.

Your task is **not** to rebuild the product from scratch unless the audit proves that a specific subsystem must be refactored. Prefer targeted, clean, maintainable improvements over unnecessary rewrites.

---

## Mandatory Phase 1 — Full Audit Before Any Fixes

Before writing feature code, perform a full audit and produce a short internal execution report in the repository.

Create:
- `docs/audit-report.md`
- `docs/fix-plan.md`

### Audit scope

You must inspect and document:
1. project structure;
2. frontend stack and architecture;
3. backend/API stack if present;
4. routing and navigation behavior;
5. page loading strategy;
6. data fetching model;
7. forms and validation model;
8. theme and design system model;
9. accessibility baseline;
10. current admin panel architecture;
11. static assets and image loading strategy;
12. performance bottlenecks;
13. placeholder text handling for empty states;
14. build and run workflow;
15. test coverage and missing tests.

### The audit must answer
- Why navigation between sections is slow.
- Whether the slowness is caused by client-side routing, full page reloads, layout re-renders, redundant fetching, blocking components, oversized bundles, slow database/API queries, image loading, or missing caching/prefetching.
- How the initiative form currently validates required vs optional fields.
- How empty states are currently hardcoded and where wording incorrectly mentions the website or admin panel.
- Where to place the emblem image named `gerb.jpg` from the project root.
- How to implement dark mode and a weak-vision/high-contrast accessibility mode cleanly across the whole site.

### Constraints for audit
- Do not produce generic guesses.
- Every conclusion must be grounded in the actual repository state.
- If something is missing, state it explicitly in the audit report.

---

## Mandatory Phase 2 — Implement the Following Changes

Implement all changes below after the audit.

---

# Change Set A — Add emblem near the top-left title

## Requirement
Where the header currently shows the text:
**«Ученический парламент МАОУ СОШ №3 города Можайска»**

add the image found in the project root named **`gerb.jpg`** to the right of this text.

## Implementation requirements
- Find the actual file in the root directory; support common image extensions if needed.
- The image must render crisply and proportionally.
- It must align correctly with the title on desktop and mobile.
- It must not break the header layout.
- It must have proper alt text in Russian.
- If the title area is part of a reusable header component, implement it there rather than patching a single page.
- Optimize the asset handling if the framework supports image optimization.

### Acceptance criteria
- The emblem appears to the right of the school parliament title.
- The header remains visually balanced.
- No layout shift or overflow on mobile.

---

# Change Set B — Fix initiative form required/optional logic

## Business rule
In the initiative submission form, only the following fields must be required:
- **тема инициативы**
- **описание**
- **класс**

All other fields must be optional.

## Important UX rule
Do **not** mark fields as “optional” or “required” in visible labels.
There should be no text saying which fields are optional and which are required.

## Validation behavior
- If the user fills only theme, description, and class, the form must submit successfully.
- If one of the required fields is missing, the form must show a validation error near that specific field.
- Validation should be explicit, readable, and field-specific.
- Use robust validation logic, not fragile ad-hoc checks.
- If regular expressions are already used, keep them only where appropriate; do not misuse regex for checks that should be simple required-field validation.
- Use schema-based validation if the project stack supports it cleanly.

## Error messaging requirements
If the user did not fill a required field, show a clear inline message indicating that the field must be filled.
Examples of acceptable behavior:
- “Введите тему инициативы”
- “Введите описание инициативы”
- “Укажите класс”

Do not show vague global errors when the problem is local to one field.

## Acceptance criteria
- Only three fields are required.
- Form submits with just those three fields filled.
- Missing required fields show clear inline validation errors.
- No visible “optional/required” labels appear in the UI.

---

# Change Set C — Add dark mode and weak-vision accessibility mode

## Requirement
Add:
1. a **dark theme toggle**;
2. a **mode for visually impaired / weak-vision users**.

## Dark mode requirements
- Must work consistently across the entire site.
- Must include all major pages and shared UI components.
- Must persist user preference across page reloads.
- Must avoid unreadable contrast, half-themed components, and flash of incorrect theme where feasible.

## Weak-vision accessibility mode requirements
Implement a dedicated accessibility mode designed for users with low vision.
This mode should improve readability and usability, not just change one font size.

It should include as appropriate:
- increased base font size;
- stronger color contrast;
- more visible focus states;
- more legible button and input styling;
- increased clickable area where practical;
- improved spacing and readable line height;
- reduced dependence on subtle visual cues.

## Technical requirements
- Implement via a scalable theme/accessibility system, not one-off overrides.
- Use tokens, CSS variables, theme classes, or another maintainable mechanism.
- Ensure toggles are accessible and keyboard-usable.
- Persist the selected mode.
- If both dark mode and weak-vision mode can coexist, define that behavior clearly and implement it consistently.

## Acceptance criteria
- Dark mode works site-wide.
- Weak-vision mode works site-wide.
- Preference persists after refresh/navigation.
- Major pages remain readable and visually coherent.

---

# Change Set D — Optimize navigation and page switching performance

## Problem statement
The site is slow when switching between pages/tabs such as:
- Главная
- Состав министерства
- О парламенте
- Новости
- События
- Документы
- Инициативы
- Отчеты
- Галерея
- Достижения
- Вступить
- Контакты
- Поиск

## Goal
Make navigation feel significantly faster and smoother.

## Required approach
Do not blindly micro-optimize. First identify the actual bottlenecks from the audit, then fix them.

## Possible areas to inspect and improve
Depending on stack and audit findings, address relevant issues such as:
- unnecessary full reloads instead of client-side routing;
- duplicate API requests;
- blocking data fetches for non-critical content;
- missing route prefetching;
- oversized JS bundles;
- poor code splitting / missing lazy loading;
- unnecessary rerenders;
- image optimization issues;
- heavy search initialization on every route;
- slow admin/public shared layout logic;
- inefficient queries;
- no caching where safe;
- lack of skeleton/loading states.

## Required output
In `docs/fix-plan.md`, explicitly state:
- what was slow;
- why it was slow;
- what was changed;
- what measurable or observable improvement was achieved.

## Acceptance criteria
- Navigation between major pages is visibly faster.
- No unnecessary blocking during route transitions.
- Loading states are smoother and less jarring if data is still loading.
- No regression in correctness.

---

# Change Set E — Rewrite empty states and remove unwanted wording

## Problem statement
Some sections show bad or awkward empty-state text, especially when there is no data yet.
Example: “Незапланированных событий, события появятся после публикации в админпанели.”

This wording is poor and must be improved.

Also remove all mentions of:
- the website itself;
- the admin panel.

In other words, the public interface should not tell users that content will appear after publication “in the admin panel” or contain awkward internal-system wording.

## Requirement
Audit all empty states across the public site and rewrite them in a clean, official, user-facing style.

## Example target style
For empty nearest events block, acceptable style would be something like:
- “Ближайшие события пока не опубликованы. После добавления информации последние события будут отображаться здесь.”

You may improve the wording further, but it must remain:
- natural;
- official;
- clear;
- free of internal admin/system terminology.

## Scope
Review and update empty states at least for:
- latest news;
- nearest events;
- ministry achievements if present;
- gallery;
- reports;
- documents if needed;
- search results empty state;
- any other user-facing empty data blocks discovered in the audit.

## Acceptance criteria
- Empty states read naturally in Russian.
- No references to “site” or “admin panel” remain in public-facing placeholders unless explicitly needed for user meaning.
- Wording is consistent across the project.

---

# Change Set F — Improve validation feedback generally

## Requirement
Where users can submit forms, if a required field is missing, the UI must clearly indicate the exact missing field.

The user specifically asked that regular expressions or validation mechanisms show that the field was not filled and needs to be filled.

Interpretation:
- validation must be field-level;
- required errors must be explicit;
- do not rely on generic failure messages;
- keep UX clean and understandable.

## Scope
At minimum:
- initiative submission form;
- any join/contact/search form that currently has poor feedback if applicable;
- any other public form discovered during audit.

## Acceptance criteria
- Missing required fields are clearly highlighted.
- Error messages are close to the fields.
- Form behavior is predictable and understandable.

---

## Technical Direction

You must first detect the actual existing stack. Then choose the least disruptive implementation path.

### If the project already has a coherent stack
Respect it.
Do not migrate frameworks without a compelling audit-backed reason.

### If key parts are chaotic or missing
You may refactor selectively, but only where required for correctness, maintainability, or performance.

### Preferred engineering principles
- minimal surface-area changes where possible;
- reusable components over duplicated patches;
- accessibility-aware UI;
- maintainable validation architecture;
- route and data-fetching efficiency;
- clean Russian UX copy.

---

## Code Quality Requirements

All implemented code must be:
- production-ready;
- typed if the project uses TypeScript;
- lint-clean;
- formatted consistently;
- free of dead code introduced by the task;
- free of debug leftovers;
- structured for maintainability.

If tests exist, update them.
If tests do not exist for the touched critical behavior, add focused tests where practical.

At minimum, verify:
- build succeeds;
- lint succeeds if configured;
- critical tests succeed if present;
- the modified pages render correctly.

---

## Required Documentation Deliverables

Create or update the following files:
- `docs/audit-report.md`
- `docs/fix-plan.md`
- `docs/change-log.md`

### `docs/change-log.md` must include
- summary of implemented changes;
- files/components/pages touched;
- validation changes;
- theme/accessibility changes;
- performance optimizations;
- empty-state text changes;
- any follow-up recommendations.

---

## Required Final Output From Codex

At the end of the task, provide a final implementation summary containing:
1. audit findings;
2. root causes;
3. what was changed;
4. what was intentionally not changed and why;
5. verification steps performed;
6. remaining risks or follow-ups.

Do not claim performance improvements without evidence from the audit or observable behavior.

---

## Subagent Orchestration

Use subagents before and during implementation. The subagents must be configured as specialized workers using **GPT-5.3-Codex**. Keep the main Codex thread as the coordinator.

### Main agent
Main thread acts as **Tech Lead / Orchestrator**.
Responsibilities:
- perform top-level planning;
- own the audit conclusions;
- assign bounded work to subagents;
- review and merge their outputs conceptually;
- ensure consistency of UX, architecture, and code quality;
- make final decisions and produce final summary.

### Subagent 1 — `repo-auditor` (GPT-5.3-Codex)
Responsibilities:
- inspect repository structure;
- identify routing/data fetching/theme/form architecture;
- locate header/title component and `герб` asset;
- find all user-facing empty states;
- diagnose navigation slowness;
- produce structured audit notes for the main agent.

### Subagent 2 — `ux-accessibility-engineer` (GPT-5.3-Codex)
Responsibilities:
- design and implement dark theme;
- design and implement weak-vision/high-readability mode;
- improve focus states, contrast, spacing, typography where needed;
- review form UX and inline validation messaging;
- ensure Russian wording quality for user-facing states and errors.

### Subagent 3 — `forms-and-content-engineer` (GPT-5.3-Codex)
Responsibilities:
- fix initiative form required/optional behavior;
- improve validation architecture;
- update public empty-state copy consistently across the site;
- ensure no public references to internal admin mechanisms remain;
- add or update focused tests for forms/content behavior where practical.

### Subagent 4 — `performance-and-release-engineer` (GPT-5.3-Codex)
Responsibilities:
- analyze route transition performance;
- implement route/data/render optimizations based on the actual stack;
- check bundle/build implications;
- run build/tests/lint where available;
- validate no regressions;
- prepare release notes / verification notes.

### Subagent rules
- Each subagent must receive a bounded task.
- Do not send the same open-ended task to multiple subagents.
- Main agent must synthesize results and keep decisions centralized.
- Subagents may explore in parallel; final implementation must remain coherent.

This subagent pattern aligns with Codex guidance that subagents are useful for parallel, bounded workstreams and can be configured with different instructions and model settings. GPT-5.3-Codex is an official coding model for agentic coding tasks in Codex. citeturn719937search0turn719937search1turn719937search8turn719937search11turn719937search13

---

## Execution Order

Follow this order strictly:

1. Audit repository.
2. Write `docs/audit-report.md`.
3. Write `docs/fix-plan.md` with prioritized implementation plan.
4. Implement header emblem.
5. Fix initiative form validation logic.
6. Implement dark mode and weak-vision mode.
7. Optimize navigation performance.
8. Rewrite empty states and remove unwanted wording.
9. Improve validation feedback in touched forms.
10. Run verification.
11. Write `docs/change-log.md`.
12. Produce final summary.

Do not skip the audit.

---

## Non-Goals

Do not do the following unless absolutely required by the audit:
- full redesign of the product;
- framework migration;
- unnecessary backend rewrite;
- broad database redesign;
- unrelated feature work;
- changing business content outside the requested scope.

---

## Definition of Done

This task is complete only if:
- audit docs are created;
- the emblem is added properly;
- initiative form required/optional logic is correct;
- field-level validation messaging works clearly;
- dark mode works;
- weak-vision mode works;
- navigation is materially improved based on audit findings;
- empty states are rewritten cleanly;
- no inappropriate public mentions of admin-panel/internal-system wording remain in touched empty states;
- build/test/lint checks are performed as available;
- final change documentation is written.

