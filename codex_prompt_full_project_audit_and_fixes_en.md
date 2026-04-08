# Master Prompt for Codex — Full Audit, Root Cause Analysis, Stabilization, Bug Fixing, Security Hardening, and Verification

You are the main delivery agent for an existing school parliament web application repository. You are working inside a real codebase that already has an implemented product, but it currently has critical runtime failures, broken user flows, and likely infrastructure/configuration mistakes.

Your job is not to make cosmetic edits first. Your job is to:
1. perform a full technical audit of the entire project;
2. inspect logs, runtime traces, configuration, environment handling, and database connectivity;
3. identify the root causes of all described failures;
4. fix all confirmed bugs and regressions;
5. test the product end-to-end;
6. fix any new issues discovered during testing;
7. leave the repository in a stable, secure, production-ready state;
8. document all changes.

This is a long-horizon engineering task. Work systematically. Do not jump straight into random edits.

---

## 0. Execution Model and Agent Topology

### Main agent
The main agent acts as the **Team Lead / Principal Engineer / Release Coordinator**. It owns planning, architectural decisions, sequencing, risk control, merge decisions, final verification, and the final delivery summary.

The main agent must keep the work focused on one coherent thread and delegate bounded parallel work to subagents.

### Subagents
Create **exactly 4 subagents**, and all 4 subagents must use **GPT-5.3-Codex**.

#### Subagent 1 — Runtime & Infrastructure Debugger
Scope:
- database connectivity;
- Prisma initialization;
- env loading;
- local/dev runtime setup;
- build/runtime boot failures;
- Docker / local service alignment if present;
- startup diagnostics and health checks.

#### Subagent 2 — Authentication, Forms & Server Actions Engineer
Scope:
- admin login failures;
- password verification;
- auth service availability issues;
- session and cookie flow;
- initiative submission flow;
- server actions;
- validation;
- privacy consent checkbox;
- user-facing error handling.

#### Subagent 3 — Public App & Admin UX Stability Engineer
Scope:
- pages that fail because of broken data dependencies;
- Russian localization consistency for visible statuses/messages;
- broken navigation or rendering chains;
- graceful fallback UI when services are degraded;
- admin-facing usability issues caused by backend bugs.

#### Subagent 4 — QA, Security, Observability & Release Engineer
Scope:
- full regression testing;
- lint/type/build/test execution;
- reproduction scripts;
- auth hardening validation;
- rate limiting / brute-force safeguards verification if already present;
- log review;
- deploy readiness;
- release notes and rollback notes.

### Coordination rules
- The main agent must write the implementation plan first.
- Each subagent must receive a bounded scope and clear acceptance criteria.
- Subagents must not refactor the entire repository without approval from the main agent.
- The main agent must reconcile conflicting findings and integrate the final solution.
- The QA/Release subagent must independently verify the fixes before completion.

---

## 1. Project Context

This is an existing school parliament website with:
- a public site;
- an admin panel;
- forms for submitting initiatives;
- settings loaded from the database;
- Prisma;
- PostgreSQL;
- Next.js app router;
- server-side rendering and/or server actions;
- authentication for the admin panel.

Assume the existing stack is already the intended stack unless there is overwhelming technical evidence otherwise. Do **not** rewrite the project into a new framework. Fix the existing system.

### Existing stack assumptions to preserve unless inspection proves otherwise
- Next.js 16.x with App Router
- TypeScript
- Prisma ORM
- PostgreSQL
- React
- Node.js
- possibly Docker / docker-compose or a local PostgreSQL process

Do not migrate away from Prisma, Next.js, or PostgreSQL.

---

## 2. Primary Mission

Perform a complete engineering pass over the repository and resolve the issues below **as symptoms of root causes**, not as isolated patches.

The application currently exhibits critical failures such as:
- initiative submission form does not work;
- admin login does not work even with correct credentials;
- Prisma initialization errors;
- repeated inability to reach PostgreSQL at `localhost:5433`;
- public pages that fail while trying to read site settings;
- degraded user-facing behavior with generic “service unavailable” messages.

You must determine whether these failures come from one or more of the following categories:
- wrong `DATABASE_URL`;
- local environment misconfiguration;
- mismatch between Prisma schema and runtime env;
- app assuming DB is always available during SSR;
- broken auth secret/session config;
- incorrect password hashing or verification logic;
- broken server action exports/imports;
- failing cache wrappers around DB reads;
- invalid port mapping between local DB, Docker DB, and `.env`;
- missing migrations or schema drift;
- startup ordering problem;
- hidden exception wrapping that converts all failures into vague messages.

---

## 3. User-Reported Failures That Must Be Fixed

### 3.1 Initiative form is broken
Current user-visible error:
- “Сервис временно недоступен. Пожалуйста, повторите попытку позже.”

Required result:
- the initiative submission flow must work reliably;
- the real root cause must be fixed, not just hidden;
- validation must remain correct;
- if the backend is actually unavailable, the user must receive a clear, non-technical, localized message, while detailed diagnostics go to logs.

### 3.2 Admin login is broken
Current user-visible error:
- “Сервис авторизации временно недоступен. Повторите попытку позже.”

Required result:
- login must work with valid credentials;
- invalid credentials must produce the proper localized invalid-credentials message only when credentials are truly invalid;
- infra/service failures must not be mislabeled as invalid credentials;
- the root cause in auth must be fixed.

### 3.3 Prisma database connectivity failures
Observed runtime symptom:
- `PrismaClientInitializationError`
- `Can't reach database server at localhost:5433`
- failures triggered from `prisma.siteSetting.findMany()` and other Prisma calls.

Required result:
- determine why the app points to `localhost:5433`;
- verify whether the DB is supposed to run there or not;
- inspect `.env*`, Prisma config, Docker config, package scripts, seed scripts, and local setup docs;
- fix local/dev runtime configuration so the project boots consistently;
- add safer diagnostics and a health-check path if appropriate;
- ensure Prisma client initialization is robust.

### 3.4 Public pages depending on settings fail when DB is unavailable
Affected areas include settings reads during SSR/public layout/home/initiatives.

Required result:
- site settings loading must be reliable;
- if DB is unavailable, the app should fail gracefully where reasonable;
- repeated cascaded crashes from `siteSetting.findMany()` must be eliminated;
- cache wrappers must not obscure the real issue.

### 3.5 Full-project audit and full testing are mandatory
Do not stop after the listed issues. If the audit or tests reveal additional real bugs, regressions, dangerous assumptions, broken migrations, dead routes, invalid environment defaults, security mistakes, or observability gaps, fix them as part of this task.

---

## 4. Additional Functional Requirement: Privacy Policy + Consent

Add a public page:
- **Privacy Policy / Политика конфиденциальности**

Requirements:
1. create the page in the public site navigation or otherwise make it publicly accessible by direct link;
2. write a clear, appropriate privacy policy for this school parliament website;
3. the text must explain what data is collected, for what purpose, how it is used, how initiative form submissions are processed, and what technical/security data may be logged;
4. the policy must be appropriate for a school public-information site with initiative submission and admin authentication.

### Consent checkbox in initiative form
Add a checkbox to the initiative submission form:
- label in Russian equivalent to “I agree to the processing of personal data”;
- the label text must be a clickable link to the privacy policy page;
- if the checkbox is not selected, the form must not submit;
- client-side validation and server-side validation must both enforce this;
- the validation error must be localized and clear.

Note: implement this carefully so that the field is included in the form schema and does not break server actions.

---

## 5. Non-Negotiable Engineering Process

### Phase 1 — Audit first
Before making major edits, do a complete audit:
- inspect repository structure;
- identify app entry points;
- inspect Prisma schema;
- inspect all `.env*` files that are committed or example templates;
- inspect README/setup docs;
- inspect package scripts;
- inspect Docker-related files if present;
- inspect auth implementation;
- inspect initiative form flow end-to-end;
- inspect settings service and cache layer;
- inspect logs and stack traces;
- identify all code paths touching `siteSetting`, auth, and initiative submission.

Produce an internal findings summary and prioritize root causes.

### Phase 2 — Reproduce failures
You must reproduce the bugs locally if possible.
At minimum:
- boot the project using the existing documented setup;
- run the app;
- reproduce the initiative submission failure;
- reproduce the admin login failure;
- reproduce the Prisma initialization error;
- capture the true server-side cause.

### Phase 3 — Fix root causes
Fix root causes, not only symptoms.

### Phase 4 — Test thoroughly
Run all relevant checks that exist in the repository, for example:
- install dependencies;
- Prisma generate / migrate status / migration commands as appropriate;
- lint;
- typecheck;
- unit tests if present;
- integration tests if present;
- build;
- manual smoke tests.

### Phase 5 — Re-audit after fixes
After implementing changes, inspect the project again for regressions or newly exposed issues.

---

## 6. Expected Technical Outcomes

### 6.1 Database and Prisma
You must leave the project with a predictable and documented DB boot flow.

Required outcomes:
- Prisma can initialize successfully in local development;
- the configured DB host/port is correct and documented;
- environment variables are aligned with actual runtime;
- if Docker is used, ports/services must match the application config;
- if the project expects a local Postgres instance, the setup docs must say so clearly;
- any broken `localhost:5433` assumptions must be corrected.

Possible acceptable deliverables include, if appropriate:
- fixed `.env.example`;
- corrected startup scripts;
- improved README local setup steps;
- DB health check utility or diagnostics;
- safer Prisma singleton handling;
- meaningful initialization logging.

### 6.2 Initiative submission
Required outcomes:
- form submits successfully;
- server action or route handler works correctly;
- no invalid exports from `"use server"` files;
- schema and action contract are consistent;
- privacy consent is required;
- errors are user-friendly and localized;
- technical details go to logs, not to end users.

### 6.3 Admin authentication
Required outcomes:
- correct credentials work;
- password hashing and verification are correct;
- auth failure and service failure are distinguished;
- session creation works;
- login logging is correct and safe;
- no false “invalid password” messages when DB/auth service is unavailable.

### 6.4 Site settings and resilient rendering
Required outcomes:
- settings retrieval no longer causes site-wide fatal rendering due to a bad DB assumption;
- cache usage is correct;
- if the app genuinely cannot fetch settings, the failure path is intentional and understandable;
- do not allow one broken settings query to cascade unpredictably across unrelated pages.

### 6.5 Privacy policy and legal/UX flow
Required outcomes:
- privacy policy page exists and is reachable;
- initiative form contains required consent checkbox;
- linked label opens the privacy policy page;
- both client and server enforce consent.

---

## 7. Security and Reliability Requirements

While fixing the above, inspect the code for basic security and reliability issues in the affected areas.

At minimum, verify and improve as needed:
- passwords stored only as hashes, never plaintext;
- secrets are read from environment variables, not hardcoded;
- cookies/session flags are set correctly for environment;
- auth errors do not leak sensitive details;
- initiative form input is validated and sanitized according to project conventions;
- rate limiting / brute-force mitigation is not broken if already implemented;
- logs are structured enough to distinguish infra issues from validation issues.

Do not add unnecessary complexity, but do fix unsafe patterns you directly encounter in the affected flows.

---

## 8. Documentation Deliverables

Update documentation in the repository.

Minimum required documentation changes:
1. local development setup;
2. how to start the database correctly;
3. required environment variables;
4. auth-related setup requirements;
5. how initiative submission works;
6. what changed during this fix batch;
7. any migrations or seeds that must be run;
8. privacy policy page location and consent behavior.

If the repository already has a README, update it.
If the repository has `AGENTS.md`, preserve and extend it instead of conflicting with it.

---

## 9. Testing and Verification Checklist

The QA / Release subagent must verify all of the following:

### Public site
- home page loads without Prisma initialization error;
- initiatives page loads;
- initiative form validates properly;
- initiative form submits successfully with valid data and accepted consent;
- initiative form is blocked when consent checkbox is not checked;
- privacy policy page opens correctly.

### Admin authentication
- login page opens;
- valid admin credentials log in successfully;
- wrong password shows the correct localized invalid-credentials message;
- auth service outage or DB outage shows the correct service-unavailable path, not a misleading credential error.

### Data/config/runtime
- Prisma client initializes without `localhost:5433` failure unless that is the intentionally correct and running DB target;
- site settings queries work;
- pages depending on settings render correctly;
- build succeeds;
- lint/typecheck pass or any remaining non-critical issues are documented explicitly.

### Logs
- server logs capture the true technical failure reasons;
- end users do not see raw stack traces;
- repeated failures are not silently swallowed.

---

## 10. Constraints

- Do not replace the framework.
- Do not perform a broad rewrite that is not justified by the actual bug.
- Do not remove working features unrelated to the fix batch.
- Do not “fix” by only suppressing exceptions in the UI.
- Do not fake successful submission/login without real backend success.
- Do not leave configuration tribal knowledge undocumented.

---

## 11. Suggested Work Sequence

1. Team lead audits the repository and assigns bounded tasks.
2. Runtime/Infra subagent identifies DB/env/Prisma root cause.
3. Auth/Forms subagent traces login and initiative submission flows.
4. UX/Stability subagent maps all pages broken by site settings dependency.
5. QA/Release subagent prepares reproduction checklist.
6. Main agent integrates root-cause fixes.
7. Privacy policy and consent flow are implemented.
8. Full regression run is executed.
9. README/docs are updated.
10. Final release summary is produced.

---

## 12. Final Output Required from Codex

When the work is complete, produce a final engineering summary containing:

1. **Root causes found**
2. **Files changed**
3. **What was fixed**
4. **How DB/runtime setup was corrected**
5. **How auth was corrected**
6. **How initiative form was corrected**
7. **How privacy policy + consent were implemented**
8. **Tests executed and results**
9. **Any remaining risks or follow-up recommendations**

Also ensure the repository contains the code and documentation updates, not only a textual summary.

---

## 13. Important Notes for Codex

- Prefer targeted, high-confidence fixes over speculative refactors.
- Use the repository’s established patterns unless they are the source of the bug.
- If multiple bugs share one root cause, fix the root cause once and remove all downstream breakage.
- Be explicit about environment assumptions.
- If the database is unavailable, determine whether the real issue is configuration, startup order, wrong port, wrong host, or missing service.
- If admin login still fails after infrastructure is fixed, inspect password hash creation, credential lookup, and comparison logic very carefully.
- If initiative submission still fails after DB stabilization, inspect the full server action / route handler contract, validation schema, exported values, and form state handling.

