import { test, expect } from '@playwright/test'

test.describe('E2E Infrastructure Smoke Test', () => {
  test('backend health endpoint responds OK', async ({ request }) => {
    const response = await request.get('http://localhost:3001/health')
    expect(response.ok()).toBeTruthy()
    const body = await response.json()
    expect(body.data.status).toBe('ok')
  })

  test('frontend loads homepage', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Dude Course/i)
  })

  test('login page renders with data-testid', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByTestId('login-form')).toBeVisible()
    await expect(page.getByTestId('login-email-input')).toBeVisible()
    await expect(page.getByTestId('login-password-input')).toBeVisible()
    await expect(page.getByTestId('login-submit-button')).toBeVisible()
  })

  test('register page renders with data-testid', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByTestId('register-form')).toBeVisible()
    await expect(page.getByTestId('register-name-input')).toBeVisible()
    await expect(page.getByTestId('register-email-input')).toBeVisible()
  })

  test('courses catalog page loads', async ({ page }) => {
    await page.goto('/courses')
    await expect(page.getByTestId('course-list')).toBeVisible()
  })
})
