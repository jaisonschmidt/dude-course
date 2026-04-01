# ADR-0010: E2E Testing with Playwright

## Status

Accepted — 2026-03-31

## Context

The Dude Course project has solid unit test coverage (backend: 8 services + 8 controllers + 3 middlewares; frontend: 42 files, 223 tests) and integration tests (10 files, ~133 cases). However, no end-to-end (E2E) tests exist that validate the integration between frontend (Next.js), backend (Fastify), and database (MySQL) from a user's perspective.

ADR-0007 explicitly deferred E2E to the frontend phase: "E2E tests (browser-based) are deferred to the frontend phase". With the frontend complete, it's time to implement this layer.

### Alternatives considered

#### 1. Cypress
- Pros: mature ecosystem, great DX with time-travel debugging, large community
- Cons: slower test execution, heavier resource usage, limited multi-tab support, proprietary dashboard

#### 2. Playwright
- Pros: modern architecture, fast execution, built-in multi-browser support, excellent TypeScript support, auto-waiting, native network interception, open-source, official Microsoft support
- Cons: smaller community (growing fast), less mature plugin ecosystem

#### 3. No E2E (keep deferring)
- Pros: no additional complexity
- Cons: critical user flows remain untested end-to-end, regressions may go unnoticed

## Decision

Adopt **Playwright** as the E2E testing framework with the following conventions:

### Architecture
- **Isolated workspace**: `e2e/` package in the pnpm monorepo, no imports from app code
- **Interaction via HTTP**: seed helpers use admin API endpoints, not direct DB access
- **Interaction via browser**: test assertions use Playwright page interactions
- **Exception**: admin user seed via `database/src/seed.ts` (Prisma) for deterministic setup

### Test patterns
- **Page Object Model (POM)**: classes encapsulate page interactions and locators
- **Selectors**: `data-testid` attributes exclusively (no CSS selectors, no text selectors)
- **Naming**: `data-testid="<component>-<element>"` (e.g., `login-email-input`, `course-card-1`)
- **Fixtures**: Playwright fixtures for authenticated pages (learner, admin)
- **Serial execution**: `test.describe.serial` for journey tests (shared state within describe)
- **Seed per describe**: `beforeAll` creates test data, tests within describe share it

### Configuration
- **Browser**: Chromium only (initial phase)
- **Workers**: 1 (serial execution to avoid DB race conditions)
- **webServer**: array of backend (`:3001`) + frontend (`:3000`)
- **Retries**: 2 in CI, 0 locally

### CI
- **Workflow**: `ci-e2e.yml` (6th pipeline, per ADR-0006 pattern)
- **MySQL**: service container
- **Triggers**: changes to `e2e/**`, `frontend/**`, `backend/**`, `database/**`

### Phasing
- **Phase 1**: Learner journey (#73), Admin courses (#74), Auth protection (#75)
- **Phase 2**: Idempotency, validation, security edge cases (#76)

## Consequences

### Positive
- Critical user flows validated end-to-end
- Regressions in frontend-backend integration caught early
- POM pattern enables reusable, maintainable test code
- `data-testid` decouples tests from CSS/markup changes
- Playwright's auto-waiting reduces flaky tests

### Negative
- E2E tests are slower than unit/integration tests
- Additional CI time (~5-10 min per run)
- `data-testid` attributes added to production markup
- Maintenance overhead for Page Objects and seed helpers

### Mitigations
- E2E tests run only on relevant path changes (not on docs-only PRs)
- Focus on critical happy paths, not exhaustive coverage
- `data-testid` has negligible performance impact and aids debugging
- POM reduces duplication; changes to UI require updating only the Page Object

## Notes
- Impacts: `docs/project-structure.md`, `docs/engineer-guidelines.md`, `CONTEXT_PACK.md`, `docs/ai/ai-context.md`, `docs/adr/0007-tdd-testing-strategy.md`, `.github/instructions/testing.instructions.md`
- Related issues: #72 (setup), #73, #74, #75, #76 (implementation)
- Supersedes the "No browser-based E2E tests yet" note in ADR-0007
