---
description: "Use when writing or modifying tests. Covers testing pyramid, AAA pattern, mocking strategy, and naming conventions."
applyTo: "**/test/**"
---

# Testing Guidelines

## Testing pyramid

Priority order (most → least volume):
1. **Unit tests** — domain entities, use cases (application layer)
2. **Integration tests** — repositories, HTTP endpoints
3. **E2E tests** — critical happy paths only

## Unit tests

- **Target**: Use cases, domain entities, value objects
- **Mocking**: ALL ports (repositories, external services) must be mocked
- **Pattern**: AAA (Arrange, Act, Assert)
- **Location**: `test/unit/`

Example (adapt to your project's test framework and language):

```
describe('CreateOrderUseCase')
  it('should create an order when input is valid')
    // Arrange
    mockRepo = create mock of repository with findById returning null, save as no-op
    useCase = new CreateOrderUseCase(mockRepo)

    // Act
    result = useCase.execute({ userId: 1, productId: 1 })

    // Assert
    result is defined
    mockRepo.save was called once
```

## Integration tests

- **Target**: Repository implementations, HTTP endpoints
- **Mocking**: External services only (NOT the database)
- **Location**: `test/integration/`
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

- Mock only ports (interfaces), never concrete implementations
- Use factory functions for creating test fixtures
- Never mock domain entities — use real ones with test data
- Reset mocks between tests
