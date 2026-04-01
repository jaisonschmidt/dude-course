import { test, expect } from '../fixtures/auth.fixture'
import {
  loginAsAdmin,
  reorderLessons,
} from '../helpers/seed'
import {
  AdminCoursesPage,
  AdminCourseFormPage,
  AdminLessonsPage,
  CourseCatalogPage,
} from '../pages'

/**
 * E2E — Admin Course Lifecycle (Issue #74)
 *
 * Full admin journey:
 *   Login → Create draft → Add lessons → Reorder → Publish →
 *   Verify in catalog → Edit → Unpublish → Verify removed → Delete
 *
 * Uses test.describe.serial so tests share browser context.
 * Seed: admin user only (from DB seed).
 */

let adminToken: string
let createdCourseId: number
const lessonIds: number[] = []

const timestamp = Date.now()
const courseTitle = `Admin E2E Course ${timestamp}`
const courseDescription = 'E2E test course for admin lifecycle'
const updatedCourseTitle = `Updated Admin E2E Course ${timestamp}`

test.describe.serial('Admin Course Lifecycle — create → delete', () => {
  test.beforeAll(async () => {
    adminToken = await loginAsAdmin()
  })

  test('Login as admin and access admin area', async ({
    authenticatedAdminPage: page,
  }) => {
    const adminCourses = new AdminCoursesPage(page)
    await adminCourses.goto()

    // Verify admin courses page loads
    await expect(adminCourses.createCourseButton).toBeVisible()
  })

  test('AC1 — Create draft course', async ({ authenticatedAdminPage: page }) => {
    const adminCourses = new AdminCoursesPage(page)
    await adminCourses.goto()

    // Click "Novo Curso" button
    await adminCourses.createCourseButton.click()

    // Fill the course form
    const courseForm = new AdminCourseFormPage(page)
    await expect(courseForm.form).toBeVisible()
    await courseForm.fillCourseForm({
      title: courseTitle,
      description: courseDescription,
    })

    // Should redirect to edit page — extract course ID from URL
    await page.waitForURL('**/admin/courses/*/edit')
    const url = page.url()
    const idMatch = url.match(/\/admin\/courses\/(\d+)\/edit/)
    expect(idMatch).toBeTruthy()
    createdCourseId = Number(idMatch![1])

    // Go back to admin list and verify the course card exists with draft status
    await adminCourses.goto()
    const courseCard = adminCourses.courseCard(createdCourseId)
    await expect(courseCard).toBeVisible()
    await expect(courseCard).toContainText(courseTitle)
    await expect(courseCard).toContainText('Rascunho')
  })

  test('AC1.2 — Draft course is NOT visible in public catalog', async ({
    browser,
  }) => {
    // Use a fresh context (no auth) to check public catalog
    const context = await browser.newContext()
    const page = await context.newPage()
    const catalogPage = new CourseCatalogPage(page)
    await catalogPage.goto()

    // The draft course should NOT appear
    await expect(catalogPage.courseList).toBeVisible()
    const courseCard = catalogPage.courseCard(createdCourseId)
    await expect(courseCard).not.toBeVisible()

    await context.close()
  })

  test('AC2 — Add 3 lessons to the course', async ({
    authenticatedAdminPage: page,
  }) => {
    const lessonsPage = new AdminLessonsPage(page)
    await lessonsPage.goto(createdCourseId)

    const lessons = [
      {
        title: 'Intro to Testing',
        youtubeUrl: 'https://www.youtube.com/watch?v=admin-e2e-1',
        position: '1',
      },
      {
        title: 'Advanced Patterns',
        youtubeUrl: 'https://www.youtube.com/watch?v=admin-e2e-2',
        position: '2',
      },
      {
        title: 'Best Practices',
        youtubeUrl: 'https://www.youtube.com/watch?v=admin-e2e-3',
        position: '3',
      },
    ]

    for (const lessonData of lessons) {
      await lessonsPage.addLessonButton.click()
      await expect(lessonsPage.lessonForm).toBeVisible()

      await lessonsPage.lessonFormTitle.fill(lessonData.title)
      await lessonsPage.lessonFormYoutubeUrl.fill(lessonData.youtubeUrl)
      await lessonsPage.lessonFormPosition.fill('')
      await lessonsPage.lessonFormPosition.fill(lessonData.position)
      await lessonsPage.lessonFormSubmit.click()

      // Wait for the form/modal to close
      await expect(lessonsPage.lessonForm).not.toBeVisible()
    }

    // Verify all 3 lessons are visible in the reorder list
    await expect(lessonsPage.lessonReorderList).toBeVisible()

    // Extract lesson IDs from the DOM for later use
    const lessonItems = page.locator('[data-testid^="lesson-reorder-item-"]')
    const count = await lessonItems.count()
    expect(count).toBe(3)

    for (let i = 0; i < count; i++) {
      const testId = await lessonItems.nth(i).getAttribute('data-testid')
      const id = Number(testId!.replace('lesson-reorder-item-', ''))
      lessonIds.push(id)
    }
  })

  test('AC2.2 — Reorder lessons via API and verify UI', async ({
    authenticatedAdminPage: page,
  }) => {
    // Reorder lessons: swap position of first and third via API
    await reorderLessons(adminToken, createdCourseId, [
      { lessonId: lessonIds[0], position: 3 },
      { lessonId: lessonIds[1], position: 1 },
      { lessonId: lessonIds[2], position: 2 },
    ])

    // Refresh the lessons page and verify new order
    const lessonsPage = new AdminLessonsPage(page)
    await lessonsPage.goto(createdCourseId)

    const lessonItems = page.locator('[data-testid^="lesson-reorder-item-"]')
    const count = await lessonItems.count()
    expect(count).toBe(3)

    // First item should now be lessonIds[1] (moved to position 1)
    const firstTestId = await lessonItems.first().getAttribute('data-testid')
    expect(firstTestId).toBe(`lesson-reorder-item-${lessonIds[1]}`)
  })

  test('AC3 — Publish course and verify in catalog', async ({
    authenticatedAdminPage: page,
  }) => {
    const adminCourses = new AdminCoursesPage(page)
    await adminCourses.goto()

    // Click publish button
    const publishBtn = adminCourses.publishButton(createdCourseId)
    await expect(publishBtn).toBeVisible()
    await publishBtn.click()

    // Card should now show "Publicado"
    const courseCard = adminCourses.courseCard(createdCourseId)
    await expect(courseCard).toContainText('Publicado')

    // Verify course appears in public catalog (fresh context, no auth)
    const context = await page.context().browser()!.newContext()
    const publicPage = await context.newPage()
    const catalogPage = new CourseCatalogPage(publicPage)
    await catalogPage.goto()

    await expect(catalogPage.courseCard(createdCourseId)).toBeVisible()
    await expect(catalogPage.courseCard(createdCourseId)).toContainText(courseTitle)

    await context.close()
  })

  test('AC3.2 — Edit published course', async ({
    authenticatedAdminPage: page,
  }) => {
    const courseForm = new AdminCourseFormPage(page)
    await courseForm.gotoEdit(createdCourseId)

    // Update title
    await courseForm.titleInput.clear()
    await courseForm.titleInput.fill(updatedCourseTitle)
    await courseForm.submitButton.click()

    // Verify success feedback
    await expect(page.getByText('Curso atualizado com sucesso')).toBeVisible()
  })

  test('AC4 — Unpublish course removes from catalog', async ({
    authenticatedAdminPage: page,
  }) => {
    const adminCourses = new AdminCoursesPage(page)
    await adminCourses.goto()

    // Click unpublish — triggers confirmation modal
    const unpublishBtn = adminCourses.unpublishButton(createdCourseId)
    await expect(unpublishBtn).toBeVisible()
    await unpublishBtn.click()

    // Confirm in the modal
    await expect(page.getByTestId('confirm-modal-message')).toBeVisible()
    await page.getByTestId('confirm-modal-confirm').click()

    // Wait for card to update — should now show "Despublicado"
    const courseCard = adminCourses.courseCard(createdCourseId)
    await expect(courseCard).toContainText('Despublicado')

    // Verify course is NOT in public catalog
    const context = await page.context().browser()!.newContext()
    const publicPage = await context.newPage()
    const catalogPage = new CourseCatalogPage(publicPage)
    await catalogPage.goto()

    await expect(catalogPage.courseCard(createdCourseId)).not.toBeVisible()

    await context.close()
  })

  test('AC5 — Delete course removes from admin list', async ({
    authenticatedAdminPage: page,
  }) => {
    const adminCourses = new AdminCoursesPage(page)
    await adminCourses.goto()

    // Course card should be visible before delete
    await expect(adminCourses.courseCard(createdCourseId)).toBeVisible()

    // Click delete — triggers confirmation modal
    const deleteBtn = adminCourses.deleteButton(createdCourseId)
    await deleteBtn.click()

    // Confirm in the modal
    await expect(page.getByTestId('confirm-modal-message')).toBeVisible()
    await page.getByTestId('confirm-modal-confirm').click()

    // Course card should disappear from the admin list
    await expect(adminCourses.courseCard(createdCourseId)).not.toBeVisible()
  })
})
