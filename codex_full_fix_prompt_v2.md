# Master Prompt for Codex — Full Audit + Fix Batch for School Parliament Project

You are the **Lead Engineer / Technical Team Lead** for an existing production-style web application called **School Parliament Project**. Your job is to perform a **full technical audit**, identify root causes, implement a large batch of product fixes and security improvements, test everything end-to-end, update documentation, and prepare the project for safe deployment.

This is **not** a greenfield build. This is an **existing codebase** that already has an MVP and a broader feature set. You must preserve the existing architecture where sensible, avoid unnecessary rewrites, and prefer targeted, production-grade fixes.

---

## 0. Operating Mode

Work in the following order and do not skip steps:

1. **Perform a full audit of the project before making changes**.
2. **Map the current stack, architecture, routes, data models, auth model, admin roles, server actions, upload flows, theme system, and mobile layout behavior**.
3. **Find and document root causes** for every bug you can verify.
4. **Create an implementation plan grouped by domain**.
5. **Execute the fixes incrementally**.
6. **Run a second full audit after implementation**.
7. **Run tests, linters, type checks, and manual verification flows**.
8. **Fix any regressions found during verification**.
9. **Prepare deployment notes and deploy if the environment and credentials already exist**.

Do not guess when the codebase can tell you the truth. Inspect first, then change.

---

## 1. Project Context

This project is an official-style school parliament website with both a public site and an admin panel.

The application already includes or partially includes these sections:

- Home
- About Parliament
- Parliament Structure / Members / Ministries
- News
- Events
- Documents
- Initiatives
- Reports
- Gallery
- Achievements
- Join Parliament
- Contacts
- Search
- Admin panel
- User management / observability / settings (admin-facing)

The codebase appears to be based on a modern React + Next.js style stack and likely uses Prisma, server actions, and an admin interface. Confirm the exact stack during the audit and preserve it unless there is a critical reason not to.

---

## 2. Mandatory Subagent Topology

You must use **4 subagents**, all configured as **GPT-5.3-Codex**, plus one **main coordinator agent** acting as the team lead.

### Main Agent — Team Lead / Architecture Owner
Responsibilities:
- Perform the initial audit summary.
- Break the work into bounded tasks.
- Dispatch work to subagents.
- Review every major change before merge.
- Resolve cross-cutting architecture decisions.
- Keep the implementation aligned with the product requirements.
- Run final acceptance review.

### Subagent 1 — Public UX / Frontend Fix Engineer (GPT-5.3-Codex)
Responsibilities:
- Public pages
- Card UI changes
- Theme fixes
- accessibility mode / visually impaired mode
- mobile responsiveness fixes
- navigation / performance / rendering optimization
- gallery UI
- empty states
- public translation fixes

### Subagent 2 — Admin Panel / Content Workflow Engineer (GPT-5.3-Codex)
Responsibilities:
- Admin forms
- validation
- scheduling with date + time
- admin labels and Russian localization
- role-based admin restrictions
- content entity edit flows
- initiative/report/document/event/achievement/ministry/admin page fixes

### Subagent 3 — Backend / Data / Security Engineer (GPT-5.3-Codex)
Responsibilities:
- Prisma issues
- server actions
- upload and document download behavior
- Telegram link behavior
- role model enforcement
- rate limiting
- brute-force protection
- session limits
- password hashing
- login security
- audit logging of authentication events
- hidden admin entry via emblem click pattern

### Subagent 4 — QA / Verification / Release Engineer (GPT-5.3-Codex)
Responsibilities:
- Reproduce bugs before fixes where possible
- build verification matrix
- regression testing
- e2e/manual flow scripts
- performance checks
- mobile verification checklist
- release notes
- deployment verification if deployment is possible in the existing environment

Subagents must work on bounded scopes and report findings back to the Team Lead. The Team Lead decides merges and conflict resolution.

---

## 3. Non-Negotiable Engineering Rules

- Preserve existing project conventions where possible.
- Do not rewrite the whole app.
- Prefer minimal, reliable, production-grade changes.
- All user-facing Russian text must be natural and consistent.
- All admin text that should be Russian must be translated into Russian.
- Fix root causes, not only symptoms.
- Avoid introducing breaking schema changes unless required.
- If schema changes are required, create proper Prisma migrations.
- Do not leave dead code or partial experiments.
- If a field is removed from UI, also review the backend validation and persistence rules for that field.
- If hidden entry points are added, they must **not** bypass authentication.
- Security through obscurity must never be treated as the only security layer.

---

## 4. Audit Deliverables Required Before Any Major Code Change

Before implementing the batch, produce a concise but useful audit inside the repository, for example in:

- `docs/audit/pre_fix_audit.md`

That audit must include:

1. Current stack and versions (where detectable)
2. Current routing map
3. Current auth flow and role model
4. Current data model overview
5. Current admin panel structure
6. Current public sections and content dependencies
7. Root cause hypotheses for each verified bug
8. Risk areas
9. Proposed implementation order

After all work is finished, create:

- `docs/audit/post_fix_audit.md`
- `docs/release/fix_batch_release_notes.md`

---

## 5. Required Fix Batch — Detailed Scope

Implement all of the following unless a requirement is technically impossible in the current architecture. If impossible, document the reason and provide the best safe alternative.

### 5.1 Event Card / Event Detail Cleanup

#### Public event card and/or detail page requirements:
- Remove the user-visible field: `Status: COMPLETED` from places where ordinary users should not see raw internal status labels in English.
- Remove the field: `Related news` from public event cards/details if it is currently displayed there.
- In event detail pages, add a button that returns the user to **all events**.
- Scheduled events must support **date + time**, not only date.
- Public users must be able to see the scheduled event time.
- Event status display must be properly localized into Russian for public users.
- Status must automatically change from planned/scheduled to completed/conducted when the scheduled date-time threshold is reached, according to the chosen business rule.
- Events must be sorted by event date-time.

### 5.2 Document Download Fixes

- Fix document download so the file actually downloads successfully.
- Documents that are supposed to be `.docx` must download with the correct `.docx` extension and a sane filename.
- Audit MIME type handling, headers, streaming behavior, file storage path logic, and the admin upload path.
- Ensure admin-side document creation/edit flow remains correct after the fix.

### 5.3 Initiative Submission Form Fixes

Current issue includes a Next.js server actions error:
- `A "use server" file can only export async functions, found object...`

You must:
- Find the exact root cause in the initiative page/server action form state structure.
- Fix the server action export pattern correctly for the current Next.js/App Router architecture.
- Ensure initiative form submission works end-to-end.
- Rename field `Имя` to `ФИО`.
- Remove the checkbox `Отправить анонимно`.
- Telegram links for idea submission must open the Telegram profile **`@alisa_boris`**.
- In fact, all Telegram links across the site that are intended to point to the parliament contact must open that same profile.

### 5.4 Gallery Rework

Implement the gallery with the following behavior:

- The gallery must contain **photos only**.
- Gallery items must be sourced from:
  - news
  - events
  - other supported content entities if already modeled
  - manually uploaded gallery entries through the admin panel
- In the public gallery, photos must be displayed with descriptions.
- If a photo comes from a news item or another entity, its description should inherit from the source entity description/title logic as appropriate.
- If a photo is uploaded directly via the admin panel, the admin must be able to:
  - upload the photo
  - enter the description
  - edit only those fields later
  - delete the photo
- Review gallery rendering and content normalization so it does not produce broken, duplicated, or captionless items.

### 5.5 Contacts Page Changes

On the contacts page:
- Remove Email field.
- Remove Phone field.
- Remove old Address field.
- Replace address with exactly:
  - `Московская область, г. Можайск, улица Полосухина, 3А`
- Ensure all Telegram contact links point to `@alisa_boris`.

### 5.6 Mobile Responsiveness Fixes

Current behavior: on phones the site is displayed only on half of the screen or otherwise broken.

You must:
- perform a full responsive audit across public pages and admin pages,
- identify root causes,
- fix viewport/layout/container/overflow issues,
- verify correct behavior on common mobile widths,
- ensure header, cards, forms, tables, rich text sections, admin panels, and modal dialogs behave correctly.

This is not a cosmetic fix. Treat it as a structural responsive reliability task.

### 5.7 Initiative Status Visibility and Implemented Initiatives Logic

- Raw English status labels like `IMPLEMENTED` must not be shown to public users.
- Public initiative statuses must be localized into Russian.
- If an initiative status is changed to implemented/realized, it must correctly appear in the **Implemented Initiatives** section.
- Audit both backend filtering and frontend rendering for implemented initiatives.

### 5.8 News Detail Back Button

- When the user opens a specific news item, there must be a button returning them to **all news**.

### 5.9 Scheduled Publication — Date + Time

For news publishing:
- scheduled publication must support **date and time**, not only a date.
- sort news by publication date-time.
- ensure public listing logic respects publication date-time and publication state.

Also document the semantic difference between statuses like **Draft** and **Archive** in admin-facing Russian help text or documentation if such status explanation is currently missing or confusing.

### 5.10 Dark Theme and Accessibility Mode Completion

- Dark theme currently does not apply to the site header. Fix it.
- Admin panel currently has no theme selection and no visually impaired mode. Add both.
- Visually impaired mode must be meaningful, not fake. It should at least include:
  - higher contrast,
  - larger base text,
  - improved spacing,
  - better focus visibility,
  - safer color choices.
- Ensure both public site and admin panel support theme/accessibility mode consistently.

### 5.11 Form Validation Fixes in Admin Panel

Fix validation / submission bugs where forms incorrectly claim required fields are missing even when they were filled.

Specifically:
- Creating a new document currently may show `Добавьте описание` incorrectly. Fix it.
- Creating a new event currently may show `Укажите название события` incorrectly. Fix it.
- Review the validation layer end-to-end: schema, form binding, controlled/uncontrolled values, server parsing, optional trimming, localization.

### 5.12 Reports Editing Changes

For reports:
- remove the field `Краткое описание`
- keep only the report text/content field
- update backend model handling, UI forms, and admin validation accordingly
- preserve existing data safely if the field existed before

### 5.13 Achievements Editing Changes

For achievements:
- remove the field `Событие`
- remove the field `Краткое описание`
- allowed statuses must only be:
  - `Опубликовано`
  - `Черновик`
- update forms, schemas, database logic, public rendering, filters, and admin editing UI accordingly

### 5.14 Ministry Edit Prisma Error

There is a verified error during ministry editing:

`PrismaClientKnownRequestError ... Unique constraint failed on the fields: (ministerMemberId)`

Likely scenario: the same member is assigned as minister to multiple ministries.

You must:
- audit the Prisma schema and business rules,
- decide the correct domain behavior,
- implement the correct fix.

Most likely correct outcome:
- either prevent duplicate minister assignment with a good Russian UI error,
- or redesign the relationship if the business rules actually allow reuse.

Do not just swallow the error. Implement a real domain-correct solution.

### 5.15 “Join Parliament” Static Page Editing Fix

Current issue: only part of the page content is editable.

Make sure the entire intended content block is editable, including all paragraphs, for example content like:

- intro paragraph
- preparation instruction
- class/interests/ideas instruction
- submission instruction via curator or Telegram

Audit the CMS/static page model and fix partial-content editing limitations.

### 5.16 Role Model / Permissions / Russian Labels

Current admin-facing labels and permissions are confusing.

You must:
- Translate user classification / role labels into Russian where appropriate.
- Translate `Observability` into Russian in the UI.
- Review access control model.

Required access policy:

#### Account `admin`
- full access to everything
- only this account may have full access to Users and Observability sections

#### Account `president`
- access to everything **except** Users and Observability

#### Account `minister`
- access to everything **except**:
  - Users
  - Observability
  - Settings
  - Pages
  - Structure/Composition (`Состав`)

Implement this correctly in both navigation visibility and backend authorization.
Do not rely only on hidden menu items.

### 5.17 Hidden Admin Entry via School Emblem

Implement admin panel entry via the school emblem using this exact trigger:

- **7 clicks/taps within 3 seconds** on the school emblem
- then open the admin login form

Important:
- Clicking the parliament title text must still open the home page normally.
- The hidden emblem trigger must **not** bypass authentication.
- It is only a reveal/open mechanism for the login form.
- It must work on both desktop and mobile.

### 5.18 Security Hardening

Implement proper security improvements, at minimum:

- rate limiting for login attempts and sensitive auth endpoints
- brute-force protection
- login attempt logging
- session limitation / session control
- passwords stored in the database only as hashes
- review authentication/session cookie security settings
- basic secure defaults for production deployment

If some of these are already present, audit and improve them instead of duplicating them.

### 5.19 Sorting Rules

- News must be sorted by publication date-time.
- Events must be sorted by event date-time.
- Public sections should respect the intended chronology.

---

## 6. UX and Content Quality Requirements

- Remove raw internal English status strings from public UI.
- Public-facing Russian text must be consistent and natural.
- Buttons like “Back to all news” and “Back to all events” must be visible and sensible.
- Empty states should be written cleanly in Russian and should not mention internal tooling, admin panel wording, or implementation details unless explicitly intended.
- Telegram behavior must be consistent everywhere.

---

## 7. Stack Handling Rules

During audit, determine the real stack. Most likely there is already:
- Next.js App Router
- TypeScript
- Prisma
- React
- some form/state library
- some validation layer
- some auth/session implementation

Preserve the existing stack.

If missing, ensure the repository contains at least:
- `requirements.txt` only if the project actually contains Python components that require it

Do **not** add a meaningless `requirements.txt` to a pure Node/Next.js project.
If there is no Python runtime in the project, explicitly document why `requirements.txt` is not applicable.

For Node dependencies, ensure standard files remain correct:
- `package.json`
- lockfile
- Prisma schema/migrations if applicable
- environment example file if needed

---

## 8. Testing and Verification Requirements

You must test the system after changes.

At minimum run and document:
- dependency install
- lint
- type check
- build
- tests if present
- migration check if schema changed
- manual verification of critical flows

Critical flows to verify manually:
1. open home page on desktop and mobile
2. navigate major public sections
3. submit initiative form successfully
4. open Telegram contact links
5. download document as `.docx`
6. create/edit document in admin
7. create/edit scheduled news with date + time
8. create/edit scheduled event with date + time
9. verify auto status transitions logic
10. create/edit ministry without crashing
11. create/edit achievement with new field rules
12. create/edit report without short description field
13. gallery render from source entities and manual uploads
14. dark theme on public site including header
15. dark theme and accessibility mode in admin panel
16. hidden admin login trigger via emblem on desktop and mobile
17. access control by `admin`, `president`, and `minister`
18. verify only `admin` can access Users and Observability
19. verify login protection and hashed password storage

Create a verification document such as:
- `docs/qa/fix_batch_test_report.md`

---

## 9. Deployment / Release Rules

If deployment configuration and credentials already exist in the project environment, the QA / Release subagent may prepare and perform deployment after the Team Lead approves the final state.

If deployment is not possible due to missing secrets or environment access:
- do not fabricate deployment,
- instead produce exact deployment steps and readiness notes.

---

## 10. Documentation Outputs Required

Update or create the following as needed:

- `README.md` — updated setup/run/test instructions
- `docs/audit/pre_fix_audit.md`
- `docs/audit/post_fix_audit.md`
- `docs/qa/fix_batch_test_report.md`
- `docs/release/fix_batch_release_notes.md`
- `docs/security/auth_and_access_control.md`
- `docs/content/statuses_and_public_labels.md`

In `statuses_and_public_labels.md`, explain clearly in Russian and/or admin documentation form:
- difference between Draft and Archive for news,
- public-facing Russian status mapping,
- scheduled vs completed behavior.

---

## 11. Implementation Strategy Recommendation

Recommended execution order:

1. Audit and reproduce issues
2. Fix auth/server action/runtime blockers
3. Fix data model / Prisma relationship issues
4. Fix admin form validation and scheduling logic
5. Fix public rendering and localization issues
6. Fix gallery and document download flows
7. Fix responsive layout and theme/accessibility parity
8. Implement hidden emblem trigger
9. Harden security
10. Run full verification and prepare release notes

---

## 12. Acceptance Criteria

This task is complete only if all of the following are true:

- The initiative form submits correctly without the server action export error.
- Documents download correctly and `.docx` files keep the right extension.
- Telegram links consistently open `@alisa_boris`.
- Public UI no longer shows raw English internal status labels where inappropriate.
- News and events support scheduling by date + time.
- News and events are correctly sorted.
- Event/news detail pages include back navigation.
- Gallery works with photos + descriptions from content and admin uploads.
- Contacts page content is corrected.
- Mobile layout is fixed across public and admin views.
- Implemented initiatives appear correctly in the implemented list.
- Admin panel validation bugs are fixed.
- Report and achievement forms reflect the new field rules.
- Ministry editing no longer crashes on duplicate minister assignment and now behaves according to explicit business logic.
- The entire Join Parliament content block is editable.
- Role permissions match the required access matrix.
- Observability and user-related access is restricted to the correct role(s).
- Dark theme covers the header and admin panel.
- Accessibility mode exists on both public and admin interfaces.
- Hidden admin login via 7 emblem taps/clicks works on desktop and mobile.
- Security hardening is in place and passwords are hashed.
- Audit docs, QA docs, release notes, and updated README exist.
- Final build, type checks, and validations pass.

---

## 13. Final Output Format

At the end of the run, provide:

1. A concise summary of what was found in the audit
2. A list of changed files grouped by domain
3. Schema/auth/security notes
4. Verification results
5. Remaining risks or follow-ups
6. Deployment status

Your standard of work is **senior production engineer quality**.
Do not stop after partial UI edits. Deliver a coherent, tested, secure fix batch.
