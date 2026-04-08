# PROJECT_DOCUMENTATION

## A. Project Overview

### Purpose
`school_parliament_project` is a full digital platform for the student parliament of MOU School №3 (Mozhaisk):
- public information portal for students/parents/teachers;
- admin CMS for content and moderation;
- observability and security telemetry for administrative operations.

### Target users
- Public visitors: students, parents, staff.
- Admin users: administrators, president, minister/editorial roles.

### Public/Admin split
- Public routes provide content consumption and initiative submission.
- Admin routes provide secure role-based content management and monitoring.

### Value proposition
- Unified source of truth for school parliament communication.
- Transparent publication workflows.
- Controlled admin access with auditability.

---

## B. Tech Stack

- Framework: Next.js 16.2.2 (App Router, Turbopack)
- UI: React 19, TypeScript, Tailwind CSS 4
- DB: PostgreSQL
- ORM: Prisma 6
- Auth: NextAuth (Credentials provider, JWT session strategy)
- Validation: Zod + server-side parsing
- Storage: local filesystem storage abstraction (`storage/`, `/api/uploads/[...path]`)
- Observability: app logs, audit logs, security events, telemetry events, admin session tracking
- Testing: Vitest (unit), Playwright (e2e smoke)
- Runtime/infra (local): Node.js + Docker Compose (Postgres)

Main scripts are in `package.json`:
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run prod`
- `npm run typecheck`
- `npm run lint`
- `npm run test:unit`
- `npm run test:e2e:smoke`
- `npm run db:push`
- `npm run prisma:seed`

---

## C. Architecture

### Top-level structure
- `src/app` — Next.js routes (public, admin, API)
- `src/features` — domain services (news, events, gallery, settings, observability, etc.)
- `src/lib` — auth, db client, storage, validators, constants, utilities
- `prisma` — schema + seed
- `storage` — uploaded files in local dev
- `tests` — unit/e2e tests

### Route groups
- Public: `src/app/(public)/*`
- Admin: `src/app/admin/(protected)/*` + `src/app/admin/login/*`
- API: `src/app/api/*`

### Public routes (core)
`/`, `/about`, `/members`, `/ministries`, `/news`, `/events`, `/documents`, `/initiatives`, `/reports`, `/gallery`, `/achievements`, `/join`, `/contact`, `/search`, `/privacy-policy`.

### Admin routes (core)
Dashboard, News, Events, Initiatives, Documents, Reports, Gallery, Achievements, Ministries, Members, Pages, Settings, Users, Observability.

### Server/client boundaries
- Data mutations run in server actions (`"use server"`).
- Route guards and role checks are server-side (`requireAdminSession`, `requireSectionAccess`).
- UI components are server-first; interactive forms use client boundaries where needed.

### Caching/invalidation
After mutations, affected pages are invalidated with `revalidatePath` (public + admin paths).

---

## D. Feature Inventory

### Public area
- Homepage with key sections and highlights.
- Ministries pages and details.
- News list/detail with publication status filtering.
- Events list/detail.
- Documents list/detail + download endpoint.
- Initiative submission form + public implemented initiatives block.
- Reports and achievements publication pages.
- Gallery from albums/news/event media.
- Join page, contacts, privacy policy.
- Search route.
- Theme/accessibility controls integrated in UI.

### Admin area
- Content CRUD for core entities.
- Status workflow management (draft/scheduled/published/archived and domain statuses).
- User/session management (for privileged role).
- Observability center:
  - app logs
  - audit logs
  - security events
  - traffic telemetry
  - active admin sessions

---

## E. Roles and Permissions

Role logic is defined in `src/lib/auth/permissions.ts`.

### Roles
- `CHIEF_ADMIN` (seed account: `admin`)
- `ADMIN` (seed account: `president`)
- `MINISTRY_EDITOR` (seed account: `minister`)
- `EDITOR`
- `ANALYST`

### Effective permission matrix
- `CHIEF_ADMIN`: full access to all admin sections, including `users` and `observability`.
- `ADMIN`: broad content access, but no `users` and no `observability`.
- `MINISTRY_EDITOR`/`EDITOR`: content-focused subset, no users/observability/settings/pages/members.
- `ANALYST`: dashboard-only scope.

Server enforcement is done via `requireSectionAccess` and role checks in server actions.

---

## F. Forms and Validation

- Validation layer: `src/lib/validators/*`.
- Form data parsing helpers: `src/lib/utils/admin-action.ts`.
- All critical mutations validate on server.
- Gallery/document/news/events/etc. actions handle validation and redirect with success/error status.
- Upload validation includes mime/size checks in storage layer.

---

## G. Authentication and Authorization

- NextAuth credentials auth in `src/lib/auth/auth-options.ts`.
- Session includes user id, role, status, session token.
- Login/logout produce observability events.
- Admin protected layout requires active authenticated session.
- Section-level access is checked server-side for every protected section.

---

## H. Data Model Overview (Prisma)

Core entities:
- `AdminUser`, `AdminSession`, `SecurityEvent`, `AuditLog`, `AppLog`, `TelemetryEvent`
- `Ministry`, `Member`
- `News`, `NewsCategory`, `NewsTag`, `NewsOnTag`
- `Event`
- `Document`
- `Initiative`, `InitiativeNote`
- `Report`
- `Achievement`
- `GalleryAlbum`, `GalleryItem`
- `StaticPage`, `SiteSetting`, `HomeBlock`

Status/role enums drive workflows and permission behavior.

---

## I. Development History / Implementation Sequence

Based on repository state and task history:
1. Initial public portal foundation (content pages and navigation).
2. Admin CMS expansion for core entities.
3. Full product additions: observability, admin sessions, telemetry, richer role model.
4. Security/privacy hardening iterations (auth stability, session handling, consent paths).
5. Multiple fix batches for UX and publication workflows.
6. Current stabilization batch: admin gallery validation fix, role-switch regression coverage, text normalization, documentation consolidation.

---

## J. Final Bug-Fix Batch Summary (Current)

Implemented in this batch:
1. Fixed false album validation behavior:
- `src/lib/validators/gallery.ts`
- `title` and `description` now validate as non-empty (`min(1)`) so filled short values no longer fail as “Specify album title”.

2. Re-validated role switching integrity:
- Admin access to `Users` and `Observability` remains available.
- President/minister remain restricted.
- Added automated e2e regression for role switching.

3. Expanded smoke coverage:
- Added gallery album CRUD smoke test (including short title scenario).
- Added role-switching permissions smoke test.

4. Normalized broken UI text artifacts across source files:
- Removed mojibake-like artifacts in many public/admin files.
- Ensured Russian labels/messages are readable.

5. Verified runtime/build quality gates:
- `db:push`, `prisma:seed`, `typecheck`, `lint`, `test:unit`, `test:e2e:smoke`, `build` all pass.

---

## K. Local Setup and Run

### Prerequisites
- Node.js (20.9+ recommended for Next.js 16)
- Docker Desktop (for local Postgres)

### Setup
1. `npm install`
2. Configure `.env` (or copy from `.env.example`)
3. `docker compose up -d db`
4. `npm run db:push`
5. `npm run prisma:seed`
6. `npm run dev`

### Production mode
1. `npm run build`
2. `npm run start` (or `npm run prod`)

`NODE_ENV` не задается вручную в `.env` и определяется автоматически командами Next.js.

### Local URLs
- Public app: `http://localhost:3000`
- Admin login: `http://localhost:3000/admin/login`

### Seed admin accounts
- `admin` / `admin12345` (CHIEF_ADMIN)
- `president` / `president12345` (ADMIN)
- `minister` / `minister12345` (MINISTRY_EDITOR)

### Quality checks
- `npm run typecheck`
- `npm run lint`
- `npm run test:unit`
- `npm run test:e2e:smoke`
- `npm run build`

### Troubleshooting
- If Prisma `EPERM ... query_engine...dll` appears on Windows: stop running `node`/dev server processes and rerun the command.
- If DB connection fails: confirm Docker container is healthy and `.env` uses `localhost:5433`.

---

## L. Maintenance Notes

- Permission updates: `src/lib/auth/permissions.ts` + corresponding server guards.
- Form/schema changes: update both UI field names and matching validators/server actions.
- Upload behavior: `src/lib/storage/*` and `src/app/api/uploads/[...path]/route.ts`.
- Observability schema/services: `src/features/observability/*`, Prisma models.
- When adding statuses/roles, update:
  - Prisma enums
  - validators
  - label maps (`src/lib/utils/status.ts`)
  - admin/public UI filters and guards
- Keep e2e smoke tests aligned with critical business flows (auth, CRUD, role access).
