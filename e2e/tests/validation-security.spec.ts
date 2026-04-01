import { test, expect, type APIRequestContext } from '@playwright/test'
import {
  loginAsAdmin,
  createCourse,
  addLesson,
  publishCourse,
  unpublishCourse,
} from '../helpers/seed'

const API_BASE = process.env.E2E_API_URL || 'http://localhost:3001/api/v1'

/**
 * E2E — Validation and Security (Issue #76 — AC4, AC5, AC6)
 *
 * Validates:
 *   AC4 — Client-side form validation (register + login) shows inline errors
 *   AC5 — Draft and unpublished courses return 404 on direct URL access
 *   AC6 — API error responses always contain `requestId`
 */

let adminToken: string
let draftCourseId: number
let unpublishedCourseId: number

test.beforeAll(async () => {
  adminToken = await loginAsAdmin()

  // AC5a — Create a draft course (no lessons, no publish)
  const draft = await createCourse(adminToken, {
    title: `Draft Course ${Date.now()}`,
    description: 'Draft for validation E2E tests',
  })
  draftCourseId = draft.id

  // AC5b — Create and immediately unpublish a course
  const ts = Date.now()
  const toUnpublish = await createCourse(adminToken, {
    title: `Unpublish Course ${ts}`,
    description: 'Will be published then unpublished',
  })
  await addLesson(adminToken, toUnpublish.id, {
    title: 'Lesson 1',
    youtubeUrl: 'https://www.youtube.com/watch?v=unpublish-test',
    position: 1,
  })
  await publishCourse(adminToken, toUnpublish.id)
  await unpublishCourse(adminToken, toUnpublish.id)
  unpublishedCourseId = toUnpublish.id
})

test.describe('Form Validation (AC4)', () => {
  test('AC4 — Register: empty fields show validation messages', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByTestId('register-form')).toBeVisible()

    // Submit without filling anything
    await page.getByTestId('register-submit-button').click()

    // Inline validation errors should appear (role="alert" from Input component)
    await expect(page.getByRole('alert').first()).toBeVisible()
    await expect(page.getByText('Nome deve ter pelo menos 2 caracteres')).toBeVisible()
    await expect(page.getByText('Email é obrigatório')).toBeVisible()
    await expect(page.getByText('Senha deve ter pelo menos 8 caracteres').first()).toBeVisible()
  })

  test('AC4 — Register: invalid email shows inline error', async ({ page }) => {
    await page.goto('/register')

    await page.getByTestId('register-name-input').fill('Valid Name')
    await page.getByTestId('register-email-input').fill('not-an-email')
    await page.getByTestId('register-password-input').fill('ValidPass123')
    await page.getByTestId('register-confirm-password-input').fill('ValidPass123')
    await page.getByTestId('register-submit-button').click()

    // "Email inválido" inline error — no API call made (client-side validation)
    await expect(page.getByText('Email inválido')).toBeVisible()

    // No API error (register-error-message should NOT appear)
    await expect(page.getByTestId('register-error-message')).not.toBeVisible()
  })

  test('AC4 — Register: short password shows inline error', async ({ page }) => {
    await page.goto('/register')

    await page.getByTestId('register-name-input').fill('Valid Name')
    await page.getByTestId('register-email-input').fill('valid@email.com')
    await page.getByTestId('register-password-input').fill('short')
    await page.getByTestId('register-confirm-password-input').fill('short')
    await page.getByTestId('register-submit-button').click()

    await expect(page.getByText('Senha deve ter pelo menos 8 caracteres').first()).toBeVisible()

    // No API error
    await expect(page.getByTestId('register-error-message')).not.toBeVisible()
  })

  test('AC4 — Login: empty fields show validation messages', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByTestId('login-form')).toBeVisible()

    // Submit without filling anything
    await page.getByTestId('login-submit-button').click()

    await expect(page.getByText('Email é obrigatório')).toBeVisible()
    await expect(page.getByText('Senha deve ter pelo menos 8 caracteres')).toBeVisible()

    // No API error (client-side validation prevented the request)
    await expect(page.getByTestId('login-error-message')).not.toBeVisible()
  })
})

test.describe('Draft and Unpublished Course Access (AC5)', () => {
  test('AC5a — Draft course URL shows 404 error', async ({ page }) => {
    await page.goto(`/courses/${draftCourseId}`)

    // The frontend catches the 404 from the API and shows ErrorMessage (role="alert")
    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page.getByRole('alert')).toContainText('Curso não encontrado')
  })

  test('AC5b — Unpublished course URL shows 404 error', async ({ page }) => {
    await page.goto(`/courses/${unpublishedCourseId}`)

    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page.getByRole('alert')).toContainText('Curso não encontrado')
  })
})

test.describe('API Error Response (AC6)', () => {
  test('AC6 — 404 error response includes requestId', async ({ request }: { request: APIRequestContext }) => {
    const response = await request.get(`${API_BASE}/courses/999999999`)

    expect(response.status()).toBe(404)

    const body = await response.json()
    expect(body.error).toBeDefined()
    expect(body.error.requestId).toBeTruthy()
    expect(typeof body.error.requestId).toBe('string')
  })

  test('AC6 — 401 error response includes requestId', async ({ request }: { request: APIRequestContext }) => {
    const response = await request.get(`${API_BASE}/me/dashboard`)

    expect(response.status()).toBe(401)

    const body = await response.json()
    expect(body.error).toBeDefined()
    expect(body.error.requestId).toBeTruthy()
  })

  test('AC6 — 409 Conflict error response includes requestId', async ({ request }: { request: APIRequestContext }) => {
    // Register same email twice — second call returns 409 with requestId
    const ts = Date.now()
    const payload = {
      name: `Conflict User ${ts}`,
      email: `conflict-${ts}@test.local`,
      password: 'Test@123456',
    }

    // First registration
    await request.post(`${API_BASE}/auth/register`, { data: payload })

    // Second registration with same email
    const response = await request.post(`${API_BASE}/auth/register`, { data: payload })

    expect(response.status()).toBe(409)

    const body = await response.json()
    expect(body.error).toBeDefined()
    expect(body.error.requestId).toBeTruthy()
    expect(body.error.code).toBe('CONFLICT')
  })
})
