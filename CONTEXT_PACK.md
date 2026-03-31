# CONTEXT_PACK.md

This document provides a **condensed context snapshot** of the project so AI assistants
(GitHub Copilot, coding agents, LLMs) can quickly understand the system without scanning
the entire documentation.

Full documentation lives in `/docs`. If something here conflicts with `/docs`, the docs
directory is the **source of truth**.

---

# Project Overview

Project: Dude Course

Purpose:
Plataforma educacional que transforma conteúdo gratuito do YouTube em cursos estruturados com progresso rastreável e emissão de certificados.

Core user flow:

Registrar → Navegar catálogo → Iniciar curso → Assistir aulas (YouTube) → Marcar aulas como concluídas → Acompanhar progresso → Gerar certificado

---

# Technology Stack

Backend
- Node.js 24 + TypeScript
- MVC architecture
- REST API (Fastify)
- Prisma ORM + MySQL 8.0

Frontend
- Next.js (App Router) + TypeScript
- Hybrid rendering (SSR + SSG)

Database
- MySQL 8.0

Monitoring
- New Relic (APM)
- Pino (structured JSON logging)

---

# Architectural Style

Backend follows **MVC (Model-View-Controller)** architecture.

Layers:

- **Models**: entidades de domínio e tipos (zero dependência de framework)
- **Services**: lógica de negócio e orquestração
- **Controllers**: handlers HTTP (parsam request, delegam para services, formatam response)
- **Repositories**: acesso a dados via Prisma (implementam interfaces)
- **Routes**: definições de rotas Fastify
- **Middlewares**: auth JWT, requestId, error handling
- **DTOs**: schemas Zod para validação e tipos request/response

Dependency direction:

Routes → Controllers → Services → Repositories → Models

Rules:

- Models must not depend on frameworks or infrastructure
- Controllers must not contain business logic
- Database access must happen through repositories (Prisma)
- Services depend on repository interfaces (abstractions)

Monorepo structure (pnpm workspaces):
- `backend/` — Fastify API + unit tests
- `frontend/` — Next.js App Router
- `database/` — Prisma schema, migrations, seeds
- `integration-tests/` — testes de integração com DB real

Reference:
docs/architecture.md

---

# Core Domain Model

Main entities:

User
Course
Lesson
Enrollment
LessonProgress
Certificate

Relationships:

User → participates in → Course
Course → contains → Lesson
User → completes → Lesson
User → earns → Certificate

Reference:
docs/domain.md

---

# Business Logic

- Only published courses are visible to learners
- Course completion depends on all required lessons being completed
- Progress is tracked per learner and per lesson
- Duplicate lesson completion must not inflate course progress
- Certificates can only be issued after course completion

Reference:
docs/domain.md

---

# Database Overview

Primary tables:

users
courses
lessons
enrollments
lesson_progress
certificates

Important constraints:

users:
UNIQUE(email)

lessons:
UNIQUE(course_id, position)

enrollments:
UNIQUE(user_id, course_id)

lesson_progress:
UNIQUE(user_id, lesson_id)

certificates:
UNIQUE(certificate_code)
UNIQUE(user_id, course_id)

Reference:
docs/database.md

---

# API Overview

Base path:

/api/v1

Authentication:

JWT Bearer Token (1h expiration, bcrypt password hashing)

Implemented endpoints:

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | No | Register new user |
| POST | /auth/login | No | Login, returns JWT |
| POST | /auth/logout | Yes | Logout (client-side) |
| GET | /courses | No | List published courses (paginated) |
| GET | /courses/{id} | No | Course detail with lessons |
| POST | /courses/{id}/enrollments | Yes | Enroll in course (idempotent) |
| POST | /courses/{courseId}/lessons/{lessonId}/progress | Yes | Mark lesson completed (idempotent) |
| GET | /me/dashboard | Yes | Learner dashboard |
| POST | /courses/{id}/certificate | Yes | Generate certificate (idempotent) |
| POST | /courses | Admin | Create course (draft) |
| PUT | /courses/{id} | Admin | Update course |
| PATCH | /courses/{id}/publish | Admin | Publish course |
| PATCH | /courses/{id}/unpublish | Admin | Unpublish course |
| DELETE | /courses/{id} | Admin | Delete course |
| POST | /courses/{id}/lessons | Admin | Add lesson |
| PUT | /courses/{id}/lessons/{lessonId} | Admin | Update lesson |
| DELETE | /courses/{id}/lessons/{lessonId} | Admin | Delete lesson |
| PATCH | /courses/{id}/lessons/reorder | Admin | Reorder lessons |
| GET | /health | No | Liveness check |
| GET | /ready | No | Readiness check (DB) |

Reference:
docs/api-spec.md

---

# Observability

Logging rules:

- Structured logs
- JSON format
- Include requestId in every request

Error responses must include:

requestId

Monitoring:

New Relic (APM) + Pino (structured JSON logging)

Reference:
docs/observability.md

---

# Security Rules

Never:

- log passwords
- log password hashes
- log full JWT tokens

Always:

- validate input
- protect user scoped resources
- prevent SQL injection

Reference:
docs/security.md

---

# AI / Agent Rules

AI assistants must:

- Read AGENTS.md
- Read docs before implementing features
- Never invent API endpoints
- Never invent database tables
- Respect architectural boundaries defined in `docs/architecture.md`

Preferred workflow:

1. Check domain rules
2. Check API contract
3. Check database schema
4. Implement backend layers
5. Implement frontend integration
6. Add tests
7. Update docs if necessary

---

# Key ADR Decisions

- ADR-0001: MVC Architecture (`docs/adr/0001-mvc-architecture.md`)
- ADR-0002: MySQL 8.0 + Prisma (`docs/adr/0002-database-mysql.md`)
- ADR-0003: Next.js Hybrid Rendering (`docs/adr/0003-frontend-nextjs.md`)
- ADR-0004: JWT Bearer Token Auth (`docs/adr/0004-auth-jwt.md`)
- ADR-0005: Database Migration Strategy (`docs/adr/0005-database-environments.md`)
- ADR-0006: CI/CD Workflow Segmentation (`docs/adr/0006-cicd-workflow-segmentation.md`)
- ADR-0007: TDD Testing Strategy (`docs/adr/0007-tdd-testing-strategy.md`)

---

# AI Agent Squad

This project uses a squad of 11 specialized AI agents.

Agents:

| Agent | Role |
|-------|------|
| product-owner | Converts demands into GitHub Issues |
| architect | Architectural analysis |
| staff | Orchestrator — plans and delegates |
| backend-dev | Backend implementation (sub-agent) |
| frontend-dev | Frontend implementation (sub-agent) |
| test-advisor | Testing strategy |
| qa | Test execution and validation |
| reviewer | PR code review |
| documenter | Post-merge documentation |
| metrifier | Metrics and observability |
| project-setup | Initial stack configuration |

Delegation model:

staff → [backend-dev, frontend-dev, test-advisor, qa, metrifier]

Main flows:

A) New feature: product-owner → architect → staff → [BE, FE] → qa → reviewer → documenter
B) Bug fix: product-owner → staff → [BE/FE] → qa → reviewer → documenter
C) Bootstrap: product-owner → architect → staff → documenter
D) Tech debt: architect → staff → [BE/FE] → reviewer → documenter

Slash commands:

/setup-project, /new-feature, /analyze-issue, /implement-issue, /review-pr, /fix-bug, /document-pr

Reference:
AGENTS.md
docs/agent-task-flow.md
docs/ai/agent-squad-guide.md

---

# Important Documentation

For deeper context:

docs/architecture.md
docs/domain.md
docs/database.md
docs/api-spec.md
docs/security.md
docs/observability.md
docs/project-structure.md
docs/engineer-guidelines.md
docs/engineering-docs-recommendation.md
