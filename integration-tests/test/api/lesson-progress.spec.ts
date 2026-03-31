/**
 * Lesson Progress integration tests.
 *
 * Tests: POST /api/v1/courses/:courseId/lessons/:lessonId/progress
 *   (idempotent mark-complete + auto-completion)
 *
 * Requires:
 *   - A running backend instance (BACKEND_URL, default: http://localhost:3001)
 *   - A clean test database
 *   - RUN_INTEGRATION_TESTS=true
 */

import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { post } from '../../helpers/request.js'
import { setupDb, teardownDb, truncateAll, getTestPrisma } from '../../helpers/db.js'

const shouldRun = process.env['RUN_INTEGRATION_TESTS'] === 'true'
const describeOrSkip = shouldRun ? describe : describe.skip

interface ProgressResponse {
  data: {
    id: number
    userId: number
    courseId: number
    lessonId: number
    completedAt: string
  }
  requestId: string
}

interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: Array<{ field: string; message: string }>
    requestId: string
  }
}

interface LoginResponse {
  data: {
    accessToken: string
    expiresIn: string
    user: { id: number; name: string; email: string; role: string }
  }
  requestId: string
}

/**
 * Seed a published course with lessons. Returns courseId and lessonIds.
 */
async function seedCourseWithLessons(
  lessonCount = 2,
): Promise<{ courseId: number; lessonIds: number[] }> {
  const prisma = getTestPrisma()

  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      INSERT INTO courses (title, description, status, created_at, updated_at)
      VALUES ('Test Course', 'A test course', 'published', NOW(), NOW())
    `
    const courseRows = await tx.$queryRaw`SELECT LAST_INSERT_ID() as id` as Array<{ id: bigint }>
    const courseId = Number(courseRows[0]!.id)

    const lessonIds: number[] = []
    for (let i = 1; i <= lessonCount; i++) {
      await tx.$executeRaw`
        INSERT INTO lessons (course_id, title, youtube_url, position, created_at, updated_at)
        VALUES (${courseId}, ${`Lesson ${i}`}, ${`https://youtube.com/watch?v=test${i}`}, ${i}, NOW(), NOW())
      `
      const lessonRows = await tx.$queryRaw`SELECT LAST_INSERT_ID() as id` as Array<{ id: bigint }>
      lessonIds.push(Number(lessonRows[0]!.id))
    }

    return { courseId, lessonIds }
  })
}

/**
 * Register + login a user and return their access token and userId.
 */
async function registerAndLogin(
  email = 'learner@example.com',
  password = 'securepassword123',
): Promise<{ token: string; userId: number }> {
  await post('/api/v1/auth/register', {
    name: 'Test Learner',
    email,
    password,
  })

  const loginRes = await post<LoginResponse>('/api/v1/auth/login', {
    email,
    password,
  })

  return {
    token: loginRes.body.data.accessToken,
    userId: loginRes.body.data.user.id,
  }
}

/**
 * Enroll a user in a course. Returns enrollment id.
 */
async function enrollUser(courseId: number, token: string): Promise<number> {
  const res = await post<{ data: { id: number } }>(
    `/api/v1/courses/${courseId}/enrollments`,
    {},
    { Authorization: `Bearer ${token}` },
  )
  return res.body.data.id
}

describeOrSkip('Lesson Progress Endpoints', () => {
  beforeAll(async () => {
    await setupDb()
  })

  beforeEach(async () => {
    await truncateAll()
  })

  afterAll(async () => {
    await teardownDb()
  })

  // ────────────────────────────────────────
  // POST /api/v1/courses/:courseId/lessons/:lessonId/progress
  // ────────────────────────────────────────
  describe('POST /api/v1/courses/:courseId/lessons/:lessonId/progress', () => {
    it('AC-01: should return 200 with progress data when marking lesson as completed', async () => {
      const { courseId, lessonIds } = await seedCourseWithLessons(3)
      const { token, userId } = await registerAndLogin()
      await enrollUser(courseId, token)

      const res = await post<ProgressResponse>(
        `/api/v1/courses/${courseId}/lessons/${lessonIds[0]}/progress`,
        {},
        { Authorization: `Bearer ${token}` },
      )

      expect(res.status).toBe(200)
      expect(res.body.data).toMatchObject({
        userId,
        courseId,
        lessonId: lessonIds[0],
      })
      expect(res.body.data.id).toBeTypeOf('number')
      expect(res.body.data.completedAt).toBeTypeOf('string')
      expect(res.body.requestId).toBeTypeOf('string')
    })

    it('AC-02: should return 200 with existing progress when called again (idempotent)', async () => {
      const { courseId, lessonIds } = await seedCourseWithLessons(2)
      const { token } = await registerAndLogin()
      await enrollUser(courseId, token)

      // First call
      const first = await post<ProgressResponse>(
        `/api/v1/courses/${courseId}/lessons/${lessonIds[0]}/progress`,
        {},
        { Authorization: `Bearer ${token}` },
      )
      expect(first.status).toBe(200)

      // Second call — idempotent
      const second = await post<ProgressResponse>(
        `/api/v1/courses/${courseId}/lessons/${lessonIds[0]}/progress`,
        {},
        { Authorization: `Bearer ${token}` },
      )
      expect(second.status).toBe(200)
      expect(second.body.data.id).toBe(first.body.data.id)
      expect(second.body.data.completedAt).toBe(first.body.data.completedAt)
    })

    it('AC-02: should not create duplicate progress records in the database', async () => {
      const { courseId, lessonIds } = await seedCourseWithLessons(2)
      const { token, userId } = await registerAndLogin()
      await enrollUser(courseId, token)

      // Mark same lesson twice
      await post(
        `/api/v1/courses/${courseId}/lessons/${lessonIds[0]}/progress`,
        {},
        { Authorization: `Bearer ${token}` },
      )
      await post(
        `/api/v1/courses/${courseId}/lessons/${lessonIds[0]}/progress`,
        {},
        { Authorization: `Bearer ${token}` },
      )

      // Verify only one progress record exists
      const prisma = getTestPrisma()
      const rows = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM lesson_progress
        WHERE user_id = ${userId} AND lesson_id = ${lessonIds[0]}
      ` as Array<{ count: bigint }>
      expect(Number(rows[0]!.count)).toBe(1)
    })

    it('AC-03: should auto-complete enrollment when all lessons are completed', async () => {
      const { courseId, lessonIds } = await seedCourseWithLessons(2)
      const { token, userId } = await registerAndLogin()
      await enrollUser(courseId, token)

      // Complete lesson 1
      await post(
        `/api/v1/courses/${courseId}/lessons/${lessonIds[0]}/progress`,
        {},
        { Authorization: `Bearer ${token}` },
      )

      // Complete lesson 2 (last lesson → auto-complete enrollment)
      await post(
        `/api/v1/courses/${courseId}/lessons/${lessonIds[1]}/progress`,
        {},
        { Authorization: `Bearer ${token}` },
      )

      // Verify enrollment is marked as completed
      const prisma = getTestPrisma()
      const rows = await prisma.$queryRaw`
        SELECT completed_at FROM enrollments
        WHERE user_id = ${userId} AND course_id = ${courseId}
      ` as Array<{ completed_at: Date | null }>
      expect(rows[0]!.completed_at).not.toBeNull()
    })

    it('AC-03: should NOT auto-complete when not all lessons are completed', async () => {
      const { courseId, lessonIds } = await seedCourseWithLessons(3)
      const { token, userId } = await registerAndLogin()
      await enrollUser(courseId, token)

      // Complete only lesson 1 of 3
      await post(
        `/api/v1/courses/${courseId}/lessons/${lessonIds[0]}/progress`,
        {},
        { Authorization: `Bearer ${token}` },
      )

      // Verify enrollment is NOT completed
      const prisma = getTestPrisma()
      const rows = await prisma.$queryRaw`
        SELECT completed_at FROM enrollments
        WHERE user_id = ${userId} AND course_id = ${courseId}
      ` as Array<{ completed_at: Date | null }>
      expect(rows[0]!.completed_at).toBeNull()
    })

    it('AC-04: should return 404 when lesson does not belong to the course', async () => {
      const { courseId } = await seedCourseWithLessons(1)
      const course2 = await seedCourseWithLessons(1) // another course with different lessons
      const { token } = await registerAndLogin()
      await enrollUser(courseId, token)

      // Try to mark a lesson from course2 against course1
      const res = await post<ErrorResponse>(
        `/api/v1/courses/${courseId}/lessons/${course2.lessonIds[0]}/progress`,
        {},
        { Authorization: `Bearer ${token}` },
      )

      expect(res.status).toBe(404)
      expect(res.body.error.code).toBe('NOT_FOUND')
    })

    it('AC-05: should return 404 when learner is not enrolled in the course', async () => {
      const { courseId, lessonIds } = await seedCourseWithLessons(2)
      const { token } = await registerAndLogin()
      // NOT enrolling the user

      const res = await post<ErrorResponse>(
        `/api/v1/courses/${courseId}/lessons/${lessonIds[0]}/progress`,
        {},
        { Authorization: `Bearer ${token}` },
      )

      expect(res.status).toBe(404)
      expect(res.body.error.code).toBe('NOT_FOUND')
    })

    it('AC-06: should return 401 when no auth token is provided', async () => {
      const { courseId, lessonIds } = await seedCourseWithLessons(1)

      const res = await post<ErrorResponse>(
        `/api/v1/courses/${courseId}/lessons/${lessonIds[0]}/progress`,
        {},
      )

      expect(res.status).toBe(401)
      expect(res.body.error.code).toBe('UNAUTHORIZED')
      expect(res.body.error.requestId).toBeTypeOf('string')
    })

    it('AC-06: should return 401 when auth token is invalid', async () => {
      const { courseId, lessonIds } = await seedCourseWithLessons(1)

      const res = await post<ErrorResponse>(
        `/api/v1/courses/${courseId}/lessons/${lessonIds[0]}/progress`,
        {},
        { Authorization: 'Bearer invalid-token-here' },
      )

      expect(res.status).toBe(401)
      expect(res.body.error.code).toBe('UNAUTHORIZED')
    })

    it('AC-07: should return 400 for non-numeric courseId', async () => {
      const { token } = await registerAndLogin()

      const res = await post<ErrorResponse>(
        '/api/v1/courses/abc/lessons/1/progress',
        {},
        { Authorization: `Bearer ${token}` },
      )

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('AC-07: should return 400 for non-numeric lessonId', async () => {
      const { token } = await registerAndLogin()

      const res = await post<ErrorResponse>(
        '/api/v1/courses/1/lessons/xyz/progress',
        {},
        { Authorization: `Bearer ${token}` },
      )

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('should include requestId in all responses', async () => {
      const { courseId, lessonIds } = await seedCourseWithLessons(1)
      const { token } = await registerAndLogin()
      await enrollUser(courseId, token)

      // Success response
      const successRes = await post<ProgressResponse>(
        `/api/v1/courses/${courseId}/lessons/${lessonIds[0]}/progress`,
        {},
        { Authorization: `Bearer ${token}` },
      )
      expect(successRes.body.requestId).toBeTypeOf('string')
      expect(successRes.requestId).toBeTypeOf('string')

      // Error response (no auth)
      const errorRes = await post<ErrorResponse>(
        `/api/v1/courses/${courseId}/lessons/${lessonIds[0]}/progress`,
        {},
      )
      expect(errorRes.body.error.requestId).toBeTypeOf('string')
    })
  })
})
