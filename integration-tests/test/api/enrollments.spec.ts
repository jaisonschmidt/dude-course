/**
 * Enrollment integration tests.
 *
 * Tests: POST /api/v1/courses/:id/enrollments (idempotent enrollment)
 *
 * Requires:
 *   - A running backend instance (BACKEND_URL, default: http://localhost:3001)
 *   - A clean test database
 *   - RUN_INTEGRATION_TESTS=true
 */

import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { post, get } from '../../helpers/request.js'
import { setupDb, teardownDb, truncateAll, getTestPrisma } from '../../helpers/db.js'

const shouldRun = process.env['RUN_INTEGRATION_TESTS'] === 'true'
const describeOrSkip = shouldRun ? describe : describe.skip

interface EnrollmentResponse {
  data: {
    id: number
    userId: number
    courseId: number
    startedAt: string
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
 * Seed a course directly in the DB. Returns the course id.
 */
async function seedCourse(overrides: {
  title?: string
  description?: string
  status?: string
} = {}): Promise<number> {
  const prisma = getTestPrisma()
  const title = overrides.title ?? 'Test Course'
  const description = overrides.description ?? 'A test course'
  const status = overrides.status ?? 'published'

  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      INSERT INTO courses (title, description, status, created_at, updated_at)
      VALUES (${title}, ${description}, ${status}, NOW(), NOW())
    `
    const rows = await tx.$queryRaw`SELECT LAST_INSERT_ID() as id` as Array<{ id: bigint }>
    return Number(rows[0]!.id)
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

describeOrSkip('Enrollment Endpoints', () => {
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
  // POST /api/v1/courses/:id/enrollments
  // ────────────────────────────────────────
  describe('POST /api/v1/courses/:id/enrollments', () => {
    it('AC-01: should return 201 with enrollment data for new enrollment', async () => {
      const courseId = await seedCourse({ title: 'Published Course', status: 'published' })
      const { token, userId } = await registerAndLogin()

      const res = await post<EnrollmentResponse>(
        `/api/v1/courses/${courseId}/enrollments`,
        {},
        { Authorization: `Bearer ${token}` },
      )

      expect(res.status).toBe(201)
      expect(res.body.data).toMatchObject({
        userId,
        courseId,
      })
      expect(res.body.data.id).toBeTypeOf('number')
      expect(res.body.data.startedAt).toBeTypeOf('string')
      expect(res.body.requestId).toBeTypeOf('string')
    })

    it('AC-02: should return 200 with existing enrollment when already enrolled (idempotent)', async () => {
      const courseId = await seedCourse({ title: 'Published Course', status: 'published' })
      const { token } = await registerAndLogin()

      // First enrollment → 201
      const first = await post<EnrollmentResponse>(
        `/api/v1/courses/${courseId}/enrollments`,
        {},
        { Authorization: `Bearer ${token}` },
      )
      expect(first.status).toBe(201)

      // Second enrollment → 200 (idempotent, same data)
      const second = await post<EnrollmentResponse>(
        `/api/v1/courses/${courseId}/enrollments`,
        {},
        { Authorization: `Bearer ${token}` },
      )
      expect(second.status).toBe(200)
      expect(second.body.data.id).toBe(first.body.data.id)
      expect(second.body.data.userId).toBe(first.body.data.userId)
      expect(second.body.data.courseId).toBe(first.body.data.courseId)
      expect(second.body.requestId).toBeTypeOf('string')
    })

    it('AC-02: should not create duplicate enrollment in the database', async () => {
      const courseId = await seedCourse({ title: 'Published Course', status: 'published' })
      const { token, userId } = await registerAndLogin()

      // Enroll twice
      await post(`/api/v1/courses/${courseId}/enrollments`, {}, { Authorization: `Bearer ${token}` })
      await post(`/api/v1/courses/${courseId}/enrollments`, {}, { Authorization: `Bearer ${token}` })

      // Verify only one enrollment exists in DB
      const prisma = getTestPrisma()
      const rows = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM enrollments WHERE user_id = ${userId} AND course_id = ${courseId}
      ` as Array<{ count: bigint }>
      expect(Number(rows[0]!.count)).toBe(1)
    })

    it('AC-03: should return 404 when course does not exist', async () => {
      const { token } = await registerAndLogin()

      const res = await post<ErrorResponse>(
        '/api/v1/courses/99999/enrollments',
        {},
        { Authorization: `Bearer ${token}` },
      )

      expect(res.status).toBe(404)
      expect(res.body.error.code).toBe('NOT_FOUND')
      expect(res.body.error.requestId).toBeTypeOf('string')
    })

    it('AC-03: should return 404 when course is draft (not published)', async () => {
      const courseId = await seedCourse({ title: 'Draft Course', status: 'draft' })
      const { token } = await registerAndLogin()

      const res = await post<ErrorResponse>(
        `/api/v1/courses/${courseId}/enrollments`,
        {},
        { Authorization: `Bearer ${token}` },
      )

      expect(res.status).toBe(404)
      expect(res.body.error.code).toBe('NOT_FOUND')
    })

    it('AC-03: should return 404 when course is unpublished', async () => {
      const courseId = await seedCourse({ title: 'Unpublished', status: 'unpublished' })
      const { token } = await registerAndLogin()

      const res = await post<ErrorResponse>(
        `/api/v1/courses/${courseId}/enrollments`,
        {},
        { Authorization: `Bearer ${token}` },
      )

      expect(res.status).toBe(404)
      expect(res.body.error.code).toBe('NOT_FOUND')
    })

    it('AC-04: should return 401 when no auth token is provided', async () => {
      const courseId = await seedCourse({ status: 'published' })

      const res = await post<ErrorResponse>(
        `/api/v1/courses/${courseId}/enrollments`,
        {},
      )

      expect(res.status).toBe(401)
      expect(res.body.error.code).toBe('UNAUTHORIZED')
      expect(res.body.error.requestId).toBeTypeOf('string')
    })

    it('AC-04: should return 401 when auth token is invalid', async () => {
      const courseId = await seedCourse({ status: 'published' })

      const res = await post<ErrorResponse>(
        `/api/v1/courses/${courseId}/enrollments`,
        {},
        { Authorization: 'Bearer invalid-token-here' },
      )

      expect(res.status).toBe(401)
      expect(res.body.error.code).toBe('UNAUTHORIZED')
    })

    it('AC-05: should return 400 for non-numeric course id', async () => {
      const { token } = await registerAndLogin()

      const res = await post<ErrorResponse>(
        '/api/v1/courses/abc/enrollments',
        {},
        { Authorization: `Bearer ${token}` },
      )

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('VALIDATION_ERROR')
      expect(res.body.error.requestId).toBeTypeOf('string')
    })

    it('should include requestId in all responses', async () => {
      const courseId = await seedCourse({ status: 'published' })
      const { token } = await registerAndLogin()

      // Success response
      const successRes = await post<EnrollmentResponse>(
        `/api/v1/courses/${courseId}/enrollments`,
        {},
        { Authorization: `Bearer ${token}` },
      )
      expect(successRes.body.requestId).toBeTypeOf('string')
      expect(successRes.requestId).toBeTypeOf('string')

      // Error response (no auth)
      const errorRes = await post<ErrorResponse>(
        `/api/v1/courses/${courseId}/enrollments`,
        {},
      )
      expect(errorRes.body.error.requestId).toBeTypeOf('string')
      expect(errorRes.requestId).toBeTypeOf('string')
    })
  })
})
