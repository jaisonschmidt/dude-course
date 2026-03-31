/**
 * Dashboard integration tests.
 *
 * Tests: GET /api/v1/me/dashboard
 */

import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { get, post } from '../../helpers/request.js'
import { setupDb, teardownDb, truncateAll, getTestPrisma } from '../../helpers/db.js'

const shouldRun = process.env['RUN_INTEGRATION_TESTS'] === 'true'
const describeOrSkip = shouldRun ? describe : describe.skip

interface DashboardResponse {
  data: {
    inProgress: Array<{
      courseId: number
      title: string
      thumbnailUrl: string | null
      progress: { completed: number; total: number; percentage: number }
    }>
    completed: Array<{
      courseId: number
      title: string
      completedAt: string
    }>
    certificates: Array<{
      courseId: number
      title: string
      certificateCode: string
      issuedAt: string
    }>
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

async function seedCourseWithLessons(
  title = 'Test Course',
  lessonCount = 2,
): Promise<{ courseId: number; lessonIds: number[] }> {
  const prisma = getTestPrisma()

  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      INSERT INTO courses (title, description, status, created_at, updated_at)
      VALUES (${title}, 'A test course', 'published', NOW(), NOW())
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
): Promise<{ token: string; userId: number }> {
  await post('/api/v1/auth/register', { name: 'Test Learner', email, password })
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
    await post(
      `/api/v1/courses/${courseId}/lessons/${lessonId}/progress`,
      {},
      { Authorization: `Bearer ${token}` },
    )
  }
}

describeOrSkip('Dashboard Endpoints', () => {
  beforeAll(async () => {
    await setupDb()
  })

  beforeEach(async () => {
    await truncateAll()
  })

  afterAll(async () => {
    await teardownDb()
  })

  describe('GET /api/v1/me/dashboard', () => {
    it('AC-01: should return in-progress courses with progress stats', async () => {
      const { courseId, lessonIds } = await seedCourseWithLessons('Node.js Fundamentals', 3)
      const { token } = await registerAndLogin()
      await enrollUser(courseId, token)

      // Complete 1 of 3 lessons
      await post(
        `/api/v1/courses/${courseId}/lessons/${lessonIds[0]}/progress`,
        {},
        { Authorization: `Bearer ${token}` },
      )

      const res = await get<DashboardResponse>(
        '/api/v1/me/dashboard',
        { Authorization: `Bearer ${token}` },
      )

      expect(res.status).toBe(200)
      expect(res.body.data.inProgress).toHaveLength(1)
      expect(res.body.data.inProgress[0]).toMatchObject({
        courseId,
        title: 'Node.js Fundamentals',
        progress: { completed: 1, total: 3, percentage: 33 },
      })
    })

    it('AC-02: should return completed courses with completedAt', async () => {
      const { courseId, lessonIds } = await seedCourseWithLessons('TypeScript Mastery', 2)
      const { token } = await registerAndLogin()
      await enrollUser(courseId, token)
      await completeAllLessons(courseId, lessonIds, token)

      const res = await get<DashboardResponse>(
        '/api/v1/me/dashboard',
        { Authorization: `Bearer ${token}` },
      )

      expect(res.status).toBe(200)
      expect(res.body.data.completed).toHaveLength(1)
      expect(res.body.data.completed[0]!.courseId).toBe(courseId)
      expect(res.body.data.completed[0]!.title).toBe('TypeScript Mastery')
      expect(res.body.data.completed[0]!.completedAt).toBeTypeOf('string')
      expect(res.body.data.inProgress).toHaveLength(0)
    })

    it('AC-03: should return certificates for completed courses', async () => {
      const { courseId, lessonIds } = await seedCourseWithLessons('Cert Course', 1)
      const { token } = await registerAndLogin()
      await enrollUser(courseId, token)
      await completeAllLessons(courseId, lessonIds, token)

      // Generate certificate
      await post(
        `/api/v1/courses/${courseId}/certificate`,
        {},
        { Authorization: `Bearer ${token}` },
      )

      const res = await get<DashboardResponse>(
        '/api/v1/me/dashboard',
        { Authorization: `Bearer ${token}` },
      )

      expect(res.status).toBe(200)
      expect(res.body.data.certificates).toHaveLength(1)
      expect(res.body.data.certificates[0]!.courseId).toBe(courseId)
      expect(res.body.data.certificates[0]!.certificateCode).toBeTypeOf('string')
      expect(res.body.data.certificates[0]!.issuedAt).toBeTypeOf('string')
    })

    it('AC-04: should return empty lists when learner has no enrollments', async () => {
      const { token } = await registerAndLogin()

      const res = await get<DashboardResponse>(
        '/api/v1/me/dashboard',
        { Authorization: `Bearer ${token}` },
      )

      expect(res.status).toBe(200)
      expect(res.body.data).toEqual({
        inProgress: [],
        completed: [],
        certificates: [],
      })
    })

    it('AC-05: should return 401 when no auth token is provided', async () => {
      const res = await get<ErrorResponse>('/api/v1/me/dashboard')

      expect(res.status).toBe(401)
      expect(res.body.error.code).toBe('UNAUTHORIZED')
    })

    it('should include requestId in response', async () => {
      const { token } = await registerAndLogin()

      const res = await get<DashboardResponse>(
        '/api/v1/me/dashboard',
        { Authorization: `Bearer ${token}` },
      )

      expect(res.body.requestId).toBeTypeOf('string')
    })
  })
})
