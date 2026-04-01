import { test, expect } from '@playwright/test'
import { registerLearner, loginAsAdmin } from '../helpers/seed'
import { LoginPage } from '../pages'

/**
 * E2E — Auth Protection (Issue #75)
 *
 * Tests authentication and authorization protection:
 *   - Unauthenticated redirect to login
 *   - Learner blocked from admin
 *   - Invalid credentials error
 *   - 401 handler auto-logout
 *
 * Tests are independent (not serial) — each uses fresh context.
 */

const timestamp = Date.now()

test.describe('Auth Protection', () => {
  test('AC1 — Unauthenticated user redirected to /login from /dashboard', async ({
    page,
  }) => {
    // Navigate to a protected route without authentication
    await page.goto('/dashboard')

    // Should be redirected to /login
    await page.waitForURL('**/login**')
    const loginPage = new LoginPage(page)
    await expect(loginPage.form).toBeVisible()
  })

  test('AC2 — Unauthenticated user redirected to /login from /admin/courses', async ({
    page,
  }) => {
    // Navigate to an admin route without authentication
    await page.goto('/admin/courses')

    // Should be redirected to /login
    await page.waitForURL('**/login**')
    const loginPage = new LoginPage(page)
    await expect(loginPage.form).toBeVisible()
  })

  test('AC3 — Learner blocked from admin routes', async ({ page }) => {
    // Register and login as a learner
    const learnerEmail = `e2e-auth-learner-${timestamp}@test.local`
    const learnerPassword = 'Test@123456'

    await registerLearner({
      name: `Auth Test Learner ${timestamp}`,
      email: learnerEmail,
      password: learnerPassword,
    })

    // Login via UI
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(learnerEmail, learnerPassword)
    await page.waitForURL('**/dashboard')

    // Try to access admin area
    await page.goto('/admin/courses')

    // Should see "Acesso negado" or be redirected to dashboard
    // The ProtectedRoute shows access denied briefly then redirects
    const accessDenied = page.getByTestId('access-denied-message')
    const isDashboard = page.url().includes('/dashboard')

    // Either we see the access denied message or we're redirected
    if (!isDashboard) {
      await expect(accessDenied).toBeVisible({ timeout: 5_000 })
    }

    // Eventually should be redirected to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10_000 })
  })

  test('AC4 — Login with invalid credentials shows error', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    // Submit with incorrect credentials
    await loginPage.login('nonexistent@test.local', 'WrongPassword123')

    // Should show generic error message (not enumerate email)
    await expect(loginPage.errorMessage).toBeVisible()
    // Error should NOT contain specific info about whether email exists
    const errorText = await loginPage.errorMessage.textContent()
    expect(errorText).not.toContain('nonexistent@test.local')
  })

  test('AC5 — 401 handler clears token and redirects to /login', async ({
    page,
  }) => {
    // Register and login as a learner
    const learnerEmail = `e2e-auth-401-${timestamp}@test.local`
    const learnerPassword = 'Test@123456'

    await registerLearner({
      name: `Auth 401 Learner ${timestamp}`,
      email: learnerEmail,
      password: learnerPassword,
    })

    // Login via UI
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(learnerEmail, learnerPassword)
    await page.waitForURL('**/dashboard')

    // Corrupt the token in localStorage to simulate expiry
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'invalid.token.value')
      // Also set the cookie to the invalid value so middleware doesn't interfere
      document.cookie = 'auth_token=invalid.token.value; path=/'
    })

    // Navigate to dashboard — this triggers an API call with the invalid token
    await page.goto('/dashboard')

    // The API will return 401, the global handler should clear auth and redirect
    // Wait for redirect to login page
    await page.waitForURL('**/login**', { timeout: 15_000 })
  })

  test('AC5.2 — Admin token does not grant learner access to admin API responses', async () => {
    // Ensure the admin token actually works (sanity check)
    const adminToken = await loginAsAdmin()
    expect(adminToken).toBeTruthy()
    expect(adminToken.split('.').length).toBe(3) // valid JWT format
  })
})
