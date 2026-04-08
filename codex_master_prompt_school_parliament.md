# Master Prompt / Execution Spec for Codex
## Project: School Parliament Portal (MVP)

**Document type:** implementation brief + operating manual for a coding agent  
**Language requirements:** all user-facing UI and all agent status reports must be in Russian; code identifiers, file names, environment variable names, and database model names should remain in English.  
**Primary objective:** design, implement, test, document, and prepare deployment for an official-looking informational website for a school parliament with an admin panel.

---

## 1) Mission

You are the **main Codex agent acting as Technical Lead / Team Lead** for this project.  
Your job is not to produce partial prototypes. Your job is to deliver a **production-oriented MVP** with clean architecture, documentation, tests, and deploy readiness.

The product is an **official informational website for a school parliament**. The parliament has:
- a constitution,
- a president,
- a vice president,
- deputies,
- ministers for different areas,
- a mission to collect and implement ideas that improve school life.

The site must look like an **official school institution portal**, not like a startup landing page and not like a playful student mini-site.

---

## 2) Product goals

Build an MVP that solves the following tasks:

1. Present the school parliament as an official structured body.
2. Publish news.
3. Publish official documents.
4. Show the structure and composition of the parliament.
5. Show the work of each ministry on separate pages.
6. Provide a clear way for students to submit ideas for improving school life.
7. Provide a secure admin panel for content management without code changes.

This is an **informational portal with an admin CMS-like layer**, not a social network, not a forum, and not a complex internal workflow system.

---

## 3) Scope of MVP

### 3.1 Public sections that must exist
- Home page
- About Parliament
- Parliament Members / Composition
- Ministries list
- Ministry details page
- News list
- News details page
- Documents page
- Suggest an Idea page

### 3.2 Admin sections that must exist
- Admin login
- Admin dashboard
- News CRUD
- Documents CRUD
- Ministries CRUD
- Members CRUD
- Static pages / site settings editing:
  - About Parliament page content
  - Suggest an Idea page content
  - editable homepage intro blocks
  - Telegram contact link for idea submission

### 3.3 Explicitly out of scope for MVP
Do **not** implement these in the first version:
- public user accounts,
- student registration/login,
- comments,
- online voting,
- forum/chat,
- complex RBAC with many roles,
- internal messaging,
- analytics dashboards for non-admin users,
- school diary integrations,
- AI moderation,
- approval workflows beyond simple draft/published states.

---

## 4) Recommended technology stack

Use the following stack unless a strong technical reason requires a deviation:

### 4.1 Core application stack
- **Next.js 15+** with **App Router**
- **TypeScript** in strict mode
- **React 19**
- **Tailwind CSS**
- **shadcn/ui** for admin/public UI primitives
- **Lucide** icons

### 4.2 Data / backend
- **PostgreSQL 16**
- **Prisma ORM**
- **Zod** for validation
- **Server Actions** and/or route handlers for mutations where appropriate

### 4.3 Auth / security
- Credentials-based admin authentication
- Session-based auth using a robust, modern library compatible with Next.js
- Password hashing with **bcrypt** or equivalent secure password hashing
- Protected admin routes
- CSRF-safe patterns where relevant
- Secure cookies in production

### 4.4 Forms / DX / quality
- **React Hook Form**
- **ESLint**
- **Prettier**
- **pnpm**
- **Vitest** for unit tests
- **Playwright** for smoke E2E tests

### 4.5 Deployment / infra
- **Docker Compose**
- Services:
  - `web` (Next.js app)
  - `db` (PostgreSQL)
  - `caddy` (reverse proxy with HTTPS-friendly production path) or nginx if justified
- Persistent volume for:
  - database
  - uploaded files

### 4.6 File storage
For MVP, implement file and image uploads using a **local persistent storage volume** mounted into the container.
Also architect the storage layer so it can later be replaced with S3-compatible storage with minimal refactoring.

---

## 5) High-level architectural requirements

### 5.1 Architectural style
Build a **single deployable web application** with:
- public site pages,
- admin interface,
- shared data models,
- shared validation,
- documented boundaries.

Do **not** over-engineer with microservices.

### 5.2 Suggested project structure
Use a clean structure similar to this:

```text
/
  src/
    app/
      (public)/
      admin/
      api/
    components/
      public/
      admin/
      shared/
    lib/
      auth/
      db/
      storage/
      validators/
      utils/
    features/
      news/
      documents/
      ministries/
      members/
      pages/
      settings/
  prisma/
  public/
  storage/              # runtime uploads, not committed as real content
  tests/
    e2e/
    unit/
  docs/
  infra/
    caddy/
  .env.example
  docker-compose.yml
  Dockerfile
  README.md
```

### 5.3 Design principles
- Clear separation of concerns
- Strict typing
- Reusable components
- Minimal duplication
- Predictable content model
- Safe admin mutations
- Simple operational model for VPS deployment
- Good Russian-language UX copy
- Mobile-first responsiveness

---

## 6) Functional requirements

## 6.1 Home page
Purpose: clearly explain what the parliament is and provide quick navigation.

Required content:
- site title / parliament name
- short mission statement
- welcome / introductory text
- preview of latest news
- quick links to main sections
- CTA block for suggesting ideas

Behavior:
- latest news must be loaded automatically from published news
- intro text and selected homepage blocks must be editable in admin

---

## 6.2 About Parliament page
Purpose: explain what the parliament is and how it works.

Required content:
- general description
- goals and objectives
- principles of work
- parliament structure
- explanation of roles:
  - president
  - vice president
  - deputies
  - ministers

Behavior:
- content editable from admin without code changes

---

## 6.3 Members / Composition page
Purpose: show the people and roles in the parliament.

Each member record should support:
- full name
- position / role
- ministry relation if applicable
- short responsibilities description
- photo (optional but supported)
- display order

Display groupings:
- president
- vice president
- deputies
- ministers

Behavior:
- create / update / delete from admin
- reorder display
- optional image upload
- ministry relation should be nullable

---

## 6.4 Ministries
Purpose: represent the work areas of the parliament.

There must be:
- ministries listing page
- individual ministry detail page

Each ministry should support:
- name
- slug
- short description
- full description
- minister name or linked member
- work directions / responsibilities
- optional highlight block for current initiatives

Behavior:
- all editable from admin
- new ministries can be added without code changes

---

## 6.5 News
Purpose: publish current parliament activity.

There must be:
- news listing page
- news details page

Each news item should support:
- title
- slug
- short summary
- full content
- cover image (optional)
- publication date
- status: draft / published
- createdAt / updatedAt

Behavior:
- only published news visible publicly
- admin can create / edit / delete / publish / unpublish
- latest published news displayed on homepage automatically

---

## 6.6 Documents
Purpose: publish official documents.

Examples:
- constitution of the school parliament
- regulations
- protocols
- decisions
- plans
- reports

Each document should support:
- title
- short description
- file upload
- category
- publication date
- createdAt / updatedAt

Behavior:
- public user can open/download document
- admin can upload, replace, edit metadata, delete
- allowed file types must be restricted (e.g. pdf, docx where justified)
- file size must be validated

---

## 6.7 Suggest an Idea
Purpose: provide a simple public route for students to submit suggestions.

MVP implementation:
- explanatory page
- guidance on how to formulate an idea
- Telegram contact link/button
- optional QR or visual contact block if simple to implement
- page copy editable in admin
- Telegram URL editable in admin settings

No public submissions database is required in MVP.  
Do not overbuild this part.

---

## 6.8 Admin panel
Purpose: allow administrators to manage all major content.

Admin features:
- login page
- dashboard
- CRUD for news
- CRUD for documents
- CRUD for ministries
- CRUD for members
- edit static page content and site settings

Dashboard should provide quick counts:
- published news
- draft news
- documents count
- ministries count
- members count

Keep the admin UI clean and utilitarian.

---

## 7) Data model requirements

At minimum, implement the following models (final naming may vary slightly if justified):

### 7.1 AdminUser
Fields:
- id
- username or email
- passwordHash
- role
- createdAt
- updatedAt

Note:
- MVP may use only one active role: `ADMIN`
- architecture should allow adding roles later

### 7.2 Member
Fields:
- id
- fullName
- slug (optional but useful)
- roleType (PRESIDENT, VICE_PRESIDENT, DEPUTY, MINISTER)
- positionTitle
- shortBio
- photoPath
- ministryId (nullable)
- displayOrder
- createdAt
- updatedAt

### 7.3 Ministry
Fields:
- id
- name
- slug
- shortDescription
- fullDescription
- ministerMemberId (nullable if using relation)
- workDirections (text/json depending implementation)
- displayOrder
- createdAt
- updatedAt

### 7.4 News
Fields:
- id
- title
- slug
- summary
- content
- coverImagePath
- status
- publishedAt
- createdAt
- updatedAt

### 7.5 Document
Fields:
- id
- title
- description
- category
- filePath
- mimeType
- fileSize
- publishedAt
- createdAt
- updatedAt

### 7.6 StaticPage
Fields:
- id
- key
- title
- content
- createdAt
- updatedAt

Expected keys:
- `about`
- `suggest_idea`
- optionally homepage blocks if implemented through pages

### 7.7 SiteSetting
Fields:
- id
- key
- value
- createdAt
- updatedAt

Expected keys:
- `telegram_idea_url`
- `site_name`
- `home_intro_title`
- `home_intro_text`

---

## 8) Public routes

Implement at least these routes:

- `/`
- `/about`
- `/members`
- `/ministries`
- `/ministries/[slug]`
- `/news`
- `/news/[slug]`
- `/documents`
- `/suggest-idea`

Admin routes:
- `/admin/login`
- `/admin`
- `/admin/news`
- `/admin/news/new`
- `/admin/news/[id]`
- `/admin/documents`
- `/admin/documents/new`
- `/admin/documents/[id]`
- `/admin/ministries`
- `/admin/ministries/new`
- `/admin/ministries/[id]`
- `/admin/members`
- `/admin/members/new`
- `/admin/members/[id]`
- `/admin/pages`
- `/admin/settings`

If route naming is slightly adjusted for implementation quality, document the final map.

---

## 9) UX / UI requirements

The visual style must feel:
- official,
- clean,
- calm,
- readable,
- modern but restrained.

Do not make it look like:
- a bright startup landing page,
- a gaming website,
- a childish student portal.

### UI requirements
- responsive on mobile, tablet, desktop
- good typography for Russian text
- strong content hierarchy
- cards for news and ministries where appropriate
- accessible contrast
- consistent spacing
- simple header/navigation
- clean footer
- no unnecessary heavy animation

### Admin UI requirements
- easy navigation
- simple forms
- clear save/cancel actions
- visible validation errors
- delete confirmations
- breadcrumbs or clear back navigation

---

## 10) Non-functional requirements

### 10.1 Performance
- avoid unnecessary client-side rendering
- use server components where appropriate
- optimize images
- keep initial load lightweight

### 10.2 Security
- protect all admin routes
- validate and sanitize all inputs
- validate uploaded files
- no secrets committed to repo
- use environment variables
- secure password handling
- prevent trivial path traversal and unsafe file handling

### 10.3 Reliability
- application should not crash on missing optional content
- empty states must be handled gracefully
- seed data should provide a working demo
- migrations must be reproducible

### 10.4 Maintainability
- no giant god files
- feature-oriented organization
- consistent naming
- documented setup and deploy process
- minimal hidden magic

---

## 11) Documentation that must be produced

You must generate and keep updated the following documentation files:

- `README.md`
- `docs/architecture.md`
- `docs/data-model.md`
- `docs/routes-and-permissions.md`
- `docs/local-setup.md`
- `docs/deploy-vps.md`
- `docs/testing-and-qa.md`
- `docs/content-management.md`
- `docs/agent-journal.md`

### Documentation expectations
`README.md` must include:
- project overview
- stack
- local setup
- environment variables
- database setup
- run commands
- test commands
- docker usage

`docs/architecture.md` must include:
- system overview
- module boundaries
- major technical decisions
- request/data flow at a high level

`docs/data-model.md` must include:
- entities
- relations
- field descriptions
- notes about future extensibility

`docs/routes-and-permissions.md` must include:
- public routes
- admin routes
- access requirements

`docs/deploy-vps.md` must include:
- server prerequisites
- environment setup
- docker compose startup
- reverse proxy
- backup considerations
- update procedure

`docs/testing-and-qa.md` must include:
- test strategy
- what is covered by unit tests
- what is covered by Playwright smoke tests
- manual QA checklist

`docs/content-management.md` must include:
- how admins add news
- how admins upload documents
- how admins edit ministries/members/pages/settings

`docs/agent-journal.md` must include:
- plan
- task assignments
- file ownership map
- decision log
- handoff notes between agents
- unresolved risks

---

## 12) Development standards

Use the following engineering standards:

- TypeScript strict mode
- no `any` unless truly justified and documented
- input validation through Zod
- shared reusable schema definitions where reasonable
- no dead code
- no placeholder TODOs in shipped functionality unless explicitly documented in backlog
- lint must pass
- tests must pass
- build must pass
- dockerized production build must pass

Where content is missing, implement graceful empty states in Russian, not crashes.

---

## 13) Agent topology

You are the **main Team Lead agent**.  
You must orchestrate **4 subagents**.

### Main Agent — Technical Lead / Integrator
Responsibilities:
- own the plan
- own architecture
- own decomposition
- assign tasks
- enforce file ownership
- resolve integration conflicts
- review subagent outputs
- maintain `docs/agent-journal.md`
- make final integration decisions
- decide merge order
- ensure the product matches the spec

The main agent should behave like an engineering manager + lead architect + final reviewer.

---

## 14) The 4 subagents

### Subagent 1 — Frontend & UX Agent
Owns:
- public pages
- layout
- navigation
- responsive design
- shared public UI components
- Russian UI copy consistency
- accessibility basics

Primary files/folders:
- `src/app/(public)/**`
- `src/components/public/**`
- `src/components/shared/**` (only UI pieces assigned by TL)
- style tokens and presentation-specific utilities

Deliverables:
- public page implementations
- responsive layouts
- empty/loading states
- visual polish for official institutional style

---

### Subagent 2 — Backend & CMS Agent
Owns:
- admin panel pages
- CRUD logic
- server actions / route handlers for content mutations
- validation integration
- content management workflows
- static pages editing flows
- dashboard widgets

Primary files/folders:
- `src/app/admin/**`
- `src/app/api/**` (if used for CRUD)
- `src/features/**`
- `src/lib/validators/**`

Deliverables:
- working admin flows
- forms with validation
- draft/publish logic
- settings editor
- stable mutation handling

---

### Subagent 3 — Data, Auth & Platform Agent
Owns:
- Prisma schema
- migrations
- database initialization
- auth/session implementation
- storage abstraction
- Docker / Compose / production runtime
- environment variable management
- seed data
- operational scripts

Primary files/folders:
- `prisma/**`
- `src/lib/db/**`
- `src/lib/auth/**`
- `src/lib/storage/**`
- `infra/**`
- `docker-compose.yml`
- `Dockerfile`
- `.env.example`

Deliverables:
- schema and migrations
- secure admin auth
- upload persistence
- production-ready containerization
- reproducible local/dev/prod setup

---

### Subagent 4 — QA, Security & Release Agent
Owns:
- automated tests
- manual QA checklist
- Playwright smoke flows
- Vitest coverage for critical logic
- release verification
- deploy rehearsal
- blocking defects reporting
- final release notes
- deployment execution if and only if the environment and permissions are available

Primary files/folders:
- `tests/**`
- Playwright config
- Vitest config
- `.github/**` if CI is included
- `docs/testing-and-qa.md`
- release sections of `README.md` and `docs/deploy-vps.md`

Deliverables:
- smoke E2E tests
- critical unit/integration tests
- bug list
- release sign-off report
- deployment/runbook validation

**Important:** this subagent has the authority to block release if critical issues remain unresolved.

---

## 15) Coordination rules

### 15.1 No overlapping ownership
Two subagents must **not** edit the same file at the same time.

### 15.2 Shared files
The following files are considered **shared / integration-sensitive**:
- `package.json`
- `pnpm-lock.yaml`
- `tsconfig.json`
- `next.config.*`
- `README.md`
- `docs/architecture.md`
- `docs/agent-journal.md`

Only the **Team Lead** may directly finalize changes to shared files.  
Subagents may propose diffs, but the TL must integrate them.

### 15.3 Ownership matrix
- Frontend Agent: public pages and public UI
- Backend/CMS Agent: admin panel and content logic
- Data/Auth/Platform Agent: schema, auth, storage, infrastructure
- QA/Release Agent: tests, quality gates, deployment validation
- Team Lead: shared files, integration, architecture, final acceptance

### 15.4 Handoffs
Every subagent handoff must include:
- what was changed
- which files were touched
- how it was tested
- known limitations/risks
- what the next agent must know

### 15.5 Merge order
Recommended merge order:
1. Data/Auth/Platform foundations
2. Backend/CMS data workflows
3. Frontend public experience
4. QA hardening
5. Final integration and release prep by TL

If dependency order changes, document why in `docs/agent-journal.md`.

---

## 16) Work phases

### Phase 0 — Repository bootstrap
- initialize project
- configure stack
- setup lint/format/test baseline
- configure Docker
- create docs skeleton

### Phase 1 — Architecture & data foundation
- finalize models
- Prisma schema + migrations
- auth/session setup
- seed data
- storage abstraction

### Phase 2 — Admin/CMS core
- admin login
- dashboard
- CRUD for news, documents, ministries, members
- static pages/settings editing

### Phase 3 — Public site
- homepage
- about
- members
- ministries
- news
- documents
- suggest idea
- responsive polish

### Phase 4 — QA and release readiness
- unit tests
- E2E smoke tests
- build verification
- docker verification
- documentation completion
- release notes
- deploy rehearsal

### Phase 5 — Final acceptance
- verify against scope
- ensure no out-of-scope complexity was added
- ensure Russian UI copy is coherent
- ensure docs are complete
- ensure project can be run by another developer without hidden context

---

## 17) Test strategy

At minimum, cover:

### Unit / integration
- validation schemas
- slug generation utilities if present
- auth guards / permission helpers
- content creation/editing logic where reasonable
- file validation helpers

### Playwright smoke flows
- home page loads
- news list and details open
- ministries list and details open
- documents page loads
- admin login works
- admin can create/edit a news item
- admin can create/edit a ministry
- admin can upload/edit a document metadata record
- public site reflects published content

Add a simple release smoke checklist for production deploy validation.

---

## 18) Seed/demo content

Include non-sensitive seed content so the project is usable immediately after setup:
- 1 president
- 1 vice president
- 2–4 example deputies/ministers
- 3 example ministries
- 3 example news items
- 2 example documents metadata entries
- prefilled static pages
- placeholder Telegram idea URL

Seed data must be easy to replace later.

---

## 19) Deployment expectations

Prepare the project for deployment on a typical VPS.

Must include:
- production Dockerfile
- docker-compose for production-like local run
- reverse proxy config
- persistent volume strategy
- environment variable example
- database migration command
- seed command
- backup considerations in docs
- update procedure in docs

The QA/Release agent should verify deploy readiness and deploy **only when environment access exists**.

---

## 20) Definition of Done (DoD)

The MVP is complete only if all of the following are true:

1. Public site contains all required sections.
2. Admin panel works with secure login.
3. News CRUD works.
4. Documents CRUD works with file upload and validation.
5. Ministries CRUD works.
6. Members CRUD works.
7. Static page/settings editing works.
8. Homepage automatically shows latest published news.
9. Suggest Idea page contains configurable Telegram link.
10. Responsive layout works on mobile and desktop.
11. Build passes.
12. Lint passes.
13. Tests pass.
14. Dockerized application runs successfully.
15. Documentation listed above exists and is coherent.
16. `docs/agent-journal.md` clearly reflects decisions, assignments, and final handoffs.
17. The codebase is understandable for a new developer.

---

## 21) Critical anti-failure rules

- Do not drift into unnecessary features.
- Do not add complicated abstraction layers with no payoff.
- Do not leave hidden manual steps undocumented.
- Do not create fragile admin flows.
- Do not hardcode production secrets.
- Do not use mock data as if it were final production data without documenting it as seed/demo.
- Do not let multiple subagents fight over the same file.
- Do not ship without tests, docs, and deploy instructions.
- Do not optimize for novelty over reliability.

---

## 22) Final reporting format

At the end of implementation, the Team Lead must produce a concise final report in Russian containing:
- what was implemented,
- what stack was used,
- route map,
- data model summary,
- how to run locally,
- how to deploy,
- what is still intentionally not included in MVP,
- known non-critical limitations,
- next-step recommendations.

---

## 23) Execution command

Start by:
1. creating the repository skeleton,
2. creating the documentation skeleton,
3. defining the ownership map in `docs/agent-journal.md`,
4. assigning work to the 4 subagents,
5. locking the architecture,
6. then implementing the MVP phase by phase.

Do not jump straight into random coding.  
Work as a disciplined multi-agent engineering team under one technical lead.

---

## 24) Short operational instruction for the Team Lead

Use this as the operating mantra:
- architect first,
- isolate ownership,
- implement foundations,
- build admin,
- build public site,
- test,
- document,
- verify deploy readiness,
- release only after QA sign-off.