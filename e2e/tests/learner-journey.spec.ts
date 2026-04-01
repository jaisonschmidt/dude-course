import { test, expect } from '../fixtures/auth.fixture'
import { loginAsAdmin, seedPublishedCourseWithLessons } from '../helpers/seed'
import {
  LoginPage,
  RegisterPage,
  CourseCatalogPage,
  CourseDetailPage,
  LessonPlayerPage,
  DashboardPage,
} from '../pages'

/**
 * E2E — Learner Journey (Issue #73)
 *
 * Full learner journey from register → certificate:
 *   Register → Login → Browse Catalog → Course Detail → Enroll →
 *   Complete Lessons → Dashboard → Generate Certificate
 *
 * Uses test.describe.serial so tests share browser context (login persists).
 * Seed: published course with 3 lessons via admin API.
 */

let adminToken: string
let courseId: number
let lessonIds: number[]
let courseTitle: string

const timestamp = Date.now()
const learnerName = `E2E Journey ${timestamp}`
const learnerEmail = `e2e-journey-${timestamp}@test.local`
const learnerPassword = 'Test@123456'

test.describe.serial('Learner Journey — register → certificate', () => {
  test.beforeAll(async () => {
    adminToken = await loginAsAdmin()
    const seeded = await seedPublishedCourseWithLessons(adminToken, {
      title: `Journey Course ${timestamp}`,
      description: 'A full journey test course with 3 lessons',
      lessonCount: 3,
    })
    courseId = seeded.course.id
    courseTitle = seeded.course.title
    lessonIds = seeded.lessons.map((l) => l.id)
  })

  test('AC1.1 — Register new learner', async ({ page }) => {
    const registerPage = new RegisterPage(page)
    await registerPage.goto()

    await expect(registerPage.form).toBeVisible()
    await registerPage.register(learnerName, learnerEmail, learnerPassword)

    // After registration, redirects to /login with success message
    await page.waitForURL('**/login**')
    await expect(page.getByTestId('login-success-message')).toBeVisible()
    await expect(page.getByTestId('login-success-message')).toContainText(
      'Conta criada com sucesso',
    )
  })

  test('AC1.2 — Login with registered credentials', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await expect(loginPage.form).toBeVisible()
    await loginPage.login(learnerEmail, learnerPassword)

    // After login, redirects to /dashboard
    await page.waitForURL('**/dashboard')
    await expect(page.getByTestId('dashboard-stats')).toBeVisible()
  })

  test('AC2 — Browse catalog shows only published courses', async ({ page }) => {
    const catalogPage = new CourseCatalogPage(page)
    await catalogPage.goto()

    // The seeded course should be visible in the catalog
    await expect(catalogPage.courseList).toBeVisible()
    await expect(catalogPage.courseCard(courseId)).toBeVisible()
    await expect(catalogPage.courseCard(courseId)).toContainText(courseTitle)
  })

  test('AC1.3 — View course detail and enroll', async ({ page }) => {
    // Re-login: serial tests get fresh page instances (no shared cookies)
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(learnerEmail, learnerPassword)
    await page.waitForURL('**/dashboard')

    const detailPage = new CourseDetailPage(page)
    await detailPage.goto(courseId)

    // Verify course information
    await expect(detailPage.courseTitle).toHaveText(courseTitle)
    await expect(detailPage.courseDescription).toBeVisible()
    await expect(detailPage.lessonCount).toContainText('3 aulas')

    // Verify lesson list is visible
    await expect(detailPage.lessonList).toBeVisible()

    // Enroll in the course
    await expect(detailPage.enrollButton).toBeVisible()
    await detailPage.enrollButton.click()

    // After enrollment, should show enrolled badge
    await expect(detailPage.enrolledBadge).toBeVisible()
  })

  test('AC3 — Complete first lesson and verify progress', async ({ page }) => {
    // Re-login: serial tests get fresh page instances
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(learnerEmail, learnerPassword)
    await page.waitForURL('**/dashboard')

    const lessonPlayer = new LessonPlayerPage(page)

    // Navigate to first lesson
    await lessonPlayer.goto(courseId, lessonIds[0])

    // Mark first lesson as complete
    await expect(lessonPlayer.markCompleteButton).toBeVisible()
    await lessonPlayer.markCompleteButton.click()

    // Verify completed badge appears
    await expect(lessonPlayer.completedBadge).toBeVisible()

    // Navigate back to course detail to check progress bar
    const detailPage = new CourseDetailPage(page)
    await detailPage.goto(courseId)

    // Progress bar should show ~33% (1/3)
    await expect(page.getByTestId('progress-bar')).toBeVisible()
    await expect(page.getByTestId('progress-bar-percentage')).toHaveText('33%')
  })

  test('AC1.4 — Complete remaining lessons', async ({ page }) => {
    // Re-login: serial tests get fresh page instances
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(learnerEmail, learnerPassword)
    await page.waitForURL('**/dashboard')

    const lessonPlayer = new LessonPlayerPage(page)

    // Complete lesson 2
    await lessonPlayer.goto(courseId, lessonIds[1])
    await expect(lessonPlayer.markCompleteButton).toBeVisible()
    await lessonPlayer.markCompleteButton.click()
    await expect(lessonPlayer.completedBadge).toBeVisible()

    // Complete lesson 3
    await lessonPlayer.goto(courseId, lessonIds[2])
    await expect(lessonPlayer.markCompleteButton).toBeVisible()
    await lessonPlayer.markCompleteButton.click()
    await expect(lessonPlayer.completedBadge).toBeVisible()
  })

  test('AC4 — Dashboard shows completed course and generate certificate', async ({
    page,
  }) => {
    // Re-login: serial tests get fresh page instances
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(learnerEmail, learnerPassword)
    await page.waitForURL('**/dashboard')

    const dashboard = new DashboardPage(page)
    await dashboard.goto()

    // Course should now be in "completed" section
    await expect(dashboard.completedSection).toBeVisible()
    await expect(dashboard.completedSection).toContainText(courseTitle)

    // Generate certificate
    const generateButton = page.getByTestId(`generate-certificate-${courseId}`)
    await expect(generateButton).toBeVisible()
    await generateButton.click()

    // Wait for certificate to be generated — badge should appear
    const issuedBadge = page.getByTestId(`certificate-issued-${courseId}`)
    await expect(issuedBadge).toBeVisible()

    // Certificate should appear in certificates section
    await expect(dashboard.certificatesSection).toBeVisible()
    const certificateCode = page.getByTestId('certificate-card-code')
    await expect(certificateCode.first()).toBeVisible()
  })

  test('AC2.2 — Catalog is public (no auth required)', async ({ browser }) => {
    // Open a fresh context (no cookies/auth)
    const context = await browser.newContext()
    const page = await context.newPage()

    const catalogPage = new CourseCatalogPage(page)
    await catalogPage.goto()

    // Published course should be visible without authentication
    await expect(catalogPage.courseList).toBeVisible()
    await expect(catalogPage.courseCard(courseId)).toBeVisible()

    await context.close()
  })
})
