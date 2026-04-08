# Master Prompt for Codex — Full Project Audit, Admin Fixes, Documentation Consolidation, Local Verification

You are the **main implementation agent / team lead** for this repository.
Your job is to **fully audit, reproduce, fix, validate, document, and locally verify** the project.

This is **not** a “quick patch” task.
This is a **root-cause audit + repair + cleanup + documentation consolidation** task.

You must behave like a senior staff engineer / architect / release coordinator.

---

## 0. Core mission

You must:

1. **Carefully analyze the entire project** before making changes.
2. **Run the project locally** and reproduce the reported issues.
3. **Inspect logs, build output, runtime errors, and role/permission flows**.
4. **Fix all issues listed below**.
5. If additional bugs or inconsistencies are discovered during the audit, **fix them too**.
6. **Re-audit the entire project after the fixes**.
7. **Review all project documentation and remove unnecessary / obsolete / duplicate docs**.
8. **Produce one final, complete, detailed project documentation file** that explains:
   - what the project is;
   - how it is structured;
   - what each major module does;
   - what features are implemented;
   - what roles/accounts exist;
   - what permissions exist;
   - how the system works end-to-end;
   - what was implemented historically and in what sequence;
   - what bugs were fixed in this batch;
   - how to run, test, and maintain the project.
9. **Delete unneeded documentation files** after consolidating them into the single final doc.
10. **Run the project locally after all changes and confirm that it works**.

Do not stop at superficial fixes.
Find **root causes**.

---

## 1. Required execution strategy

Follow this sequence exactly:

### Phase A — Repository audit
- Inspect the full repository structure.
- Identify the actual stack, runtime, scripts, database layer, auth layer, admin architecture, public routes, role/permission model, form handling, validation system, storage approach, and docs structure.
- Read:
  - package manifests
  - framework config
  - Prisma schema and migrations
  - auth implementation
  - middleware
  - admin layout / navigation code
  - album creation form and backend mutation
  - role switching / session persistence logic
  - all project docs / markdown files / technical notes
- Build a concise internal architecture map before coding.

### Phase B — Local run and bug reproduction
- Install dependencies if needed.
- Start the project locally.
- Start all required local services.
- Ensure database connectivity and migrations are correct.
- Reproduce every issue from the task description.
- Collect the relevant logs and root causes.
- Do **not** patch blindly.

### Phase C — Implementation
- Fix issues in a structured order:
  1. infrastructure / environment / session integrity
  2. admin UX + permissions + navigation
  3. album creation flow
  4. documentation cleanup and consolidation
  5. final QA and local verification

### Phase D — Post-fix audit
- Re-run:
  - lint
  - typecheck
  - tests
  - build
  - local runtime smoke tests
- Manually verify affected user flows.
- Ensure no regression is introduced.

### Phase E — Documentation consolidation
- Collect all relevant current documentation.
- Merge useful content into a **single final documentation file**.
- Remove outdated / duplicated / fragmented docs that are no longer needed.
- Keep only the one final canonical project doc plus absolutely essential docs required by the repo.

### Phase F — Final local verification
- Run the app locally.
- Verify admin and public routes manually.
- Confirm the exact fixed scenarios.

---

## 2. Current expected stack (verify against actual repo)

Unless repository evidence proves otherwise, assume the current stack is approximately:

- **Next.js** (App Router)
- **React**
- **TypeScript**
- **Prisma**
- **PostgreSQL**
- **Server Actions and/or route handlers**
- **Role-based admin panel**
- **Local file and/or DB-backed content management**
- **Next.js 16.x + Turbopack in local dev** (verify)
- package manager: detect from lockfile
- possible Node runtime / Docker / compose / environment files — verify instead of assuming

If the repo differs, adapt the plan to the actual stack.

---

## 3. Required subagent structure

Use **4 subagents**, all configured as **GPT-5.3-Codex**.

The **main agent** remains the overall team lead / integrator / release coordinator.

### Main agent — Team Lead / Systems Integrator
Responsibilities:
- own the overall plan;
- decompose tasks;
- assign work to subagents;
- review each subagent result;
- resolve conflicts;
- keep architecture coherent;
- perform final integration;
- ensure final acceptance criteria are satisfied.

### Subagent 1 — Infrastructure & Runtime Auditor (GPT-5.3-Codex)
Responsibilities:
- inspect env/config/runtime scripts;
- verify local startup flow;
- inspect DB connection, Prisma config, migrations, seeds;
- inspect session storage/cookies/auth runtime behavior;
- detect root causes of environment-related failures;
- produce actionable findings and fixes.

### Subagent 2 — Admin UX, Routing & Permissions Engineer (GPT-5.3-Codex)
Responsibilities:
- inspect admin sidebar/navigation/dashboard routing;
- inspect role-based visibility and access control;
- reproduce the “Users” and “Observability” navigation issues;
- fix UI state desynchronization after logging into different roles;
- ensure clickable navigation matches actual permissions.

### Subagent 3 — Forms, Validation & Content Engineer (GPT-5.3-Codex)
Responsibilities:
- inspect album creation form, schema validation, server action / API layer, DB write flow;
- reproduce the “Specify album title” false validation error;
- fix form serialization, schema mismatch, controlled/uncontrolled field issues, translations, and success/error handling;
- inspect related admin content creation flows for nearby regressions.

### Subagent 4 — QA, Documentation & Release Engineer (GPT-5.3-Codex)
Responsibilities:
- run lint/typecheck/tests/build;
- perform smoke tests after fixes;
- review all documentation files;
- merge docs into one canonical file;
- delete obsolete documentation files;
- validate final local run;
- prepare release notes / change summary.

Subagents must return findings to the main agent.
The main agent performs final integration and review.

---

## 4. Reported issues to fix

## 4.1 Album creation bug in admin panel
Problem:
- In the admin panel, when all fields are filled while creating a new album, the site still shows:
  - **"Укажите название альбома"** / **"Specify album title"**
- This is a false validation failure.

You must:
- reproduce the bug locally;
- inspect the full create-album flow:
  - form fields
  - labels/names
  - default values
  - form state
  - schema validator
  - server action or API endpoint
  - DTO / payload mapping
  - DB write
- determine whether the issue is caused by:
  - field name mismatch;
  - missing `name` attribute;
  - wrong key in `FormData`;
  - Zod/schema mismatch;
  - stale server action contract;
  - invalid translation/normalization layer;
  - form library registration bug;
  - route payload parsing issue;
  - client/server mismatch.
- fix the issue properly, not with a hack.
- verify that album creation works end-to-end.

Also verify:
- edit album flow;
- delete album flow;
- gallery rendering based on created albums if applicable;
- translated validation messages.

---

## 4.2 Admin sidebar / dashboard role desynchronization bug
Problem:
- In the admin account, the left sidebar contains buttons:
  - **Users**
  - **Observability**
- These buttons are no longer clickable.
- In dashboard sections, those sections are missing.
- This happened after logging into other accounts:
  - `president`
  - `minister`

Interpretation:
- There is likely a bug in one or more of:
  - client-side role cache;
  - session refresh logic;
  - persisted local state;
  - hydration mismatch;
  - role-based menu generation;
  - permission memoization;
  - Zustand/Redux/context/session store contamination;
  - role downgrade state not reset after user switch;
  - middleware/session decoding issue;
  - server-side permission check vs client-side nav rendering mismatch.

You must:
- reproduce the issue exactly;
- inspect login, logout, session persistence, role switching, cookies, token/session payload, navigation state, admin layout generation, and dashboard route definitions;
- ensure the admin account again gets access to:
  - Users
  - Observability
- ensure the sections are visible and clickable where expected;
- ensure `president` and `minister` permissions remain correct and restricted;
- ensure switching between roles does not corrupt later sessions;
- ensure full reload, logout, login, and hard refresh behave correctly.

Also:
- verify access control on both **UI level** and **server authorization level**;
- do not solve this by simply showing buttons without fixing access consistency.

---

## 4.3 Documentation sprawl / documentation cleanup
Problem:
- The repository contains too many documentation files.
- Documentation is fragmented.
- The project now needs one final, full, canonical documentation file.

You must:
- scan the repo for docs:
  - `.md`
  - `.mdx`
  - notes
  - temporary specs
  - old prompts
  - duplicated technical docs
  - generated task docs
- determine which docs are:
  - current and useful;
  - outdated;
  - duplicated;
  - temporary;
  - no longer relevant.
- create **one** final detailed documentation file that becomes the canonical project document.

The final documentation must include:

### A. Project overview
- project purpose;
- target users;
- public and admin parts;
- key value proposition.

### B. Tech stack
- framework
- runtime
- database
- ORM
- styling
- auth
- file handling
- observability/logging if present
- deployment assumptions
- scripts

### C. Architecture
- top-level folders;
- route groups;
- public routes;
- admin routes;
- features/modules;
- shared components;
- services;
- DB schema overview;
- cache/invalidations if used;
- server/client boundaries.

### D. Feature inventory
Describe all implemented features in detail, including but not limited to:
- public homepage
- ministries
- news
- events
- documents
- initiatives
- reports
- gallery
- achievements
- join page
- contacts
- search
- dark theme / accessibility if present
- hidden admin access trigger if implemented
- admin dashboard
- role system
- users
- observability
- content management modules

### E. Roles and permissions
- admin
- president
- minister
- any other roles
- exact permission matrix

### F. Forms and validation
- how forms are built
- how validation works
- where server-side validation lives
- how files/uploads work if present

### G. Authentication and authorization
- login flow
- session model
- role derivation
- route protection
- security constraints

### H. Data model overview
Summarize relevant Prisma models / entities and relationships.

### I. Development history / implementation sequence
Based on the current repository state **and the product history reflected in the task context**, summarize how the project evolved:
- initial MVP info portal
- admin panel expansion
- full product additions
- logging/telemetry/roles/security additions
- later bug-fix batches
- current stabilization phase

Do not invent fake history.
Use repository evidence and current known task history only.

### J. Final bug-fix batch summary
Document exactly what was fixed in this batch.

### K. Local setup and run instructions
- prerequisites
- env vars
- DB startup
- Prisma steps
- seed steps if needed
- run commands
- build commands
- test commands
- troubleshooting

### L. Maintenance notes
- common failure points
- where to update content schemas
- where permissions live
- how to extend the project safely

After creating the final canonical doc:
- remove unnecessary, duplicate, obsolete documentation files;
- keep only:
  - the new final canonical doc;
  - essential environment docs if truly needed;
  - legally/operationally required docs.

Do **not** leave documentation clutter.

Suggested filename:
- `PROJECT_DOCUMENTATION.md`
or another clear canonical name if repo conventions suggest better.

---

## 5. Additional audit expectations

Even though only two explicit bugs were reported, you must also inspect for nearby regressions in related areas:

### Album / gallery area
- create
- edit
- delete
- list rendering
- image upload / references
- validation messages
- i18n labels
- admin feedback state
- cache refresh after mutations

### Role-based admin area
- login/logout
- role switch between admin/president/minister
- sidebar visibility
- dashboard cards/links
- route guards
- SSR vs client permission mismatch
- stale state after logout
- cookie/session invalidation
- local storage contamination
- menu hydration

If you find additional issues here, fix them.

---

## 6. Testing requirements

You must test the project thoroughly.

### Required checks
- install dependencies
- run lint
- run typecheck
- run tests if present
- run Prisma validation/generation/migrations as appropriate
- run production build
- run local dev server
- manually verify critical flows

### Required manual test scenarios
1. login as admin → Users and Observability visible and clickable
2. login as president → restricted access behaves correctly
3. login as minister → restricted access behaves correctly
4. logout and login across different roles in sequence → permissions stay correct
5. create album with valid fields → succeeds
6. edit album → succeeds
7. delete album → succeeds
8. inspect gallery/album results in admin and public UI if applicable
9. open core public pages → no runtime errors
10. open core admin pages → no runtime errors

If automated tests are missing for the broken areas, add focused tests where appropriate.

---

## 7. Security and correctness rules

- Do not weaken authorization.
- Do not fake permissions in the UI while the backend still disagrees.
- Do not hardcode a role in order to “fix” the nav.
- Do not suppress validation messages without fixing the root cause.
- Do not delete useful docs before consolidating them.
- Do not leave the repo in a state where local startup is broken.
- Do not break Prisma schema consistency.
- Do not leave dead code or abandoned temporary fixes.

---

## 8. Deliverables

At the end, provide:

### Code changes
- all implemented fixes committed in repo state.

### Documentation
- one final canonical project documentation file.
- unnecessary docs removed.

### Verification summary
A concise final report containing:
- root causes found;
- files changed;
- bugs fixed;
- extra bugs found and fixed;
- tests run;
- manual scenarios verified;
- local run status;
- any remaining risks.

---

## 9. Acceptance criteria

The task is complete only if all of the following are true:

1. The album creation form works correctly and does not throw a false “Specify album title” error when the title is filled.
2. The admin sidebar and dashboard correctly expose **Users** and **Observability** to the admin account.
3. Logging into president/minister accounts no longer corrupts admin navigation/permissions afterward.
4. Permissions are correct on both client and server.
5. The project runs locally without the reported regressions.
6. Lint/typecheck/build pass, or any unavoidable failures are explicitly documented with root cause and remediation path.
7. One final canonical project documentation file exists.
8. Redundant/obsolete docs are removed.
9. The final verification confirms the project works end-to-end for the affected flows.

---

## 10. Working style requirements

- Think before editing.
- Reproduce before fixing.
- Fix root causes.
- Keep changes coherent and minimal where possible.
- Preserve architecture quality.
- Prefer deterministic, maintainable solutions.
- Update code comments/docs only where they add value.
- Keep naming consistent.
- Keep Russian UI text correct where the project uses Russian.
- Keep internal implementation quality production-oriented.

---

## 11. Final instruction

Start now with:
1. repo audit,
2. local run,
3. issue reproduction,
4. structured fixes,
5. documentation consolidation,
6. full local verification.

Do not stop after the first apparent fix.
Complete the entire batch.
