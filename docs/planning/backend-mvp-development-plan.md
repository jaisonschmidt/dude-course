# 🗺️ Backend MVP Development Plan — Dude Course

## Executive Summary

This issue tracks the complete backend implementation plan for Dude Course, covering **10 phases** from authentication through production readiness. The project has comprehensive documentation and scaffolding but **zero business logic implemented** — all services, repositories, and middleware are stubs.

### Current State Audit

| Layer | Status | Details |
|-------|--------|---------|
| **Models** | ✅ Complete | 6 entities + CreateData types defined |
| **Repository Interfaces** | ✅ Complete | 6 interfaces defined with method signatures |
| **Repository Implementations** | ⚠️ Stubs | All 6 `PrismaXxxRepository` classes throw errors |
| **Services** | ⚠️ Stub | Only `AuthService` exists (throws errors) |
| **Controllers** | ⚠️ Stub | Only `AuthController` exists (returns 501) |
| **Routes** | ⚠️ Partial | Only `/auth/*` + `/health` + `/ready` registered |
| **DTOs** | ⚠️ Partial | Only `auth-dto.ts` exists |
| **Middlewares** | ⚠️ Missing Auth | `error-handler` + `not-found` exist; no auth middleware |
| **Prisma Schema** | ✅ Complete | All 6 models with relations, indexes, constraints |
| **Unit Tests** | ⚠️ Minimal | Only 3 tests (env, error-handler, server) |
| **Integration Tests** | ⚠️ Minimal | Only health + observability endpoints |

### Implementation Order (Critical Path)

```
Phase 1 (P0) ──► Phase 2 (P0) ──► Phase 3 (P1) ──► Phase 4 (P1) ──► Phase 5 (P1)
    │                                                      │               │
    │                                                      ▼               │
    │                                                 Phase 6 (P2)         │
    ▼                                                                      │
Phase 8 (P1) ◄─── Cross-cutting: integrated throughout all phases ─────────┘
    │
    ▼
Phase 7 (P2) ──► Phase 9 (P2) ──► Phase 10 (P2)
```

---

## Phase 1: Authentication & User Management (P0) — Complexity: L

### Objective
Implement register/login/logout with JWT, auth middleware for protected routes, and wire Prisma into user repository.

### Dependencies: None (foundation)

### Acceptance Criteria

| AC | Description |
|----|-------------|
| AC1 | `POST /auth/register` creates user with bcrypt-hashed password, returns 201 with user data (no passwordHash) |
| AC2 | Duplicate email returns 409 CONFLICT without revealing email existence |
| AC3 | Invalid payload returns 400 with field-level errors |
| AC4 | `POST /auth/login` returns 200 with `{ accessToken, expiresIn: "1h", user }`, JWT payload: `{ userId, email, role }` |
| AC5 | Invalid credentials return 401 with generic message |
| AC6 | `POST /auth/logout` returns 204 (client-side per ADR-0004) |
| AC7 | Auth middleware extracts `userId, email, role` from valid JWT, attaches to `request.user` |
| AC8 | Missing/invalid/expired JWT returns 401 UNAUTHORIZED |

### Subtasks
- [ ] Create application error classes (`errors/` — AppError, ConflictError, UnauthorizedError, NotFoundError, ForbiddenError)
- [ ] Update error handler to recognize AppError subclasses → HTTP status codes
- [ ] Implement `PrismaUserRepository` (findByEmail, findById, create)
- [ ] Implement `AuthService.register()` — uniqueness, bcrypt, create user
- [ ] Implement `AuthService.login()` — find user, bcrypt compare, JWT sign
- [ ] Remove 501 stubs from `AuthController`, wire to AuthService
- [ ] Create auth middleware (`middlewares/auth.ts`) — JWT verify, user context
- [ ] Augment Fastify types for `request.user`
- [ ] Unit tests for AuthService (4+ cases) + auth middleware (4+ cases)
- [ ] Integration tests for auth endpoints (8+ tests)

### Files
| File | Action | Layer |
|------|--------|-------|
| `backend/src/errors/app-error.ts` + `index.ts` | Create | Cross-cutting |
| `backend/src/repositories/user-repository.ts` | Modify | Repository |
| `backend/src/services/auth-service.ts` | Modify | Service |
| `backend/src/controllers/auth-controller.ts` | Modify | Controller |
| `backend/src/middlewares/auth.ts` | Create | Middleware |
| `backend/src/types/fastify.d.ts` | Create | Types |
| `backend/test/unit/services/auth-service.test.ts` | Create | Test |
| `integration-tests/test/auth.spec.ts` | Create | Test |

### 📋 Documentation (Phase 1)
- **UPDATE**: `api-spec.md` (response examples, validation rules), `architecture.md` (auth middleware, error classes), `security.md` (bcrypt rounds, JWT payload), `project-structure.md` (new files), `domain.md` (password rules), `CONTEXT_PACK.md`
- **CREATE**: `docs/adr/0007-error-handling-strategy.md` (🔴 Required — before implementation)

---

## Phase 2: Course Catalog — Public Endpoints (P0) — Complexity: M

### Objective
Implement public read-only access to published courses and their lessons with pagination.

### Dependencies: Phase 1 (error classes)

### Acceptance Criteria

| AC | Description |
|----|-------------|
| AC1 | `GET /courses` returns only published courses with pagination meta |
| AC2 | Pagination works: `?page=2&pageSize=10` returns correct slice and meta |
| AC3 | Default pagination: page=1, pageSize=20 |
| AC4 | `pageSize > 100` or `page < 1` returns 400 |
| AC5 | `GET /courses/{id}` returns course + lessons ordered by position |
| AC6 | Non-existent or draft course returns 404 |
| AC7 | Non-numeric course ID returns 400 |

### Subtasks
- [ ] Implement `PrismaCourseRepository.findAllPublished()` with pagination
- [ ] Implement `PrismaCourseRepository.findById()`
- [ ] Implement `PrismaLessonRepository.findByCourseId()` ordered by position
- [ ] Create `CourseService` (listPublished, getDetail)
- [ ] Create course DTOs (pagination, response schemas)
- [ ] Create `CourseController` + course routes
- [ ] Register in `routes/index.ts`
- [ ] Unit tests for CourseService (4+ cases)
- [ ] Integration tests for course endpoints (7+ tests)

### 📋 Documentation (Phase 2)
- **UPDATE**: `api-spec.md` (full response examples, pagination meta shape), `architecture.md` (DTO pattern), `database.md` (validate schema), `domain.md` (publication rules), `project-structure.md`

---

## Phase 3: Enrollment System (P1) — Complexity: M

### Objective
Allow authenticated learners to enroll in published courses with idempotency guarantees.

### Dependencies: Phase 1 (auth), Phase 2 (course validation)

### Acceptance Criteria

| AC | Description |
|----|-------------|
| AC1 | `POST /courses/{id}/enrollments` with valid token creates enrollment, returns 201 |
| AC2 | Duplicate enrollment returns 409 CONFLICT |
| AC3 | Draft/non-existent course returns 404 |
| AC4 | Missing auth returns 401 |

### Subtasks
- [ ] Implement `PrismaEnrollmentRepository` (findByUserAndCourse, findByUserId, create, markCompleted)
- [ ] Create `EnrollmentService` — validate course, check existing, create
- [ ] Create enrollment DTOs, controller, routes (protected)
- [ ] Unit tests (4+ cases), integration tests (5+ tests)

### 📋 Documentation (Phase 3)
- **UPDATE**: `api-spec.md` (idempotency clarification), `domain.md`, `security.md` (IDOR), `database.md`

---

## Phase 4: Lesson Progress Tracking (P1) — Complexity: L

### Objective
Allow learners to mark lessons complete with auto-course-completion detection.

### Dependencies: Phases 1-3

### Acceptance Criteria

| AC | Description |
|----|-------------|
| AC1 | `POST /courses/{courseId}/lessons/{lessonId}/progress` creates progress, returns 200 with progress % |
| AC2 | Duplicate completion returns 409, progress doesn't inflate |
| AC3 | When all lessons completed → `enrollment.completedAt` auto-set |
| AC4 | Not enrolled → 404 |
| AC5 | Lesson not in course → 404 |
| AC6 | Missing auth → 401 |

### Subtasks
- [ ] Implement `PrismaLessonProgressRepository` (findByUserAndLesson, findByUserAndCourse, create)
- [ ] Implement `PrismaLessonRepository.findById()`
- [ ] Create `LessonProgressService` — validate enrollment, lesson belongs to course, check duplicate, create progress, detect course completion
- [ ] Create DTOs, controller, routes (protected)
- [ ] Add domain event logging: `lesson-progress.completed`, `enrollment.completed`
- [ ] Unit tests (6+ cases), integration tests (6+ tests)

### 📋 Documentation (Phase 4)
- **UPDATE**: `api-spec.md` (auto-complete doc), `domain.md` (auto-completion rule), `database.md` (transaction pattern), `observability.md` (domain events), `security.md`

---

## Phase 5: User Dashboard (P1) — Complexity: M

### Objective
Aggregate enrollment data, progress, and completion status for the learner dashboard.

### Dependencies: Phases 1, 3, 4

### Acceptance Criteria

| AC | Description |
|----|-------------|
| AC1 | `GET /me/dashboard` returns in-progress courses with progress %, completed courses, certificates |
| AC2 | Completed courses show in "completed" with `completedAt` |
| AC3 | No enrollments → 200 with empty arrays |
| AC4 | Only returns authenticated user's data (IDOR prevention) |
| AC5 | Missing auth → 401 |

### Subtasks
- [ ] Create `DashboardService` — aggregate enrollments, calculate progress, include certificates
- [ ] Create dashboard DTOs, controller, routes (protected)
- [ ] Unit tests (4+ cases), integration tests (4+ tests)

### �� Documentation (Phase 5)
- **UPDATE**: `api-spec.md` (full response example), `domain.md` (progress calculation)

---

## Phase 6: Certificate Generation (P2) — Complexity: M

### Objective
Generate certificates for learners who completed all lessons, with unique codes and idempotency.

### Dependencies: Phases 1, 3, 4

### Acceptance Criteria

| AC | Description |
|----|-------------|
| AC1 | `POST /courses/{id}/certificate` generates certificate with unique code, returns 200 |
| AC2 | Second call returns existing certificate (idempotent) |
| AC3 | Course not completed → 403 FORBIDDEN |
| AC4 | Not enrolled → 404 |

### Subtasks
- [ ] Implement `PrismaCertificateRepository` (findByUserAndCourse, findByCode, create)
- [ ] Create `CertificateService` — validate completion, check existing, generate code
- [ ] Create DTOs, controller, routes (protected)
- [ ] Add `certificate.issued` domain event logging
- [ ] Unit tests (5+ cases), integration tests (5+ tests)

### 📋 Documentation (Phase 6)
- **UPDATE**: `api-spec.md` (idempotency), `domain.md` (certificate code strategy), `database.md`, `observability.md`

---

## Phase 7: Admin Operations (P2) — Complexity: L

### Objective
Implement admin-only CRUD for courses and lessons with publish/unpublish workflows.

### Dependencies: Phases 1, 2

### ⚠️ Documentation Update Required First
Current `docs/api-spec.md` has **ZERO admin endpoints**. Per project rules, documentation must be updated before implementation.

### Acceptance Criteria

| AC | Description |
|----|-------------|
| AC1 | Non-admin (role=learner) → 403 FORBIDDEN on all admin endpoints |
| AC2 | `POST /admin/courses` creates course in draft status |
| AC3 | `PUT /admin/courses/{id}` updates course data |
| AC4 | `PATCH /admin/courses/{id}/publish` publishes course (requires title + description + ≥1 lesson) |
| AC5 | Publish without lessons → 400/422 |
| AC6 | `PATCH /admin/courses/{id}/unpublish` unpublishes course |
| AC7 | `POST /admin/courses/{id}/lessons` creates lesson |
| AC8 | `PUT /admin/courses/{id}/lessons/{lessonId}` updates lesson |
| AC9 | `DELETE /admin/courses/{id}/lessons/{lessonId}` deletes lesson |

### Subtasks
- [ ] Create admin guard middleware (`middlewares/admin-guard.ts`)
- [ ] Extend repositories with create/update/delete methods
- [ ] Create `AdminCourseService`, `AdminLessonService`
- [ ] Create admin DTOs, controllers, routes
- [ ] Unit tests (8+ cases), integration tests (10+ tests)

### 📋 Documentation (Phase 7)
- **CREATE**: `docs/adr/0008-admin-rbac-strategy.md` (🔴 Required — before implementation)
- **UPDATE**: `api-spec.md` (⚠️ Major: add 9 admin endpoints), `domain.md` (publish preconditions, state machine), `security.md` (RBAC), `architecture.md` (admin guard), `database.md` (deletion policy)

---

## Phase 8: Observability & Production Readiness (P1) — Complexity: M

### Objective
Enhance logging, health checks, requestId propagation, and error handling to meet `docs/observability.md` standards.

### Dependencies: Phase 1+, cross-cutting across all phases

### Acceptance Criteria

| AC | Description |
|----|-------------|
| AC1 | `/ready` checks DB connectivity (200 with `{ api: "ok", database: "ok" }`, 503 if DB down) |
| AC2 | All requests log structured JSON: method, path, status, durationMs, requestId |
| AC3 | Domain events logged at `info` level with requestId, userId, resource IDs |
| AC4 | 500 errors logged at `error` level (no stack in response) |
| AC5 | Client-provided `X-Request-Id` propagated through response + logs |

### Subtasks
- [ ] Add DB connectivity check to `/ready` using `prisma.$queryRaw`
- [ ] Create request logging hook (onResponse)
- [ ] Ensure domain event logging in all services
- [ ] Verify error handler structured logging
- [ ] Integration tests for readiness check (3+ tests)

### 📋 Documentation (Phase 8)
- **UPDATE**: `observability.md` (validate spec vs implementation), `api-spec.md` (health response shapes), `architecture.md`
- **CREATE (optional)**: `docs/adr/0009-structured-logging-strategy.md`

---

## Phase 9: Database Seed & Developer Experience (P2) — Complexity: S

### Objective
Enhanced seed data and developer utilities for smooth onboarding.

### Dependencies: Phases 1-6 (all entities)

### Acceptance Criteria

| AC | Description |
|----|-------------|
| AC1 | `pnpm db:seed` creates: 1 admin + 2 learners, 3 published + 1 draft course, 3-5 lessons each, enrollments, progress, 1 certificate |
| AC2 | Seed is idempotent (no errors on re-run) |
| AC3 | `pnpm db:reset` clears and re-seeds |
| AC4 | `docs/local-setup.md` has complete Quick Start guide |

### Subtasks
- [ ] Enhance `database/src/seed.ts` with comprehensive data
- [ ] Add `db:reset` script
- [ ] Update `docs/local-setup.md` with database operations guide

### 📋 Documentation (Phase 9)
- **UPDATE**: `local-setup.md` (quick start, seed docs, troubleshooting), `database.md` (seed data section)

---

## Phase 10: End-to-End Testing & QA (P2) — Complexity: L

### Objective
Comprehensive test coverage with journey tests and error scenario coverage.

### Dependencies: All phases (1-9)

### Acceptance Criteria

| AC | Description |
|----|-------------|
| AC1 | Every endpoint has: happy path + validation error + auth error tests |
| AC2 | Full learner journey test: register → login → list → enroll → complete lessons → dashboard → certificate |
| AC3 | Error scenarios: expired JWT, malformed bodies, non-existent resources, duplicates, unauthorized access |
| AC4 | Tests use isolated test database with cleanup |

### Subtasks
- [ ] Create auth helper, data factories
- [ ] Full learner journey integration test
- [ ] Full admin journey integration test
- [ ] Error scenario test suite
- [ ] CI pipeline with MySQL service container

### 📋 Documentation (Phase 10)
- **UPDATE**: `engineer-guidelines.md` (testing pyramid with examples), `project-structure.md` (test structure), `local-setup.md` (running tests)

---

## Cross-Cutting Concerns

### Security (Applied in Every Phase)
- ✅ All input validated via Zod schemas
- ✅ All queries parameterized via Prisma
- ✅ Passwords hashed with bcrypt (10 rounds), never in responses/logs
- ✅ JWT tokens never logged in full
- ✅ IDOR prevention — users can only access their own data
- ✅ Generic error messages for auth failures
- ✅ requestId in all error responses

### Observability (Applied in Every Phase)
- ✅ requestId in all logs and error payloads
- ✅ Structured JSON logging via Pino
- ✅ Domain events logged at `info` level
- ✅ Errors logged at `error` level with context

### Architecture Compliance (Applied in Every Phase)
- ✅ Models → no imports from other layers
- ✅ Repositories → Prisma only, no business logic
- ✅ Services → business logic, depend on repository interfaces
- ✅ Controllers → HTTP adapters only, delegate to services
- ✅ DTOs → separated from domain models

---

## 📋 Documentation Plan Summary

### Documents Touch Frequency

| Document | Ph1 | Ph2 | Ph3 | Ph4 | Ph5 | Ph6 | Ph7 | Ph8 | Ph9 | Ph10 |
|----------|-----|-----|-----|-----|-----|-----|-----|-----|-----|------|
| `api-spec.md` | ✏️ | ✏️ | ✏️ | ✏️ | ✏️ | ✏️ | ✏️ | ✏️ | | |
| `project-structure.md` | ✏️ | ✏️ | ✏️ | ✏️ | ✏️ | ✏️ | ✏️ | ✏️ | ✏️ | ✏️ |
| `domain.md` | ✏️ | ✏️ | ✏️ | ✏️ | ✏️ | ✏️ | ✏️ | | | |
| `security.md` | ✏️ | | ✏️ | ✏️ | | ✏️ | ✏️ | | | ✏️ |
| `database.md` | ✏️ | ✏️ | ✏️ | ✏️ | | ✏️ | ✏️ | | ✏️ | |
| `architecture.md` | ✏️ | ✏️ | | | | | ✏️ | ✏️ | | |
| `observability.md` | ✏️ | | | ✏️ | | ✏️ | ✏️ | ✏️ | | ✏️ |
| `CONTEXT_PACK.md` | ✏️ | ✏️ | ✏️ | ✏️ | ✏️ | ✏️ | ✏️ | ✏️ | ✏️ | ✏️ |

### Recommended New ADRs

| ADR | Phase | Priority | Rationale |
|-----|-------|----------|-----------|
| **ADR-0007: Error Handling Strategy** | 1 | 🔴 Required | Cross-cutting error class hierarchy and HTTP mapping convention |
| **ADR-0008: Admin RBAC Strategy** | 7 | 🔴 Required | Role-based access, admin guard, URL namespace decisions |
| **ADR-0009: Structured Logging** | 8 | 🟡 Recommended | Pino config, log levels per environment, domain event convention |

### Documentation Effort by Phase

| Phase | Effort | Key Risk |
|-------|--------|----------|
| 1. Auth | 🔴 High | Sets ALL conventions. Error ADR required before coding |
| 2. Catalog | 🟡 Medium | Pagination contract and response shapes |
| 3. Enrollment | 🟢 Low | Idempotency decision |
| 4. Progress | 🟡 Medium | Auto-completion is critical domain rule |
| 5. Dashboard | �� Low | Response shape only |
| 6. Certificate | 🟢 Low | Code generation approach |
| 7. Admin | 🔴 High | **9 new endpoints from scratch**. RBAC ADR required |
| 8. Observability | 🟡 Medium | Spec vs implementation validation |
| 9. Seed/DX | 🟡 Medium | Major local-setup.md expansion |
| 10. Testing | 🟢 Low | Engineer guidelines update |

---

## Open Questions

1. **Register returns token?** ADR-0004 says "retorna token" but `api-spec.md` only shows 201 with user data. Should register auto-login?
2. **Admin endpoints path prefix**: `/api/v1/admin/courses` (separate) or reuse `/api/v1/courses` with role filtering?
3. **Progress 409 behavior**: Return 409 error or 200 with existing progress data on duplicate?
4. **Certificate idempotency**: 200 for both new and existing, or 201 for new + 200 for existing?
5. **Lesson deletion with progress**: What happens to `LessonProgress` records when a lesson is deleted?

---

## Summary Table

| Phase | Name | Priority | Complexity | Dependencies | Key Deliverables |
|-------|------|----------|------------|--------------|------------------|
| 1 | Authentication & User Management | **P0** | L | None | Register, Login, JWT middleware, User repo |
| 2 | Course Catalog — Public | **P0** | M | Phase 1 | List courses, Course detail, Pagination |
| 3 | Enrollment System | **P1** | M | Phases 1, 2 | Enroll in course, Idempotency |
| 4 | Lesson Progress Tracking | **P1** | L | Phases 1-3 | Mark complete, Auto-complete course |
| 5 | User Dashboard | **P1** | M | Phases 1, 3, 4 | Aggregate progress, Completion status |
| 6 | Certificate Generation | **P2** | M | Phases 1, 3, 4 | Generate cert, Unique code, Idempotency |
| 7 | Admin Operations | **P2** | L | Phases 1, 2 | Course CRUD, Lesson CRUD, Publish flow |
| 8 | Observability & Prod Readiness | **P1** | M | Phase 1+ | Logging, DB health check, requestId |
| 9 | Database Seed & DX | **P2** | S | Phases 1-6 | Enhanced seed, Reset utilities |
| 10 | E2E Testing & QA | **P2** | L | All phases | Full coverage, Journey tests |

**Total estimated new files**: ~45 files
**Total estimated tests**: 70+ (unit + integration)

---

## Definition of Done — Backend MVP

- [ ] All 11+ API endpoints fully implemented and returning correct responses
- [ ] All 6 repository implementations use Prisma Client
- [ ] Auth middleware validates JWT and attaches user context
- [ ] Admin guard enforces `role=admin` for admin endpoints
- [ ] All business rules enforced in service layer
- [ ] Pagination works correctly with proper meta
- [ ] Idempotency enforced for enrollment, progress, certificate
- [ ] Error responses follow `docs/api-spec.md` format
- [ ] requestId in all responses and logs
- [ ] Structured logging captures domain events and errors
- [ ] Health/readiness checks include DB connectivity
- [ ] Unit test coverage ≥ 80% for services
- [ ] Integration tests cover all endpoints (happy path + errors)
- [ ] Full learner journey test passes end-to-end
- [ ] No passwords/tokens in logs or responses
- [ ] Seed script creates comprehensive sample data
- [ ] All documentation updated per Documentation Plan
- [ ] All required ADRs created (ADR-0007, ADR-0008)

---

## Subtasks

- [ ] 🏗️ Architectural analysis
- [ ] 🛠️ Implementation plan
- [ ] 💻 Phase 1: Authentication & User Management (P0)
- [ ] 💻 Phase 2: Course Catalog — Public Endpoints (P0)
- [ ] 💻 Phase 3: Enrollment System (P1)
- [ ] 💻 Phase 4: Lesson Progress Tracking (P1)
- [ ] 💻 Phase 5: User Dashboard (P1)
- [ ] 📊 Phase 8: Observability & Production Readiness (P1)
- [ ] 💻 Phase 6: Certificate Generation (P2)
- [ ] 💻 Phase 7: Admin Operations (P2)
- [ ] 🌱 Phase 9: Database Seed & Developer Experience (P2)
- [ ] ✅ Phase 10: End-to-End Testing & QA (P2)
- [ ] 📝 Documentation updates
- [ ] 🔍 Final code review
