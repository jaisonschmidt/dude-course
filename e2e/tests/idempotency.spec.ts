import { test, expect } from '@playwright/test'
import {
  loginAsAdmin,
  registerLearner,
  loginAsLearner,
  seedPublishedCourseWithLessons,
  enrollInCourseAPI,
  markLessonCompleteAPI,
  generateCertificateAPI,
  getDashboardAPI,
} from '../helpers/seed'

/**
 * E2E — Idempotency (Issue #76 — AC1, AC2, AC3)
 *
 * Validates that critical operations are idempotent:
 *   - Enrollment: second call returns 200, dashboard shows course once
 *   - Lesson progress: marking same lesson twice keeps progress at 33%
 *   - Certificate: generating twice returns the same certificateCode
 *
 * Tests are pure API (no browser), independent, and each creates a fresh learner.
 */

const BASE_TS = Date.now()

let courseId: number
let lessonIds: number[]

test.beforeAll(async () => {
  const adminToken = await loginAsAdmin()
  const seeded = await seedPublishedCourseWithLessons(adminToken, {
    title: `Idempotency Test Course ${BASE_TS}`,
    description: 'Course for idempotency E2E tests',
    lessonCount: 3,
  })
  courseId = seeded.course.id
  lessonIds = seeded.lessons.map((l) => l.id)
})

test.describe('Idempotency', () => {
  test('AC1 — Double enrollment: second call returns 200, dashboard shows course once', async () => {
    const ts = Date.now()
    const email = `idem-enroll-${ts}@test.local`
    const password = 'Test@123456'

    await registerLearner({ name: `Idem Enroll ${ts}`, email, password })
    const { token } = await loginAsLearner(email, password)

    // First enrollment → 201 Created
    const status1 = await enrollInCourseAPI(token, courseId)
    expect(status1).toBe(201)

    // Second enrollment → 200 OK (idempotent)
    const status2 = await enrollInCourseAPI(token, courseId)
    expect(status2).toBe(200)

    // Dashboard must show the course exactly once in inProgress
    const dashboard = await getDashboardAPI(token)
    const enrollments = dashboard.inProgress.filter((c) => c.courseId === courseId)
    expect(enrollments).toHaveLength(1)
  })

  test('AC2 — Double lesson complete: progress stays at 33% (1/3)', async () => {
    const ts = Date.now()
    const email = `idem-progress-${ts}@test.local`
    const password = 'Test@123456'

    await registerLearner({ name: `Idem Progress ${ts}`, email, password })
    const { token } = await loginAsLearner(email, password)

    await enrollInCourseAPI(token, courseId)

    // Mark lesson 1 complete → first time
    await markLessonCompleteAPI(token, courseId, lessonIds[0])

    // Mark lesson 1 complete → second time (idempotent)
    await markLessonCompleteAPI(token, courseId, lessonIds[0])

    // Dashboard must reflect exactly 1 lesson completed (not 2)
    const dashboard = await getDashboardAPI(token)
    const inProgress = dashboard.inProgress.find((c) => c.courseId === courseId)

    expect(inProgress).toBeDefined()
    expect(inProgress!.progress.completed).toBe(1)
    // 1 out of 3 = 33%
    expect(inProgress!.progress.total).toBe(3)
  })

  test('AC3 — Double certificate generation returns same certificateCode', async () => {
    const ts = Date.now()
    const email = `idem-cert-${ts}@test.local`
    const password = 'Test@123456'

    await registerLearner({ name: `Idem Cert ${ts}`, email, password })
    const { token } = await loginAsLearner(email, password)

    await enrollInCourseAPI(token, courseId)

    // Complete all 3 lessons
    for (const lessonId of lessonIds) {
      await markLessonCompleteAPI(token, courseId, lessonId)
    }

    // Generate certificate — first time
    const cert1 = await generateCertificateAPI(token, courseId)
    expect(cert1.certificateCode).toBeTruthy()

    // Generate certificate — second time (idempotent)
    const cert2 = await generateCertificateAPI(token, courseId)

    // Must return the exact same code
    expect(cert2.certificateCode).toBe(cert1.certificateCode)
  })
})
