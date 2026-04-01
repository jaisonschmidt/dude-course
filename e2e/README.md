# 🧪 E2E Tests (Playwright)

End-to-end tests for the Dude Course platform using [Playwright](https://playwright.dev/).

## Prerequisites

- Node.js 24+
- pnpm 10+
- Docker (for MySQL)
- Backend + Frontend + Database running (or use `webServer` auto-start)

## Setup

```bash
# From monorepo root
pnpm install

# Install Playwright browsers (first time only)
pnpm --filter e2e exec playwright install --with-deps chromium

# Ensure database is seeded (admin user required)
pnpm --filter database db:seed
```

## Running tests

```bash
# Run all E2E tests (starts backend + frontend automatically)
pnpm e2e

# Run with Playwright UI (interactive mode)
pnpm e2e:ui

# Run in headed browser (see the browser)
pnpm e2e:headed

# Run in debug mode (step through tests with Playwright Inspector)
pnpm e2e:debug

# Run from e2e/ directory
cd e2e && pnpm test
```

> **Note**: If backend and frontend are already running, Playwright will reuse them (`reuseExistingServer: true` in local mode).

### Viewing test reports

After a test run, Playwright generates an HTML report in `e2e/playwright-report/`.

Open it with:

```bash
cd e2e && npx playwright show-report
```

> In CI, the report is uploaded as a GitHub Actions artifact (14-day retention).

## Project structure

```
e2e/
  playwright.config.ts    # Playwright configuration (baseURL, webServer, projects)
  tsconfig.json           # TypeScript config
  fixtures/
    auth.fixture.ts       # Auth fixtures (authenticated pages for learner/admin)
  helpers/
    api.ts                # HTTP helper for direct API calls
    seed.ts               # Seed data via admin API (courses, lessons, learners)
  pages/                  # Page Object Model (POM)
    login.page.ts
    register.page.ts
    course-catalog.page.ts
    course-detail.page.ts
    lesson-player.page.ts
    dashboard.page.ts
    admin-courses.page.ts
    admin-course-form.page.ts
    admin-lessons.page.ts
    index.ts              # Re-exports all Page Objects
  tests/                  # Test specs
    smoke.spec.ts              # Infrastructure smoke (health, pages reachable)
    learner-journey.spec.ts    # Full learner flow: register → enroll → progress → certificate
    admin-courses.spec.ts      # Admin flow: create → publish → edit → delete
    auth-protection.spec.ts    # Auth redirects, role enforcement, invalid credentials
    idempotency.spec.ts        # Idempotency: enrollment, progress, certificate (pure API)
    validation-security.spec.ts # Form validation, draft/unpublished access, requestId in errors
```

## Test coverage

| Spec file | What it covers | Type |
|-----------|----------------|------|
| `smoke.spec.ts` | Health endpoint, public pages, login page reachable | UI |
| `learner-journey.spec.ts` | Register, login, browse catalog, enroll, watch lesson, complete progress, certificate, dashboard | UI (serial) |
| `admin-courses.spec.ts` | Create draft, add/reorder lessons, publish, edit, unpublish, delete | UI (serial) |
| `auth-protection.spec.ts` | Unauthenticated redirects, learner blocked from admin, invalid credentials, 401 handler | UI |
| `idempotency.spec.ts` | Double enrollment (201→200), double lesson progress (no inflation), double certificate (same code) | API (headless) |
| `validation-security.spec.ts` | Client-side form validation (Zod), draft/unpublished course 404, `requestId` in API errors | UI + API |

## Conventions

### Page Object Model (POM)

Each page has a corresponding class in `pages/` that encapsulates:
- **Locators**: `getByTestId()` references to key elements
- **Actions**: methods for common interactions (e.g., `login(email, password)`)

```typescript
import { LoginPage } from '../pages/login.page'

test('should login', async ({ page }) => {
  const loginPage = new LoginPage(page)
  await loginPage.goto()
  await loginPage.login('user@test.com', 'password')
})
```

### Selectors — `data-testid` only

All E2E selectors use `data-testid` attributes. Never use:
- CSS class selectors (fragile, change with styling)
- Text content selectors (fragile, change with i18n)
- XPath (hard to read, fragile)

**Naming convention**: `data-testid="<component>-<element>"`
- `login-email-input`, `login-submit-button`
- `course-card-{id}`, `enroll-button`
- `admin-course-publish-{id}`

### Fixtures

Use Playwright fixtures from `fixtures/auth.fixture.ts`:

```typescript
import { test, expect } from '../fixtures/auth.fixture'

test('learner can see dashboard', async ({ authenticatedLearnerPage }) => {
  await authenticatedLearnerPage.goto('/dashboard')
  // ...
})
```

### Seed data

Tests create their own data via `helpers/seed.ts` (HTTP API calls):

```typescript
import { loginAsAdmin, seedPublishedCourseWithLessons } from '../helpers/seed'

test.beforeAll(async () => {
  const adminToken = await loginAsAdmin()
  const { course, lessons } = await seedPublishedCourseWithLessons(adminToken)
})
```

### Test organization

- **1 spec file per feature area** (e.g., `learner-journey.spec.ts`)
- **`test.describe.serial`** for journey tests that share state
- **`beforeAll`** for seed data (1x per describe)
- **1 AC = 1 test** (each acceptance criterion is a separate test)

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `E2E_BASE_URL` | `http://localhost:3000` | Frontend URL |
| `E2E_API_URL` | `http://localhost:3001/api/v1` | Backend API URL |
| `E2E_ADMIN_EMAIL` | `admin@dudecourse.local` | Admin email (from seed) |
| `E2E_ADMIN_PASSWORD` | `Admin@123456` | Admin password (from seed) |

> To override defaults locally, create `e2e/.env`:
> ```env
> E2E_BASE_URL=http://localhost:3000
> E2E_API_URL=http://localhost:3001/api/v1
> E2E_ADMIN_EMAIL=admin@dudecourse.local
> E2E_ADMIN_PASSWORD=Admin@123456
> ```
> The file is gitignored. Values above are the defaults — only add entries you want to change.

## CI

E2E tests run in GitHub Actions via `.github/workflows/ci-e2e.yml`:
- Triggered by changes in `e2e/**`, `frontend/**`, `backend/**`, `database/**`
- MySQL service container
- Automatic backend + frontend startup
- Playwright report uploaded as artifact (14-day retention)
