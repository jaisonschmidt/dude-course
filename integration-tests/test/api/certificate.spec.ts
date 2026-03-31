/**
 * Certificate integration tests.
 *
 * Tests: POST /api/v1/courses/:id/certificate
 *   (idempotent certificate generation)
 */

import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { post } from '../../helpers/request.js'
import { setupDb, teardownDb, truncateAll, getTestPrisma } from '../../helpers/db.js'

const shouldRun = process.env['RUN_INTEGRATION_TESTS'] === 'true'
const describeOrSkip = shouldRun ? describe : describe.skip

interface CertificateResponse {
  data: {
    id: number
    certificateCode: string
    issuedAt: string
    courseName: string
    learnerName: string
  }
  requestId: string
}

interface ErrorResponse {
  error: {
    code: string
    message: string
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

async function seedCourseWithLessons(lessonCount = 2): Promise<{ courseId: number; lessonIds: number[] }> {
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

async function registerAndLogin(
  email = 'learner@example.com',
  password = 'securepassword123',
  name = 'Test Learner',
): Promise<{ token: string; userId: number }> {
  await post('/api/v1/auth/register', { name, email, password })
  const loginRes = await post<LoginResponse>('/api/v1/auth/login', { email, password })
  return {
    token: loginRes.body.data.accessToken,
    userId: loginRes.body.data.user.id,
  }
}

async function enrollUser(courseId: number, token: string): Promise<void> {
  await post(`/api/v1/courses/${courseId}/enrollments`, {}, { Authorization: `Bearer ${token}` })
}

async function completeAllLessons(courseId: number, lessonIds: number[], token: string): Promise<void> {
  for (const lessonId of lessonIds) {
    await post(`/api/v1/courses/${courseId}/lessons/${lessonId}/progress`, {}, { Authorization: `Bearer ${token}` })
  }
}

describeOrSkip('Certificate Endpoints', () => {
  beforeAll(async () => {
    await setupDb()
  })

  beforeEach(async () => {
    await truncateAll()
  })

  afterAll(async () => {
    await teardownDb()
  })

  describe('POST /api/v1/courses/:id/certificate', () => {
    it('AC-01: should return 200 with certificate for completed course', async () => {
      const { courseId, lessonIds } = await seedCourseWithLessons(2)
      const { token } = await registerAndLogin('cert@test.com', 'password123', 'Jane Doe')
      await enrollUser(courseId, token)
      await completeAllLessons(courseId, lessonIds, token)

      const res = await post<CertificateResponse>(
        `/api/v1/courses/${courseId}/certificate`,
        {},
        { Authorization: `Bearer ${token}` },
      )

      expect(res.status).toBe(200)
      expect(res.body.data.id).toBeTypeOf('number')
      expect(res.body.data.certificateCode).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      )
      expect(res.body.data.issuedAt).toBeTypeOf('string')
      expect(res.body.data.courseName).toBe('Test Course')
      expect(res.body.data.learnerName).toBe('Jane Doe')
      expect(res.body.requestId).toBeTypeOf('string')
    })

    it('AC-02: should return same certificate on repeated calls (idempotent)', async () => {
      const { courseId, lessonIds } = await seedCourseWithLessons(2)
      const { token } = await registerAndLogin()
      await enrollUser(courseId, token)
      await completeAllLessons(courseId, lessonIds, token)

      const first = await post<CertificateResponse>(
        `/api/v1/courses/${courseId}/certificate`,
        {},
        { Authorization: `Bearer ${token}` },
      )
      const second = await post<CertificateResponse>(
        `/api/v1/courses/${courseId}/certificate`,
        {},
        { Authorization: `Bearer ${token}` },
      )

      expect(first.status).toBe(200)
      expect(second.status).toBe(200)
      expect(second.body.data.id).toBe(first.body.data.id)
      expect(second.body.data.certificateCode).toBe(first.body.data.certificateCode)
    })

    it('AC-02: should not create duplicate certificates in the database', async () => {
      const { courseId, lessonIds } = await seedCourseWithLessons(1)
      const { token, userId } = await registerAndLogin()
      await enrollUser(courseId, token)
      await completeAllLessons(courseId, lessonIds, token)

      await post(`/api/v1/courses/${courseId}/certificate`, {}, { Authorization: `Bearer ${token}` })
      await post(`/api/v1/courses/${courseId}/certificate`, {}, { Authorization: `Bearer ${token}` })

      const prisma = getTestPrisma()
      const rows = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM certificates
        WHERE user_id = ${userId} AND course_id = ${courseId}
      ` as Array<{ count: bigint }>
      expect(Number(rows[0]!.count)).toBe(1)
    })

    it('AC-03: should return 403 when course is not completed', async () => {
      const { courseId, lessonIds } = await seedCourseWithLessons(3)
      const { token } = await registerAndLogin()
      await enrollUser(courseId, token)
      // Complete only 1 of 3 lessons (not all)
      await post(
        `/api/v1/courses/${courseId}/lessons/${lessonIds[0]}/progress`,
        {},
        { Authorization: `Bearer ${token}` },
      )

      const res = await post<ErrorResponse>(
        `/api/v1/courses/${courseId}/certificate`,
        {},
        { Authorization: `Bearer ${token}` },
      )

      expect(res.status).toBe(403)
      expect(res.body.error.code).toBe('FORBIDDEN')
    })

    it('AC-04: should return 404 when learner is not enrolled', async () => {
      const { courseId } = await seedCourseWithLessons(1)
      const { token } = await registerAndLogin()
      // NOT enrolling

      const res = await post<ErrorResponse>(
        `/api/v1/courses/${courseId}/certificate`,
        {},
        { Authorization: `Bearer ${token}` },
      )

      expect(res.status).toBe(404)
      expect(res.body.error.code).toBe('NOT_FOUND')
    })

    it('AC-05: should return 401 when no auth token is provided', async () => {
      const { courseId } = await seedCourseWithLessons(1)

      const res = await post<ErrorResponse>(
        `/api/v1/courses/${courseId}/certificate`,
        {},
      )

      expect(res.status).toBe(401)
      expect(res.body.error.code).toBe('UNAUTHORIZED')
    })

    it('AC-06: each certificate should have a unique certificateCode', async () => {
      // Create two courses, complete both, generate certificates
      const course1 = await seedCourseWithLessons(1)
      const course2 = await seedCourseWithLessons(1)
      const { token } = await registerAndLogin()

      await enrollUser(course1.courseId, token)
      await completeAllLessons(course1.courseId, course1.lessonIds, token)
      await enrollUser(course2.courseId, token)
      await completeAllLessons(course2.courseId, course2.lessonIds, token)

      const cert1 = await post<CertificateResponse>(
        `/api/v1/courses/${course1.courseId}/certificate`,
        {},
        { Authorization: `Bearer ${token}` },
      )
      const cert2 = await post<CertificateResponse>(
        `/api/v1/courses/${course2.courseId}/certificate`,
        {},
        { Authorization: `Bearer ${token}` },
      )

      expect(cert1.body.data.certificateCode).not.toBe(cert2.body.data.certificateCode)
    })

    it('should include requestId in all responses', async () => {
      const { courseId } = await seedCourseWithLessons(1)

      // Error response (no auth)
      const errorRes = await post<ErrorResponse>(
        `/api/v1/courses/${courseId}/certificate`,
        {},
      )
      expect(errorRes.body.error.requestId).toBeTypeOf('string')
    })
  })
})
