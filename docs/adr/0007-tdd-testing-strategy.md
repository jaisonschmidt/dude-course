# ADR-0007: TDD Testing Strategy

## Status

**Accepted** — 2026-03-31

## Context

As the Dude Course MVP backend grew, a consistent testing approach was needed to ensure quality without slowing down delivery. The team needed to decide:

- What testing pyramid levels to adopt
- How to structure test files and naming
- Mocking strategy for repository interfaces
- How to handle integration tests requiring a running database

## Decision

### Testing Pyramid

We adopt a **two-tier testing strategy** for the backend:

1. **Unit Tests** (majority) — test services and middleware in isolation using mocked interfaces
2. **Integration Tests** — test full HTTP endpoints against a real database

E2E tests (browser-based) are deferred to the frontend phase.

### Test Framework

- **Vitest 4.x** for both unit and integration tests
- Shared configuration via `vitest.config.ts` per workspace package
- Coverage thresholds: lines ≥60%, functions ≥60%, branches ≥50%

### Unit Test Conventions

- **AAA pattern**: Arrange → Act → Assert
- **File naming**: `<module>.spec.ts` mirroring source structure
- **Mock creation**: Factory functions per repository interface (e.g., `createMockCourseRepository()`)
- **Test data**: Factory functions in `test/helpers/factories.ts` with sensible defaults and unique constraint support
- **Mocking**: `vi.fn()` for interface methods, `vi.mocked()` for type-safe mock setup
- **Error testing**: Always test both error type (`toThrow(ErrorClass)`) and message (`toThrow('message')`)

### Integration Test Conventions

- **Gated by environment**: `RUN_INTEGRATION_TESTS=true` to run
- **Real database**: Uses `DATABASE_URL_TEST` pointing to a dedicated test database
- **API-driven**: Tests call HTTP endpoints via `fetch` helpers (`get`, `post`, `put`, `patch`, `del`)
- **Clean state**: `truncateAll()` before each test to ensure isolation
- **Seed helpers**: Create test data through API calls (not raw SQL) to test full stack

### Mocking Strategy

Services depend on **repository interfaces** (e.g., `ICourseRepository`), not concrete implementations. Unit tests mock these interfaces completely:

```typescript
function createMockCourseRepository(): ICourseRepository {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    // ... all interface methods
  }
}
```

This ensures:
- Services are tested in isolation from database
- Tests run fast (no DB needed)
- Interface changes force mock updates (compile-time safety)

### TOCTOU Race Condition Testing

For services with idempotent operations (enrollment, certificate), we test the P2002 unique constraint error recovery path:

```typescript
const p2002Error = Object.assign(new Error('Unique constraint'), {
  name: 'PrismaClientKnownRequestError',
  code: 'P2002',
})
vi.mocked(repo.create).mockRejectedValue(p2002Error)
```

## Consequences

### Positive

- Fast feedback loop: unit tests run in <1s
- High confidence in business logic correctness
- Clear separation between unit and integration concerns
- Factory functions reduce test boilerplate
- Interface-based mocking catches breaking changes at compile time

### Negative

- Mock maintenance overhead when interfaces expand (all test files need updating)
- Integration tests require Docker/MySQL running
- No browser-based E2E tests yet

### Trade-offs

- We accept that controller logic is tested indirectly through integration tests rather than unit-testing controllers directly
- Domain event logging is tested via integration tests (checking HTTP responses include requestId) rather than asserting log output in unit tests
