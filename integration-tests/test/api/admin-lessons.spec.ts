/**
 * Admin CRUD Lessons integration tests.
 *
 * Tests: POST /api/v1/courses/:id/lessons,
 *        PUT /api/v1/courses/:id/lessons/:lessonId,
 *        DELETE /api/v1/courses/:id/lessons/:lessonId,
 *        PATCH /api/v1/courses/:id/lessons/reorder
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

const BASE_URL = process.env['BACKEND_URL'] ?? 'http://localhost:3001'

// ── Response type interfaces ─────────────────────────────────

interface LessonItem {
  id: number
  courseId: number
  title: string
  description: string | null
  youtubeUrl: string
  position: number
  createdAt: string
  updatedAt: string
}

interface LessonResponse {
  data: LessonItem
  requestId: string
}

interface ReorderItem {
  id: number
  courseId: number
  title: string
  position: number
}

interface ReorderResponse {
  data: ReorderItem[]
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

// ── HTTP helpers for PUT, PATCH, DELETE ───────────────────────

interface TestResponse<T = unknown> {
  status: number
  body: T
  requestId: string | null
  headers: Headers
}

async function put<T = unknown>(
  path: string,
  data: unknown,
  headers: Record<string, string> = {},
): Promise<TestResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(data),
  })
  let body: T
  if (res.status === 204) {
    body = undefined as unknown as T
  } else {
    body = (await res.json()) as T
  }
  return {
    status: res.status,
    body,
    requestId: res.headers.get('x-request-id'),
    headers: res.headers,
  }
}

async function patch<T = unknown>(
  path: string,
  data: unknown = {},
  headers: Record<string, string> = {},
): Promise<TestResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(data),
  })
  let body: T
  if (res.status === 204) {
    body = undefined as unknown as T
  } else {
    body = (await res.json()) as T
  }
  return {
    status: res.status,
    body,
    requestId: res.headers.get('x-request-id'),
    headers: res.headers,
  }
}

async function del<T = unknown>(
  path: string,
  headers: Record<string, string> = {},
): Promise<TestResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: { ...headers },
  })
  let body: T
  if (res.status === 204) {
    body = undefined as unknown as T
  } else {
    body = (await res.json()) as T
  }
  return {
    status: res.status,
    body,
    requestId: res.headers.get('x-request-id'),
    headers: res.headers,
  }
}

// ── Seed helpers ─────────────────────────────────────────────

async function seedAdminAndLogin(
  email = 'admin@example.com',
  password = 'adminpassword123',
): Promise<{ token: string; userId: number }> {
  await post('/api/v1/auth/register', {
    name: 'Admin User',
    email,
    password,
  })

  const prisma = getTestPrisma()
  await prisma.$executeRaw`UPDATE users SET role = 'admin' WHERE email = ${email}`

  const loginRes = await post<LoginResponse>('/api/v1/auth/login', {
    email,
    password,
  })

  return {
    token: loginRes.body.data.accessToken,
    userId: loginRes.body.data.user.id,
  }
}

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
 * Create a course via admin API. Returns the course id.
 */
async function createCourseViaApi(
  token: string,
  overrides: { title?: string; description?: string } = {},
): Promise<number> {
  const res = await post<{ data: { id: number } }>(
    '/api/v1/courses',
    {
      title: overrides.title ?? 'Test Course',
      description: overrides.description ?? 'A test course description',
    },
    { Authorization: `Bearer ${token}` },
  )
  return res.body.data.id
}

/**
 * Create a lesson via admin API. Returns the full lesson response.
 */
async function createLessonViaApi(
  token: string,
  courseId: number,
  overrides: {
    title?: string
    description?: string
    youtubeUrl?: string
    position?: number
  } = {},
): Promise<LessonItem> {
  const res = await post<LessonResponse>(
    `/api/v1/courses/${courseId}/lessons`,
    {
      title: overrides.title ?? 'Test Lesson',
      youtubeUrl: overrides.youtubeUrl ?? 'https://youtube.com/watch?v=abc123',
      position: overrides.position ?? 1,
      ...(overrides.description !== undefined && { description: overrides.description }),
    },
    { Authorization: `Bearer ${token}` },
  )
  return res.body.data
}

// ── Tests ────────────────────────────────────────────────────

describeOrSkip('Admin Lesson CRUD', () => {
  let adminToken: string

  beforeAll(async () => {
    await setupDb()
  })

  afterAll(async () => {
    await teardownDb()
  })

  beforeEach(async () => {
    await truncateAll()
    const admin = await seedAdminAndLogin()
    adminToken = admin.token
  })

  // ── AC-01: Create lesson ──────────────────────────────────

  describe('POST /api/v1/courses/:id/lessons', () => {
    it('AC-01: should create a lesson successfully (201)', async () => {
      const courseId = await createCourseViaApi(adminToken)

      const res = await post<LessonResponse>(
        `/api/v1/courses/${courseId}/lessons`,
        {
          title: 'Introduction to Node.js',
          description: 'Getting started',
          youtubeUrl: 'https://youtube.com/watch?v=abc123',
          position: 1,
        },
        { Authorization: `Bearer ${adminToken}` },
      )

      expect(res.status).toBe(201)
      expect(res.body.data).toMatchObject({
        courseId,
        title: 'Introduction to Node.js',
        description: 'Getting started',
        youtubeUrl: 'https://youtube.com/watch?v=abc123',
        position: 1,
      })
      expect(res.body.data.id).toBeGreaterThan(0)
      expect(res.body.requestId).toBeTruthy()
    })

    it('should create lesson without optional description', async () => {
      const courseId = await createCourseViaApi(adminToken)

      const res = await post<LessonResponse>(
        `/api/v1/courses/${courseId}/lessons`,
        {
          title: 'Lesson No Desc',
          youtubeUrl: 'https://youtube.com/watch?v=xyz789',
          position: 1,
        },
        { Authorization: `Bearer ${adminToken}` },
      )

      expect(res.status).toBe(201)
      expect(res.body.data.description).toBeNull()
    })

    it('should return 404 when course does not exist', async () => {
      const res = await post<ErrorResponse>(
        '/api/v1/courses/99999/lessons',
        {
          title: 'Lesson',
          youtubeUrl: 'https://youtube.com/watch?v=abc',
          position: 1,
        },
        { Authorization: `Bearer ${adminToken}` },
      )

      expect(res.status).toBe(404)
      expect(res.body.error.code).toBe('NOT_FOUND')
    })
  })

  // ── AC-02: YouTube URL validation ─────────────────────────

  describe('YouTube URL validation (AC-02)', () => {
    it('should return 400 for invalid YouTube URL on create', async () => {
      const courseId = await createCourseViaApi(adminToken)

      const res = await post<ErrorResponse>(
        `/api/v1/courses/${courseId}/lessons`,
        {
          title: 'Bad URL Lesson',
          youtubeUrl: 'https://notayoutube.com/video',
          position: 1,
        },
        { Authorization: `Bearer ${adminToken}` },
      )

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('should return 400 for invalid YouTube URL on update', async () => {
      const courseId = await createCourseViaApi(adminToken)
      const lesson = await createLessonViaApi(adminToken, courseId)

      const res = await put<ErrorResponse>(
        `/api/v1/courses/${courseId}/lessons/${lesson.id}`,
        { youtubeUrl: 'https://vimeo.com/12345' },
        { Authorization: `Bearer ${adminToken}` },
      )

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('VALIDATION_ERROR')
    })
  })

  // ── AC-03: Duplicate position ─────────────────────────────

  describe('Duplicate position (AC-03)', () => {
    it('should return 409 when position is already taken', async () => {
      const courseId = await createCourseViaApi(adminToken)
      await createLessonViaApi(adminToken, courseId, { position: 1 })

      const res = await post<ErrorResponse>(
        `/api/v1/courses/${courseId}/lessons`,
        {
          title: 'Duplicate Position',
          youtubeUrl: 'https://youtube.com/watch?v=dup',
          position: 1,
        },
        { Authorization: `Bearer ${adminToken}` },
      )

      expect(res.status).toBe(409)
      expect(res.body.error.code).toBe('CONFLICT')
    })
  })

  // ── AC-04: Update lesson ──────────────────────────────────

  describe('PUT /api/v1/courses/:id/lessons/:lessonId (AC-04)', () => {
    it('should update lesson title', async () => {
      const courseId = await createCourseViaApi(adminToken)
      const lesson = await createLessonViaApi(adminToken, courseId)

      const res = await put<LessonResponse>(
        `/api/v1/courses/${courseId}/lessons/${lesson.id}`,
        { title: 'Updated Title' },
        { Authorization: `Bearer ${adminToken}` },
      )

      expect(res.status).toBe(200)
      expect(res.body.data.title).toBe('Updated Title')
    })

    it('should update youtube URL', async () => {
      const courseId = await createCourseViaApi(adminToken)
      const lesson = await createLessonViaApi(adminToken, courseId)

      const res = await put<LessonResponse>(
        `/api/v1/courses/${courseId}/lessons/${lesson.id}`,
        { youtubeUrl: 'https://youtu.be/newvideo' },
        { Authorization: `Bearer ${adminToken}` },
      )

      expect(res.status).toBe(200)
      expect(res.body.data.youtubeUrl).toBe('https://youtu.be/newvideo')
    })

    it('should return 404 when lesson does not exist', async () => {
      const courseId = await createCourseViaApi(adminToken)

      const res = await put<ErrorResponse>(
        `/api/v1/courses/${courseId}/lessons/99999`,
        { title: 'X' },
        { Authorization: `Bearer ${adminToken}` },
      )

      expect(res.status).toBe(404)
    })
  })

  // ── AC-05: Delete lesson ──────────────────────────────────

  describe('DELETE /api/v1/courses/:id/lessons/:lessonId (AC-05)', () => {
    it('should delete lesson successfully (204)', async () => {
      const courseId = await createCourseViaApi(adminToken)
      const lesson = await createLessonViaApi(adminToken, courseId)

      const res = await del(
        `/api/v1/courses/${courseId}/lessons/${lesson.id}`,
        { Authorization: `Bearer ${adminToken}` },
      )

      expect(res.status).toBe(204)
    })

    it('should return 404 when lesson does not exist', async () => {
      const courseId = await createCourseViaApi(adminToken)

      const res = await del<ErrorResponse>(
        `/api/v1/courses/${courseId}/lessons/99999`,
        { Authorization: `Bearer ${adminToken}` },
      )

      expect(res.status).toBe(404)
    })
  })

  // ── AC-06: Reorder lessons ────────────────────────────────

  describe('PATCH /api/v1/courses/:id/lessons/reorder (AC-06)', () => {
    it('should reorder lessons atomically', async () => {
      const courseId = await createCourseViaApi(adminToken)
      const lesson1 = await createLessonViaApi(adminToken, courseId, {
        title: 'Lesson A',
        position: 1,
      })
      const lesson2 = await createLessonViaApi(adminToken, courseId, {
        title: 'Lesson B',
        position: 2,
      })

      const res = await patch<ReorderResponse>(
        `/api/v1/courses/${courseId}/lessons/reorder`,
        {
          lessons: [
            { lessonId: lesson2.id, position: 1 },
            { lessonId: lesson1.id, position: 2 },
          ],
        },
        { Authorization: `Bearer ${adminToken}` },
      )

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(2)
      // Lessons come back ordered by position
      expect(res.body.data[0].id).toBe(lesson2.id)
      expect(res.body.data[0].position).toBe(1)
      expect(res.body.data[1].id).toBe(lesson1.id)
      expect(res.body.data[1].position).toBe(2)
    })

    it('should return 400 for empty lessons array', async () => {
      const courseId = await createCourseViaApi(adminToken)

      const res = await patch<ErrorResponse>(
        `/api/v1/courses/${courseId}/lessons/reorder`,
        { lessons: [] },
        { Authorization: `Bearer ${adminToken}` },
      )

      expect(res.status).toBe(400)
    })

    it('should return 404 when lesson does not belong to course', async () => {
      const courseId = await createCourseViaApi(adminToken)
      await createLessonViaApi(adminToken, courseId, { position: 1 })

      const res = await patch<ErrorResponse>(
        `/api/v1/courses/${courseId}/lessons/reorder`,
        {
          lessons: [{ lessonId: 99999, position: 1 }],
        },
        { Authorization: `Bearer ${adminToken}` },
      )

      expect(res.status).toBe(404)
    })
  })

  // ── AC-07: Lesson not in course ───────────────────────────

  describe('Lesson not in course (AC-07)', () => {
    it('should return 404 when lesson belongs to a different course', async () => {
      const courseId1 = await createCourseViaApi(adminToken, { title: 'Course 1' })
      const courseId2 = await createCourseViaApi(adminToken, { title: 'Course 2' })
      const lesson = await createLessonViaApi(adminToken, courseId1)

      // Try to update lesson from course 1 via course 2 URL
      const res = await put<ErrorResponse>(
        `/api/v1/courses/${courseId2}/lessons/${lesson.id}`,
        { title: 'Sneaky Update' },
        { Authorization: `Bearer ${adminToken}` },
      )

      expect(res.status).toBe(404)
      expect(res.body.error.code).toBe('NOT_FOUND')
    })

    it('should return 404 when deleting lesson from wrong course', async () => {
      const courseId1 = await createCourseViaApi(adminToken, { title: 'Course A' })
      const courseId2 = await createCourseViaApi(adminToken, { title: 'Course B' })
      const lesson = await createLessonViaApi(adminToken, courseId1)

      const res = await del<ErrorResponse>(
        `/api/v1/courses/${courseId2}/lessons/${lesson.id}`,
        { Authorization: `Bearer ${adminToken}` },
      )

      expect(res.status).toBe(404)
    })
  })

  // ── AC-08: Admin protection ───────────────────────────────

  describe('Admin protection (AC-08)', () => {
    it('should return 403 for learner trying to create lesson', async () => {
      const courseId = await createCourseViaApi(adminToken)
      const learner = await registerAndLogin()

      const res = await post<ErrorResponse>(
        `/api/v1/courses/${courseId}/lessons`,
        {
          title: 'Unauthorized',
          youtubeUrl: 'https://youtube.com/watch?v=hack',
          position: 1,
        },
        { Authorization: `Bearer ${learner.token}` },
      )

      expect(res.status).toBe(403)
      expect(res.body.error.code).toBe('FORBIDDEN')
    })

    it('should return 401 when no token provided', async () => {
      const courseId = await createCourseViaApi(adminToken)

      const res = await post<ErrorResponse>(
        `/api/v1/courses/${courseId}/lessons`,
        {
          title: 'No Auth',
          youtubeUrl: 'https://youtube.com/watch?v=noauth',
          position: 1,
        },
      )

      expect(res.status).toBe(401)
    })
  })
})
