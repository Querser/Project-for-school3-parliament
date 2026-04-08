# School Parliament — Full Product Master Prompt for Codex

## 1) Your role and mission

You are the **lead Codex agent acting as the technical lead, software architect, and delivery owner** for the next stage of the project.

**Current state:** the MVP already exists and is implemented.

**Your task:** evolve the existing MVP into the **full production-ready version** of the School Parliament platform without breaking working MVP functionality.

You must treat the current repository as the source of truth, begin with a codebase audit, preserve what already works, and extend it into a scalable, maintainable, well-documented product.

This is **not** a throwaway prototype task. Build a real product foundation.

---

## 2) Execution contract

### Non-negotiable rules

1. **Do not rewrite blindly.** Start by auditing the current MVP, understanding the architecture, and identifying what can be kept, refactored, or replaced.
2. **Preserve working functionality.** Existing MVP features must continue to work unless a change is required for architecture, security, or product consistency.
3. **Prefer incremental refactoring over destructive rewrites.** If a subsystem must be replaced, document why.
4. **Design for scale.** The platform must be easy to extend, horizontally scalable where reasonable, and safe to operate.
5. **Write documentation continuously.** Do not postpone docs until the end.
6. **Use isolated workstreams.** No two subagents may edit the same file at the same time.
7. **All code must be production-grade.** No mock architecture, no fake telemetry, no placeholder security, no pseudo-implementations in delivered code.
8. **Create `requirements.txt`.** The Python backend must have a real pinned `requirements.txt` file.
9. **Implement complete logging and telemetry.** The main admin must be able to inspect operational, security, audit, and usage information from the admin panel.
10. **Verification is mandatory.** The QA/Release agent must run tests, validate the build, validate migrations, validate observability, and prepare deployment.

### Delivery philosophy

Build the platform as a **modular monolith** with strong internal boundaries. The product must feel simple to operate now, while remaining easy to split into services later if growth requires it.

---

## 3) Product goal

Build the full version of an official-looking digital platform for a school parliament.

The platform must serve four core purposes:

1. **Official public portal** — present the parliament, its structure, documents, ministries, events, and achievements.
2. **Operational content platform** — allow staff and approved student admins to manage news, documents, reports, events, galleries, initiatives, and static pages.
3. **Participation channel** — allow students to submit ideas and feedback in a structured way, while also supporting Telegram-based communication.
4. **Administrative control and observability center** — allow the chief admin to see system logs, audit trails, telemetry, user activity, session activity, and platform health.

---

## 4) Functional scope of the full product

The existing MVP must be expanded into the following full product scope.

### 4.1 Public website

Implement the following public sections:

1. **Home**
   - hero section with mission, goals, and call to action
   - latest news block
   - upcoming events block
   - ministries overview
   - achievements overview
   - quick links to documents and idea submission

2. **About the Parliament**
   - mission
   - governance model
   - structure
   - constitutional principles
   - roles: president, vice president, deputies, ministers

3. **Parliament Structure / Members**
   - president
   - vice president
   - deputies
   - ministers
   - optional advisors / curators
   - profile cards with role, ministry, duties, photo, active term

4. **Ministries**
   - individual page for each ministry
   - minister profile
   - mission of the ministry
   - current projects
   - reports
   - related news
   - planned initiatives

5. **News**
   - list page
   - detail page
   - categories / tags
   - cover image / gallery support
   - draft / scheduled / published states
   - related ministry links
   - related event links

6. **Documents Library**
   - constitution
   - regulations
   - protocols
   - decisions
   - reports
   - downloadable files
   - categories, search, filters, version metadata

7. **Events / Calendar**
   - calendar view and list view
   - event detail page
   - event category
   - organizer
   - location
   - start / end date and time
   - status: planned / completed / cancelled
   - related ministry and related news links

8. **Initiatives / Ideas**
   - public page describing how students can propose ideas
   - **native submission form** on the site
   - **Telegram deeplink / contact link** as an additional channel
   - ability to submit with name or anonymously if product owner approves
   - optional attachments if justified
   - public aggregate showcase of approved ideas or implemented ideas

9. **Reports of Ministries**
   - monthly or period-based reports
   - searchable archive
   - relation to ministry pages

10. **Gallery**
    - albums
    - event galleries
    - media captions
    - lightweight and optimized media delivery

11. **Achievements**
    - completed initiatives
    - visible impact on school life
    - timeline of success stories

12. **Join the Parliament**
    - explanation of participation opportunities
    - application instructions
    - optional application form or contact workflow

13. **Feedback / Contact**
    - contact information
    - Telegram link
    - formal contact block
    - optionally a website feedback form

14. **Global Search**
    - search across news, documents, ministries, events, reports, and achievements
    - relevant ranking and filter controls

15. **Accessibility and responsive UX**
    - mobile-first responsive behavior
    - accessible semantic markup
    - keyboard-friendly admin and public UI where practical

### 4.2 Admin platform

Implement a full admin platform with the following modules:

1. **Dashboard**
   - summary metrics
   - content status overview
   - recent activity
   - pending moderation queue
   - system health overview

2. **Content management**
   - news CRUD
   - documents CRUD
   - ministries CRUD
   - members CRUD
   - events CRUD
   - reports CRUD
   - gallery CRUD
   - achievements CRUD
   - static pages CRUD
   - homepage blocks / sections configuration

3. **Idea moderation center**
   - incoming initiatives list
   - filters by status, date, ministry, priority
   - statuses: new / under review / accepted / in progress / implemented / rejected / archived
   - internal notes
   - moderation history
   - assignment to responsible ministry or admin
   - optional Telegram notification integration for new submissions

4. **Publication workflow**
   - draft, scheduled, published, archived
   - preview where practical
   - author attribution
   - publish / unpublish controls

5. **User and access management**
   - chief admin
   - admin
   - editor
   - ministry editor
   - analyst / observer
   - permission matrix
   - invitation / password reset flows
   - disable / enable accounts

6. **Audit center**
   - all admin actions must be audited
   - who changed what, when, from where, and before/after snapshots where appropriate

7. **Observability center**
   - logs viewer
   - telemetry viewer
   - traffic analytics
   - performance analytics
   - security events
   - error overview
   - active session overview
   - user activity timeline

8. **Site settings**
   - branding
   - contact details
   - Telegram links
   - footer settings
   - SEO defaults
   - social preview defaults
   - analytics toggles
   - feature flags where justified

---

## 5) Critical observability requirements

This section is mandatory and must be implemented seriously.

### 5.1 Complete logging

Implement **structured centralized application logging**.

The chief admin must be able to see logs inside the admin platform.

Required log groups:

1. **HTTP request logs**
   - timestamp
   - request id / correlation id
   - method
   - path
   - status code
   - latency
   - authenticated user if applicable
   - IP address
   - user agent

2. **Authentication and security logs**
   - login success
   - login failure
   - logout
   - password reset events
   - token/session revocation
   - suspicious activity
   - permission denied events

3. **Audit logs**
   - entity created
   - entity updated
   - entity deleted
   - before/after summary
   - actor
   - timestamp
   - origin IP
   - user agent

4. **Business domain logs**
   - idea submitted
   - idea status changed
   - news published
   - document replaced
   - event created / cancelled
   - report published
   - gallery updated

5. **Background job logs**
   - scheduled jobs
   - async processing events
   - job success/failure
   - retry events

6. **System and error logs**
   - unhandled exceptions
   - dependency failures
   - DB connectivity issues
   - email / Telegram integration failures
   - storage issues

### 5.2 Telemetry and analytics

Implement full telemetry for the platform.

The chief admin dashboard must expose:

1. **Traffic analytics**
   - total visits
   - unique visitors
   - sessions
   - pageviews
   - popular pages
   - entry pages
   - exit pages
   - referrers

2. **Engagement analytics**
   - session duration
   - bounce-like metrics or short-session metrics
   - click-through on idea submission CTA
   - downloads of documents
   - event page engagement

3. **Content analytics**
   - most viewed news
   - most downloaded documents
   - most visited ministry pages
   - initiative submission volume over time

4. **Operational telemetry**
   - API response times
   - error rate
   - job queue health
   - DB health indicators
   - cache health indicators
   - uptime-like status if implemented

5. **Frontend performance telemetry**
   - core web vitals where practical
   - page load timings
   - frontend errors

### 5.3 User and session intelligence in admin panel

The chief admin account must have access to detailed information about authenticated admin users and, where legally and ethically appropriate, site sessions.

For authenticated admin accounts, show:

- user id
- email / username
- role
- account status
- active sessions
- session start time
- last activity time
- session duration
- login history
- logout history
- failed login history
- IP addresses
- browser
- OS
- device type
- user agent
- country / city from GeoIP if configured
- password reset history
- forced logout / revoke controls

For public traffic, implement telemetry in a privacy-aware way and make the behavior configurable. By default:

- collect analytics sessions
- log security-relevant IPs in server logs
- anonymize or hash public visitor IPs for analytics storage unless explicitly configured otherwise
- provide a privacy notice / configurable consent banner if required by deployment policy

### 5.4 Observability UX inside admin

The admin panel must include:

- filters by time range
- filters by severity
- filters by user
- filters by module
- filters by IP
- filters by request id / correlation id
- export to CSV/JSON where appropriate
- pagination for heavy logs
- clear separation between logs, audit history, analytics, and health metrics

---

## 6) Scalability and architecture requirements

The system must be easy to scale and maintain.

### Architecture style

Use a **modular monolith** with clear domain modules and clean boundaries.

### Required qualities

1. **Stateless application containers** where practical.
2. **Externalized state** in PostgreSQL, Redis, and object/file storage.
3. **Background task processing** for non-request work.
4. **File/media storage abstraction** — local in development, object storage capable in production.
5. **Config-driven environment separation** — development, staging, production.
6. **Horizontal-scale-friendly design** — no dependence on local process memory for critical state.
7. **Search abstraction** — begin with PostgreSQL full-text search unless a stronger search engine is justified.
8. **Extensible domain model** — future features must be easy to add.
9. **Observability-first design** — correlation IDs, structured logs, health endpoints, metrics hooks.

### Suggested architecture boundaries

- `accounts`
- `core`
- `news`
- `documents`
- `ministries`
- `members`
- `events`
- `initiatives`
- `reports`
- `gallery`
- `achievements`
- `search`
- `analytics`
- `audit`
- `telemetry`
- `settings`

---

## 7) Recommended technology stack

Unless the audited codebase creates a strong reason to deviate, implement the full version on the following stack.

### Backend

- **Python 3.12+**
- **Django** as the core backend framework
- **Django REST Framework** for API endpoints
- **PostgreSQL** as the main relational database
- **Redis** for caching, rate limiting support, and background tasks
- **Celery** for asynchronous jobs
- **Gunicorn** for production application serving
- **OpenTelemetry** instrumentation for traces/metrics/log correlations where practical
- **Sentry** or equivalent error monitoring integration hooks

### Frontend

- **Next.js + React + TypeScript**
- **Tailwind CSS** for styling
- **shadcn/ui or equivalent accessible component system** for admin and public UI
- **TanStack Query** for server state in the frontend admin app
- **Zod** for runtime schema validation on forms and API contracts where useful

### Infrastructure / delivery

- **Docker** for containerized environments
- **docker-compose** for local development and simple deployments
- **Nginx or Caddy** as reverse proxy
- **GitHub Actions** or equivalent CI pipeline
- **Object storage abstraction** (local dev + S3-compatible production support)

### Why this stack

- Django gives a very strong base for authentication, administration, permissions, mature ORM behavior, and reliable backend delivery.
- Next.js provides an excellent public-facing frontend and admin UX foundation.
- PostgreSQL is a robust relational core and can support search, analytics queries, and structured domain data well.
- Redis and Celery allow background jobs, caching, and operational maturity.
- OpenTelemetry plus structured logs creates a real observability foundation instead of fake dashboard-only analytics.

### Dependency management requirement

Create and maintain:

- `requirements.txt` for the Python backend with **pinned versions**
- `package.json` for the frontend
- `.env.example`
- `docker-compose.yml`
- `docker-compose.prod.yml` if justified

---

## 8) Domain model expectations

At minimum, define models/entities for:

- users
- roles / permissions
- admin sessions
- security events
- audit events
- ministries
- members
- news
- news categories / tags
- documents
- document categories / versions
- events
- initiatives
- initiative comments / moderation notes
- reports
- galleries / gallery items
- achievements
- static pages
- homepage blocks
- telemetry events / analytics aggregates as appropriate
- system settings

Model design must favor:

- explicit ownership
- timestamps (`created_at`, `updated_at`)
- publication states where relevant
- soft delete where justified
- traceability of changes
- performance-conscious indexing

---

## 9) API and application behavior

Design a clean API surface for the admin and public site.

### Public API surface

- public pages and section data
- public news list/detail
- public documents list/detail/download metadata
- public ministries and member information
- public events list/detail
- idea submission endpoint
- search endpoint
- gallery endpoints
- achievements endpoints

### Admin API surface

- auth/session management
- content CRUD endpoints
- moderation endpoints
- audit and log reading endpoints
- analytics endpoints
- dashboard endpoints
- settings endpoints
- file upload endpoints

### Application behavior requirements

- pagination everywhere appropriate
- filtering and sorting where appropriate
- validation on all write operations
- role-based authorization checks
- rate limiting on sensitive public endpoints
- upload validation and file type restrictions
- XSS/CSRF-safe handling where applicable
- consistent error shape
- correlation/request ids available end-to-end where practical

---

## 10) Full documentation requirements

You must produce real documentation as part of delivery.

Create at minimum:

1. `README.md`
   - product overview
   - repo structure
   - setup
   - run commands
   - testing
   - environment variables

2. `docs/architecture.md`
   - system architecture
   - module boundaries
   - major design decisions
   - scalability notes

3. `docs/product-scope.md`
   - full feature inventory
   - public/admin user roles
   - workflow descriptions

4. `docs/api.md`
   - endpoint inventory
   - auth model
   - request/response conventions

5. `docs/data-model.md`
   - entities
   - relationships
   - indexing notes

6. `docs/observability.md`
   - logging architecture
   - telemetry design
   - analytics design
   - dashboards and data sources
   - retention notes

7. `docs/security.md`
   - auth and session security
   - permission model
   - sensitive data handling
   - privacy-aware telemetry notes

8. `docs/deployment.md`
   - production deployment steps
   - environment variables
   - reverse proxy notes
   - migrations
   - backups and recovery basics

9. `docs/admin-guide.md`
   - how chief admin uses logs, telemetry, content tools, moderation, and user/session management

10. `docs/testing.md`
    - test strategy
    - how to run unit/integration/e2e checks

Documentation must be updated continuously while features are implemented.

---

## 11) Testing and quality gates

The full version is not done unless it is verified.

### Required quality layers

1. **Backend tests**
   - model tests
   - service tests where applicable
   - API tests
   - permission tests
   - logging/audit tests where feasible

2. **Frontend tests**
   - component tests for critical UI
   - page-level tests where practical
   - form validation tests for critical flows

3. **End-to-end tests**
   - login flow
   - news publish flow
   - document upload flow
   - initiative submission + moderation flow
   - logs/telemetry visibility for chief admin

4. **Static quality checks**
   - linting
   - type checks
   - formatting
   - migration validation

5. **Deployment validation**
   - containers build
   - app boots cleanly
   - migrations apply
   - health endpoints respond
   - observability hooks do not crash the app

---

## 12) Security requirements

Implement at least the following:

- secure password hashing
- secure session handling
- CSRF protection where applicable
- permission checks on every admin action
- rate limiting on auth and submission endpoints
- upload validation
- audit trail for admin changes
- session revocation for chief admin
- environment-based secret management
- no secrets hardcoded in repo
- sanitized logs where sensitive content must not leak

If MFA is practical without derailing scope, implement a foundation or extension point for it.

---

## 13) Deployment expectations

The product must be deployable.

Required deployment assets:

- Dockerfiles
- docker-compose for local/dev
- production deployment compose or clear deployment instructions
- reverse proxy configuration
- healthcheck endpoints
- migration strategy
- static/media strategy
- backup guidance for PostgreSQL and uploaded files

The QA/Release agent is responsible for validating deployment readiness and performing deployment if the environment is available and deployment is explicitly requested in the Codex session.

---

## 14) Working method for the main Codex agent

The main Codex agent is the **Team Lead / Technical Director**.

Responsibilities:

1. Audit the existing MVP.
2. Produce the initial implementation plan.
3. Split work into bounded workstreams.
4. Delegate work to four subagents.
5. Prevent file conflicts.
6. Review subagent outputs before integration.
7. Approve merges and integration order.
8. Keep documentation consistent.
9. Maintain system-level architectural integrity.
10. Decide whether a refactor is justified.
11. Ensure the final codebase is coherent, tested, and deployable.

The main agent must stay focused on orchestration, review, integration, and architectural correctness. It should avoid doing all feature implementation itself.

---

## 15) Required subagent topology

Create **exactly four subagents**, each configured as **GPT-5.3-Codex**.

If `GPT-5.3-Codex` is unavailable in the environment, fail loudly and request explicit remapping instead of silently switching models.

### Subagent 1 — Backend Domain Engineer (GPT-5.3-Codex)

Scope:

- Django apps and domain services
- data model design
- migrations
- REST API implementation
- permissions and validation
- search implementation
- content workflows

Owns files primarily under:

- `backend/apps/*`
- `backend/core/*`
- `backend/api/*`
- `backend/tests/api/*`
- `backend/tests/domain/*`

Must not edit:

- frontend UI files except API contract stubs if coordinated
- deployment pipelines unless explicitly instructed by Team Lead

### Subagent 2 — Frontend Public Experience Engineer (GPT-5.3-Codex)

Scope:

- public website pages
- design system usage
- responsive UX
- public search UX
- news, documents, ministries, events, gallery, achievements, join/contact pages
- public initiative submission UX

Owns files primarily under:

- `frontend/app/(public)/*`
- `frontend/components/public/*`
- `frontend/lib/public/*`
- `frontend/tests/public/*`

Must not edit:

- admin internals
- backend internals
- CI/deployment files unless coordinated

### Subagent 3 — Admin Platform, Security, Logging & Telemetry Engineer (GPT-5.3-Codex)

Scope:

- admin dashboard
- RBAC UI and flows
- admin content management UX
- audit center UI
- logs viewer UI
- telemetry dashboards UI
- user/session intelligence UI
- chief admin tooling
- backend support for session intelligence and observability features in coordination with Backend Engineer

Owns files primarily under:

- `frontend/app/(admin)/*`
- `frontend/components/admin/*`
- `frontend/lib/admin/*`
- `backend/apps/audit/*`
- `backend/apps/analytics/*`
- `backend/apps/telemetry/*`
- `backend/apps/security/*`
- `backend/tests/observability/*`

Must coordinate explicitly before touching shared backend interfaces used by Subagent 1.

### Subagent 4 — QA, CI/CD, DevOps & Release Engineer (GPT-5.3-Codex)

Scope:

- test harnesses
- E2E coverage
- CI pipelines
- Dockerfiles and compose files
- environment setup
- deployment playbooks
- build validation
- migration validation
- release checklist
- deployment execution when explicitly requested and environment access exists

Owns files primarily under:

- `.github/workflows/*`
- `infra/*`
- `docker/*`
- `compose*`
- `scripts/*`
- `tests/e2e/*`
- deployment docs

Must not edit core product logic except for testability hooks approved by Team Lead.

---

## 16) Collaboration and isolation rules

This is critical.

1. **No overlapping file edits.** Before starting work, each subagent must have a clear file/domain boundary.
2. **The Team Lead controls merge order.**
3. **Shared contracts first.** When interfaces affect multiple subagents, the Team Lead defines the contract first.
4. **Integration happens in waves.** Suggested order:
   - architecture audit and contracts
   - backend foundations
   - public frontend
   - admin/observability
   - tests and deployment
   - hardening pass
5. **No duplicate work.** If a task is already assigned, another agent must not independently implement it.
6. **Every subagent must return:**
   - what it changed
   - files changed
   - risks / open questions
   - tests run
   - follow-up needs

---

## 17) Recommended implementation sequence

### Phase 1 — Audit and plan

- inspect current MVP repository
- map current architecture
- identify reusable modules
- identify weak points
- define target architecture
- define migration/refactor plan
- document the plan before coding heavily

### Phase 2 — Foundations

- stabilize auth and RBAC
- define domain models and migrations
- define API contracts
- add structured logging foundation
- add telemetry foundation
- create/update `requirements.txt`
- create/update environment configuration

### Phase 3 — Public platform expansion

- extend public pages
- implement news improvements
- implement documents improvements
- implement events/calendar
- implement initiatives workflow
- implement reports/gallery/achievements/join/contact/search

### Phase 4 — Admin platform expansion

- dashboard
- content management suites
- moderation workflows
- settings management
- audit center
- logs viewer
- telemetry and user/session visibility

### Phase 5 — Quality and release engineering

- tests
- CI/CD
- deployment assets
- healthchecks
- security hardening
- release validation

### Phase 6 — Final integration and documentation

- docs synchronization
- end-to-end verification
- deployment readiness review
- final acceptance checklist

---

## 18) Definition of done

The task is done only when all of the following are true:

1. The existing MVP has been upgraded to the full product scope described here.
2. The public site is feature-complete for the target scope.
3. The admin platform is feature-complete for the target scope.
4. The chief admin can inspect logs, telemetry, audit history, and user/session information from the admin platform.
5. The platform is modular, maintainable, and reasonably scale-ready.
6. `requirements.txt` exists and is correct.
7. The application runs locally via documented setup.
8. Tests and validation checks pass.
9. Deployment assets exist and are documented.
10. Documentation is complete and accurate.
11. No critical regression has been introduced into existing MVP functionality.

---

## 19) Final instruction to Codex

Start by auditing the current repository. Do not jump directly into implementation.

Produce a short but concrete architecture-and-delivery plan, then execute it through the Team Lead + four-subagent workflow described above.

Build the full product carefully, preserve working MVP functionality, implement complete observability and admin visibility, keep the system scalable, create `requirements.txt`, and deliver a production-grade result.
