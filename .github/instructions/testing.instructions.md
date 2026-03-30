---
description: "Use when writing or modifying tests. Covers testing pyramid, AAA pattern, mocking strategy, Vitest conventions, and naming."
applyTo: "**/test/**,**/integration-tests/**"
---

# Testing Guidelines (Vitest)

## Testing pyramid

Priority order (most → least volume):
1. **Unit tests** — services, models (`backend/test/unit/`)
2. **Integration tests** — API routes, repositories with real DB (`integration-tests/test/`)
3. **E2E tests** — critical happy paths only (future: Playwright)

## Unit tests

- **Target**: Services, models (business logic)
- **Mocking**: ALL repositories and external dependencies must be mocked
- **Pattern**: AAA (Arrange, Act, Assert)
- **Location**: `backend/test/unit/`
- **Framework**: Vitest

Example:

```typescript
import { describe, it, expect, vi } from 'vitest'

describe('CourseService', () => {
  it('should create a course when input is valid', async () => {
    // Arrange
    const mockRepo = { create: vi.fn().mockResolvedValue({ id: 1, title: 'Test' }) }
    const service = new CourseService(mockRepo)

    // Act
    const result = await service.create({ title: 'Test', description: '...' })

    // Assert
    expect(result).toBeDefined()
    expect(mockRepo.create).toHaveBeenCalledOnce()
  })
})
```

## Integration tests

- **Target**: API routes, repository implementations
- **Mocking**: External services only (NOT the database)
- **Location**: `integration-tests/test/`
- **Database**: Real MySQL (test database, reset between tests)
- **Verify**: HTTP status codes, response shapes, DB state, error formats with `requestId`

## Test naming

- `describe('<Component/UseCase>')` — what is being tested
- `it('should <expected behavior> when <condition>')` — specific scenario
- Be descriptive enough that the test name explains the scenario

## Required test scenarios

For every use case / endpoint:
- ✅ Happy path
- ❌ Error flows (invalid input, not found, unauthorized)
- 🔁 Idempotency (where applicable)
- 🔒 Uniqueness constraint violations (409 Conflict)
- 🔐 Auth scenarios (401, 403)

## Mocking guidelines

- Mock only repository interfaces, never concrete implementations
- Use `vi.fn()` and `vi.mock()` from Vitest
- Use factory functions for creating test fixtures
- Never mock domain entities — use real ones with test data
- Reset mocks between tests with `vi.clearAllMocks()` or `beforeEach`

## Integration test seed functions (Prisma raw SQL)

When writing seed helpers in `integration-tests/`, follow these rules:

### Correct Prisma methods
- **`$executeRaw`** for INSERT, UPDATE, DELETE (write operations)
- **`$queryRaw`** for SELECT (read operations)
- ❌ Never use `$queryRaw` for INSERT — it may silently fail in MySQL

### LAST_INSERT_ID pattern
```typescript
await prisma.$executeRaw`INSERT INTO table_name (...) VALUES (...)`
const rows = await prisma.$queryRaw`SELECT LAST_INSERT_ID() as id` as Array<{ id: bigint }>
return Number(rows[0]!.id)
```
- MySQL returns `bigint` for `LAST_INSERT_ID()` — always wrap with `Number()`

### Prisma connection pooling caveats
- Prisma uses connection pooling — each `$executeRaw`/`$queryRaw` may run on a **different connection**
- `SET FOREIGN_KEY_CHECKS = 0` is **session-scoped** — it only affects the connection that executed it
- ❌ Never use `TRUNCATE TABLE` with `SET FOREIGN_KEY_CHECKS = 0` across multiple `$executeRaw` calls — the SET and TRUNCATE may run on different connections, causing FK constraint errors
- ✅ Use `DELETE FROM` in correct FK dependency order (children → parents) instead — no FK_CHECKS toggle needed

### Table cleanup pattern (truncateAll)
```typescript
// ✅ Correct — DELETE FROM in FK-safe order (children first)
await prisma.$executeRaw`DELETE FROM lesson_progress`
await prisma.$executeRaw`DELETE FROM lessons`
await prisma.$executeRaw`DELETE FROM courses`
await prisma.$executeRaw`DELETE FROM users`

// ❌ WRONG — TRUNCATE with FK_CHECKS across connections (unreliable)
await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0`  // connection A
await prisma.$executeRaw`TRUNCATE TABLE lessons`       // connection B — FK_CHECKS still enabled!
```

### Database alignment (critical)
- The backend process and the test seed functions **must connect to the same database**
- Tests insert data via Prisma into `dude_course_test`; the API must also read from `dude_course_test`
- If the backend points to `dude_course` while seeds go to `dude_course_test`, all data-dependent tests will fail with empty results
