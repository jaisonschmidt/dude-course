---
description: "Use when editing backend source code. Enforces MVC layer boundaries, dependency direction, and naming conventions as defined in docs/architecture.md."
applyTo: "backend/src/**"
---

# Backend Architecture Guidelines (MVC)

> These guidelines enforce MVC layer boundaries as defined in `docs/architecture.md`.

## Architecture layers (dependency direction)

```
Routes → Controllers → Services → Repositories → Models
              ↓            ↓
         Middlewares      DTOs
```

### Models (`models/`)
- Domain entities, types, and interfaces
- Pure business logic and invariants
- ZERO framework or library imports
- No imports from services, controllers, repositories, or infrastructure

### Services (`services/`)
- Business logic and orchestration
- Depends only on Models and repository interfaces (abstractions)
- Never imports from controllers, routes, or middlewares
- External data access only through repository interfaces

### Controllers (`controllers/`)
- HTTP request handlers (Fastify)
- Parse request, validate input (via Zod DTOs), delegate to services, format response
- Never contains business logic
- Returns responses in `{ data, requestId }` or error format

### Repositories (`repositories/`)
- Data access via Prisma Client (imported from `database` package)
- Implement interfaces defined for service consumption
- Encapsulate all database queries
- No business logic, no HTTP concerns

### Routes (`routes/`)
- Fastify route definitions: bind HTTP method + path to controller + middlewares
- No business logic, no data transformation

### Middlewares (`middlewares/`)
- Cross-cutting concerns: JWT auth, requestId propagation, global error handling
- Applied at route level

### DTOs (`dto/`)
- Zod schemas for request/response validation
- Type definitions for API contracts
- Separate from domain entities (Models)

## Naming conventions

- **Files/folders**: `kebab-case`
- **Classes**: `PascalCase`
- **Functions/variables**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Repository interfaces**: descriptive name (e.g., `UserRepository`, `CourseRepository`)

## DTOs vs Domain entities

- DTOs live in `dto/` with Zod schemas
- Domain entities live in `models/`
- Never pass domain entities directly to/from HTTP layer
- Map between DTOs and entities at the controller boundary
