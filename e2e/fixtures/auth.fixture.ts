import { test as base, type Page } from '@playwright/test'
import { loginAsAdmin, registerLearner } from '../helpers/seed'

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'admin@dudecourse.local'
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'Admin@123456'

interface AuthFixtures {
  authenticatedLearnerPage: Page
  authenticatedAdminPage: Page
  learnerCredentials: { name: string; email: string; password: string }
  adminToken: string
}

async function authenticateViaUI(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto('/login')
  await page.getByTestId('login-email-input').fill(email)
  await page.getByTestId('login-password-input').fill(password)
  await page.getByTestId('login-submit-button').click()
  await page.waitForURL('**/dashboard')
}

export const test = base.extend<AuthFixtures>({
  learnerCredentials: async ({}, use) => {
    const timestamp = Date.now()
    const credentials = {
      name: `E2E Learner ${timestamp}`,
      email: `e2e-learner-${timestamp}@test.local`,
      password: 'Test@123456',
    }
    await registerLearner(credentials)
    await use(credentials)
  },

  authenticatedLearnerPage: async ({ page, learnerCredentials }, use) => {
    await authenticateViaUI(
      page,
      learnerCredentials.email,
      learnerCredentials.password,
    )
    await use(page)
  },

  authenticatedAdminPage: async ({ page }, use) => {
    await authenticateViaUI(page, ADMIN_EMAIL, ADMIN_PASSWORD)
    await use(page)
  },

  adminToken: async ({}, use) => {
    const token = await loginAsAdmin()
    await use(token)
  },
})

export { expect } from '@playwright/test'
