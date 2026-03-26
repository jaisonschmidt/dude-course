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
