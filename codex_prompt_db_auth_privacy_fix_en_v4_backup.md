# Codex Master Prompt — DB/Auth/Initiative Form/Privacy Policy Fix Batch

You are the **main engineering lead agent** responsible for stabilizing, fixing, and completing an existing school parliament website project.

Your job is **not** to jump straight into edits. You must first perform a **full project audit**, identify the true root causes of the reported failures, produce an execution plan, then coordinate implementation through specialized subagents.

The codebase already exists. You must work **inside the current repository** and preserve the existing stack, conventions, architecture, and design language unless a change is required to fix defects or improve reliability.

---

## 0. Mission

Implement a focused remediation batch that fixes the following critical issues:

1. **Initiative form submission fails** and shows the generic message:  
   `Не удалось отправить инициативу. Повторите попытку позже.`
2. **Prisma initialization and database connection errors** occur across public pages and layout code. The app is trying to connect to PostgreSQL at `localhost:5433` and fails.
3. **Admin login fails** even when correct credentials are entered. The UI reports `Неверный логин или пароль`.
4. Add a new **Privacy Policy** page and wire it into the initiative form.
5. Add a required consent checkbox: **“I agree to the processing of personal data”**. If the user does not check it, the initiative form must not submit.
6. The consent label text must be a **link to the privacy policy page**.
7. Improve robustness, diagnostics, testing coverage, and local development reliability.

---

## 1. Required workflow

You must follow this order strictly:

### Phase 1 — Full audit
Before changing code, inspect and document:
- project structure
- runtime stack
- Next.js routing model
- server actions usage
- Prisma initialization flow
- env handling
- DB connection config
- auth flow for admin panel
- initiative form client/server validation flow
- existing admin credentials/bootstrap logic
- deployment/runtime assumptions
- logs and error boundaries

### Phase 2 — Root cause analysis
For each reported bug, identify:
- exact source file(s)
- exact root cause
- why the current implementation fails
- what must be changed
- whether schema, env, seed, auth, server action, or UI logic is involved

### Phase 3 — Implementation plan
Produce a concrete step-by-step implementation plan covering:
- DB connectivity stabilization
- Prisma client behavior in dev/prod
- env normalization
- auth fix
- privacy policy page
- initiative form consent enforcement
- tests
- migration/seed updates if required

### Phase 4 — Implementation
Apply fixes in isolated, logically grouped commits/patches.

### Phase 5 — Verification
Run all relevant checks:
- lint
- typecheck
- tests
- local build
- DB migration status
- initiative submission flow
- admin login flow
- public pages rendering

### Phase 6 — Final audit
Re-audit the updated repository and confirm:
- issues are fixed
- no regressions introduced
- docs updated
- environment setup is reproducible

---

## 2. Subagent architecture

Use **4 subagents**, all configured with model **GPT-5.3-Codex**.
The main agent remains the **Team Lead / Orchestrator** and coordinates all work.

### Main agent — Team Lead / Technical Architect
Responsibilities:
- own full audit and execution strategy
- define task boundaries
- delegate work to subagents
- review subagent results
- resolve cross-cutting conflicts
- approve final integration
- ensure documentation quality
- ensure the final result is production-safe and locally reproducible

### Subagent 1 — Backend Reliability Engineer (GPT-5.3-Codex)
Responsibilities:
- inspect and fix Prisma initialization
- inspect and fix DB connectivity
- normalize environment configuration
- improve startup/developer experience
- ensure graceful failure behavior where appropriate
- fix server-side initiative submission logic if backend-related
- review migrations and seeding

### Subagent 2 — Auth & Security Engineer (GPT-5.3-Codex)
Responsibilities:
- inspect and fix admin authentication flow
- verify credential lookup logic
- verify password hashing and comparison logic
- verify session handling
- verify role/login boundaries
- ensure correct admin login behavior
- ensure no insecure shortcuts are introduced

### Subagent 3 — Public UX & Forms Engineer (GPT-5.3-Codex)
Responsibilities:
- fix initiative form submission UX
- add privacy policy page
- add consent checkbox and validation
- link consent text to privacy policy page
- ensure Russian UI text remains correct and natural
- ensure error states are clear and actionable

### Subagent 4 — QA, Release & Deployment Engineer (GPT-5.3-Codex)
Responsibilities:
- verify implementation end-to-end
- add or improve automated tests
- validate builds and runtime
- check local setup reproducibility
- run regression checks on affected public/admin pages
- prepare release notes / fix summary
- deploy if the environment and workflow already support deployment and deployment is explicitly allowed in the current repo workflow

Important:
- Each subagent must work on a bounded scope.
- The Team Lead must keep the main reasoning thread focused and use subagents for bounded exploration, implementation, and verification tasks.

---

## 3. Stack expectations

Preserve the current stack unless a change is required for correctness.
Expected stack likely includes:
- Next.js App Router
- TypeScript
- Prisma
- PostgreSQL
- React Server Components / Server Actions
- admin auth layer

Do not rewrite the project into another framework.
Do not introduce unnecessary infrastructure.
Do not replace Prisma unless it is absolutely impossible to stabilize, which is unlikely.

---

## 4. Critical issues to fix

### 4.1 Initiative form submission failure
Current symptom:
- User submits initiative form
- UI shows generic failure message:
  `Не удалось отправить инициативу. Повторите попытку позже.`

You must:
- trace the full submission path from UI to server action/API/backend persistence
- identify why submission fails
- fix the real root cause, not only the surface message
- preserve required validation rules
- ensure the form returns actionable field errors where relevant
- ensure the success state is correct
- ensure the submission works in development and production-like local setup

Also verify whether prior `use server` export structure or server action shape problems still exist anywhere in this flow.

### 4.2 Prisma / PostgreSQL initialization failures
Reported runtime errors indicate:
- `PrismaClientInitializationError`
- app tries to connect to `localhost:5433`
- connection fails across pages like home, initiatives, layout settings, etc.

You must fully investigate:
- where `DATABASE_URL` is sourced from
- why port `5433` is used
- whether the repo actually expects Docker PostgreSQL, local PostgreSQL, or another runtime
- whether `.env`, `.env.local`, Docker Compose, scripts, or docs are inconsistent
- whether Prisma client singleton handling is correct in development
- whether startup scripts and documentation are broken

Required deliverables for this issue:
1. Fix DB connection so the project can run locally in a sane, documented way.
2. If a DB service is required, ensure the repo clearly supports launching it.
3. If missing env defaults are the cause, document them.
4. If runtime should fail gracefully when DB is unavailable for specific public pages, improve that behavior where appropriate without hiding real errors from developers.
5. Update setup docs so another developer can start the app without guessing ports.

### 4.3 Admin login failure despite correct credentials
Current symptom:
- user enters correct admin credentials
- app responds with `Неверный логин или пароль`

You must audit:
- login form submission logic
- credential normalization (case sensitivity, trimming, hidden fields)
- password hashing/comparison
- auth provider configuration
- seed/default user creation
- session creation and redirects
- whether the expected credentials actually exist in the DB
- whether the login checks the wrong identifier field

You must fix the actual auth issue and ensure:
- valid credentials log in successfully
- invalid credentials still fail correctly
- localized error messages are correct
- the auth flow is secure

### 4.4 Privacy Policy page
Add a new public page:
- route should follow existing site routing conventions
- title and metadata must be appropriate
- the page content must be written professionally in Russian

The privacy policy must explain, in clear language:
- what data is collected through the site
- what data may be collected through the initiative form
- why the data is collected
- how the data is processed and stored
- who can access the data
- whether Telegram/contact data submitted by a user may be used to respond to the initiative
- user rights regarding personal data
- how to contact the organization/site administrators regarding data processing

The content should be realistic and appropriate for a school parliament website, not generic corporate nonsense.

### 4.5 Consent checkbox in initiative form
Add a required checkbox to the initiative submission form.

Requirements:
- Checkbox text must be in Russian.
- The text must indicate consent to personal data processing.
- The text itself must be a clickable link to the privacy policy page.
- If the checkbox is not checked, the form must not submit.
- Validation must exist both client-side and server-side.
- The error message must be understandable and localized in Russian.
- The consent requirement must be reflected in form schema/validation logic and persisted only if the project stores such metadata.

Suggested Russian label meaning:
- “I agree to the processing of personal data”

Do not implement a fake UI-only checkbox. It must be part of the actual validation and submission contract.

---

## 5. Functional requirements for the fix batch

### 5.1 Database and environment stability
You must:
- centralize and normalize Prisma client creation
- avoid duplicate client creation in dev hot reload scenarios
- verify environment variable loading order
- document required env vars
- ensure local setup works predictably
- fix any wrong hardcoded port assumptions if present

If the repo uses Docker Compose or another local DB workflow, ensure:
- documentation matches reality
- scripts are correct
- connection strings are consistent

### 5.2 Initiative form validation and UX
Ensure the initiative form:
- submits successfully when data is valid and infrastructure is running
- blocks submission when required consent is missing
- shows field-specific errors where appropriate
- does not leak raw internal exceptions to users
- logs useful server-side diagnostic info for developers/admins if the project already supports this pattern

### 5.3 Admin auth reliability
Ensure:
- credential verification works correctly
- login succeeds with valid seeded/stored credentials
- sessions are created correctly
- login redirects correctly
- auth errors are distinguishable between user error and system misconfiguration

### 5.4 Privacy policy integration
Ensure:
- privacy policy page is reachable from the initiative form
- link opens correctly using the site router
- metadata/title are sensible
- the page is included in navigation or footer only if that matches existing UX conventions

---

## 6. Non-functional requirements

### 6.1 Code quality
- maintain TypeScript strictness if enabled
- avoid hacks and fragile one-off fixes
- keep functions cohesive and names explicit
- preserve architecture consistency

### 6.2 Reliability
- avoid silent failures
- improve developer-facing diagnostics
- improve error handling boundaries where needed

### 6.3 Security
- do not store raw passwords
- do not weaken auth
- do not bypass validation
- do not expose secrets in client code
- do not print secrets into logs

### 6.4 Maintainability
- update docs
- update env example files if needed
- keep migrations and seeds understandable

---

## 7. Required project outputs

### 7.1 Code changes
Implement all necessary code changes in the existing codebase.

### 7.2 Documentation updates
Update or create documentation for:
- local setup
- required env variables
- DB startup expectations
- how admin auth works
- how initiative form consent works
- where the privacy policy page lives

At minimum, update:
- `README.md`
- `.env.example` or equivalent env template if the repo uses one

### 7.3 If needed, create or update
- seed scripts
- migration files
- test files
- validation schemas
- auth config docs

---

## 8. Testing requirements

You must add or update tests where reasonable.

At minimum verify:

### 8.1 Database-related
- app can initialize Prisma with correct env
- setup docs reflect actual connection config

### 8.2 Initiative form
- valid form + consent checked → success
- missing consent → blocked submission with localized error
- backend failure path → graceful user-facing error

### 8.3 Admin login
- valid credentials → login succeeds
- invalid credentials → correct error
- missing user/seed issue → diagnosable

### 8.4 Privacy policy
- route renders successfully
- link from initiative form points correctly

### 8.5 Regression checks
- public home page renders without Prisma init crash when environment is configured correctly
- settings-dependent pages still work
- initiative page still renders
- admin login page still renders

If the project already uses Playwright, Vitest, Jest, Cypress, or similar, extend the existing approach.
If no test framework exists, use the most lightweight option consistent with the current repo.

---

## 9. Implementation constraints

Do not:
- rewrite the project from scratch
- change framework unnecessarily
- hardcode secrets
- ship with broken env assumptions
- add fake placeholder fixes that only hide the root issue
- remove existing functionality unless absolutely necessary and clearly justified

Do:
- trace root causes carefully
- fix the actual architecture/config problems
- preserve Russian UI text quality
- keep the solution production-minded

---

## 10. Audit deliverables before coding

Before writing implementation patches, the Team Lead must prepare a concise internal audit summary that includes:
- current architecture overview
- affected modules/files
- DB connection diagnosis
- admin auth diagnosis
- initiative form diagnosis
- privacy policy integration plan
- risk list
- implementation order

Then proceed to edits.

---

## 11. Final deliverables after coding

When all work is complete, provide:

1. **Change summary**
   - what was fixed
   - root causes found
   - files changed

2. **Verification summary**
   - tests run
   - build/lint/typecheck status
   - manual verification flows performed

3. **Environment/setup summary**
   - exact required env vars
   - how to start DB locally
   - how to seed admin credentials if needed

4. **Known caveats**
   - anything still requiring operator action

---

## 12. Definition of done

This task is complete only if:
- initiative form successfully submits when valid
- missing consent blocks submission with a clear Russian error
- privacy policy page exists and is linked from the consent text
- Prisma no longer fails due to broken/undocumented local DB assumptions when the environment is set up correctly
- admin login works with correct credentials
- docs are updated so another developer can run the project locally without guesswork
- relevant tests pass
- final audit confirms no major regressions

---

## 13. Operating instructions for Codex

Follow this execution style:
- inspect first, edit second
- keep the main thread focused on orchestration and integration
- use subagents for bounded tasks
- prefer root-cause fixes over UI masking
- when uncertain, inspect the current codebase and existing conventions instead of inventing a new pattern
- keep patches small, reviewable, and internally coherent
- preserve high engineering discipline throughout

