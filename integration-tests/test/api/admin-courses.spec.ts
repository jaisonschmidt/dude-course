/**
 * Admin CRUD Courses integration tests.
 *
 * Tests: POST /api/v1/courses, PUT /api/v1/courses/:id,
 *        PATCH /api/v1/courses/:id/publish, PATCH /api/v1/courses/:id/unpublish,
 *        DELETE /api/v1/courses/:id
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

const BASE_URL = process.env['BACKEND_URL'] ?? 'http://localhost:3001'

// ── Response type interfaces ─────────────────────────────────

interface CourseItem {
  id: number
  title: string
  description: string
  thumbnailUrl: string | null
  status: string
  createdAt: string
  updatedAt: string
}

interface CourseResponse {
  data: CourseItem
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
    headers: { 'Content-Type': 'application/json', ...headers },
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

/**
 * Register a user via API, upgrade to admin via SQL, then login.
 * Returns the admin access token and userId.
 */
async function seedAdminAndLogin(
  email = 'admin@example.com',
  password = 'adminpassword123',
): Promise<{ token: string; userId: number }> {
  // Register via API (creates a learner)
  await post('/api/v1/auth/register', {
    name: 'Admin User',
    email,
    password,
  })

  // Upgrade to admin via raw SQL
  const prisma = getTestPrisma()
  await prisma.$executeRaw`UPDATE users SET role = 'admin' WHERE email = ${email}`

  // Login to get JWT with role=admin
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
 * Register + login a learner user and return their access token.
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
 * Seed a course directly in the DB. Returns the course id.
 */
async function seedCourse(overrides: {
  title?: string
  description?: string
  thumbnailUrl?: string | null
  status?: string
} = {}): Promise<number> {
  const prisma = getTestPrisma()
  const title = overrides.title ?? 'Test Course'
  const description = overrides.description ?? 'A test course'
  const thumbnailUrl = overrides.thumbnailUrl ?? null
  const status = overrides.status ?? 'draft'

  await prisma.$executeRaw`
    INSERT INTO courses (title, description, thumbnail_url, status, created_at, updated_at)
    VALUES (${title}, ${description}, ${thumbnailUrl}, ${status}, NOW(), NOW())
  `

  const rows = await prisma.$queryRaw`SELECT LAST_INSERT_ID() as id` as Array<{ id: bigint }>
  return Number(rows[0]!.id)
}

/**
 * Seed a lesson directly in the DB. Returns the lesson id.
 */
async function seedLesson(overrides: {
  courseId: number
  title?: string
  description?: string | null
  youtubeUrl?: string
  position: number
}): Promise<number> {
  const prisma = getTestPrisma()
  const title = overrides.title ?? `Lesson ${overrides.position}`
  const description = overrides.description ?? null
  const youtubeUrl = overrides.youtubeUrl ?? 'https://youtube.com/watch?v=test'

  await prisma.$executeRaw`
    INSERT INTO lessons (course_id, title, description, youtube_url, position, created_at, updated_at)
    VALUES (${overrides.courseId}, ${title}, ${description}, ${youtubeUrl}, ${overrides.position}, NOW(), NOW())
  `

  const rows = await prisma.$queryRaw`SELECT LAST_INSERT_ID() as id` as Array<{ id: bigint }>
  return Number(rows[0]!.id)
}

// ── Tests ────────────────────────────────────────────────────

describeOrSkip('Admin CRUD Courses', () => {
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
  // POST /api/v1/courses
  // ────────────────────────────────────────
  describe('POST /api/v1/courses', () => {
    it('AC-01: should create a course with status draft and return 201', async () => {
      const { token } = await seedAdminAndLogin()

      const res = await post<CourseResponse>(
        '/api/v1/courses',
        { title: 'New Course', description: 'A brand new course' },
        { Authorization: `Bearer ${token}` },
      )

      expect(res.status).toBe(201)
      expect(res.body.data).toMatchObject({
        title: 'New Course',
        description: 'A brand new course',
        status: 'draft',
        thumbnailUrl: null,
      })
      expect(res.body.data.id).toBeTypeOf('number')
      expect(res.body.requestId).toBeTypeOf('string')
    })

    it('AC-02: should return 400 for missing title', async () => {
      const { token } = await seedAdminAndLogin()

      const res = await post<ErrorResponse>(
        '/api/v1/courses',
        { description: 'No title provided' },
        { Authorization: `Bearer ${token}` },
      )

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('AC-02: should return 400 for empty title', async () => {
      const { token } = await seedAdminAndLogin()

      const res = await post<ErrorResponse>(
        '/api/v1/courses',
        { title: '', description: 'Empty title' },
        { Authorization: `Bearer ${token}` },
      )

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('AC-03: should return 401 without auth token', async () => {
      const res = await post<ErrorResponse>('/api/v1/courses', {
        title: 'Unauthorized',
        description: 'No token',
      })

      expect(res.status).toBe(401)
      expect(res.body.error.code).toBe('UNAUTHORIZED')
    })

    it('AC-04: should return 403 for learner user', async () => {
      const { token } = await registerAndLogin()

      const res = await post<ErrorResponse>(
        '/api/v1/courses',
        { title: 'Forbidden', description: 'Learner cannot create' },
        { Authorization: `Bearer ${token}` },
      )

      expect(res.status).toBe(403)
      expect(res.body.error.code).toBe('FORBIDDEN')
    })
  })

  // ────────────────────────────────────────
  // PUT /api/v1/courses/:id
  // ────────────────────────────────────────
  describe('PUT /api/v1/courses/:id', () => {
    it('AC-05: should update course metadata and return 200', async () => {
      const { token } = await seedAdminAndLogin()
      const courseId = await seedCourse({ title: 'Old Title', description: 'Old Desc' })

      const res = await put<CourseResponse>(
        `/api/v1/courses/${courseId}`,
        { title: 'New Title', description: 'New Desc' },
        { Authorization: `Bearer ${token}` },
      )

      expect(res.status).toBe(200)
      expect(res.body.data.title).toBe('New Title')
      expect(res.body.data.description).toBe('New Desc')
      expect(res.body.requestId).toBeTypeOf('string')
    })

    it('should return 404 when course does not exist', async () => {
      const { token } = await seedAdminAndLogin()

      const res = await put<ErrorResponse>(
        '/api/v1/courses/99999',
        { title: 'Does Not Exist' },
        { Authorization: `Bearer ${token}` },
      )

      expect(res.status).toBe(404)
      expect(res.body.error.code).toBe('NOT_FOUND')
    })

    it('should return 401 without auth token', async () => {
      const courseId = await seedCourse()

      const res = await put<ErrorResponse>(
        `/api/v1/courses/${courseId}`,
        { title: 'No Auth' },
      )

      expect(res.status).toBe(401)
      expect(res.body.error.code).toBe('UNAUTHORIZED')
    })

    it('should return 403 for learner user', async () => {
      const { token } = await registerAndLogin()
      const courseId = await seedCourse()

      const res = await put<ErrorResponse>(
        `/api/v1/courses/${courseId}`,
        { title: 'Forbidden' },
        { Authorization: `Bearer ${token}` },
      )

      expect(res.status).toBe(403)
      expect(res.body.error.code).toBe('FORBIDDEN')
    })
  })

  // ────────────────────────────────────────
  // PATCH /api/v1/courses/:id/publish
  // ────────────────────────────────────────
  describe('PATCH /api/v1/courses/:id/publish', () => {
    it('AC-05: should publish course when prerequisites are met', async () => {
      const { token } = await seedAdminAndLogin()
      const courseId = await seedCourse({ title: 'Publishable', description: 'Has desc', status: 'draft' })
      await seedLesson({ courseId, position: 1 })

      const res = await patch<CourseResponse>(
        `/api/v1/courses/${courseId}/publish`,
        {},
        { Authorization: `Bearer ${token}` },
      )

      expect(res.status).toBe(200)
      expect(res.body.data.status).toBe('published')
      expect(res.body.requestId).toBeTypeOf('string')
    })

    it('AC-06: should return 400 when course has no lessons', async () => {
      const { token } = await seedAdminAndLogin()
      const courseId = await seedCourse({ title: 'No Lessons', description: 'Has desc', status: 'draft' })

      const res = await patch<ErrorResponse>(
        `/api/v1/courses/${courseId}/publish`,
        {},
        { Authorization: `Bearer ${token}` },
      )

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('VALIDATION_ERROR')
      expect(res.body.error.message).toContain('Cannot publish course')
    })

    it('should return 404 when course does not exist', async () => {
      const { token } = await seedAdminAndLogin()

      const res = await patch<ErrorResponse>(
        '/api/v1/courses/99999/publish',
        {},
        { Authorization: `Bearer ${token}` },
      )

      expect(res.status).toBe(404)
      expect(res.body.error.code).toBe('NOT_FOUND')
    })

    it('should return 401 without auth token', async () => {
      const courseId = await seedCourse()

      const res = await patch<ErrorResponse>(`/api/v1/courses/${courseId}/publish`)

      expect(res.status).toBe(401)
    })

    it('should return 403 for learner user', async () => {
      const { token } = await registerAndLogin()
      const courseId = await seedCourse()

      const res = await patch<ErrorResponse>(
        `/api/v1/courses/${courseId}/publish`,
        {},
        { Authorization: `Bearer ${token}` },
      )

      expect(res.status).toBe(403)
    })
  })

  // ────────────────────────────────────────
  // PATCH /api/v1/courses/:id/unpublish
  // ────────────────────────────────────────
  describe('PATCH /api/v1/courses/:id/unpublish', () => {
    it('AC-07: should unpublish course and return 200', async () => {
      const { token } = await seedAdminAndLogin()
      const courseId = await seedCourse({ title: 'Published', description: 'Desc', status: 'published' })

      const res = await patch<CourseResponse>(
        `/api/v1/courses/${courseId}/unpublish`,
        {},
        { Authorization: `Bearer ${token}` },
      )

      expect(res.status).toBe(200)
      expect(res.body.data.status).toBe('unpublished')
      expect(res.body.requestId).toBeTypeOf('string')
    })

    it('should return 404 when course does not exist', async () => {
      const { token } = await seedAdminAndLogin()

      const res = await patch<ErrorResponse>(
        '/api/v1/courses/99999/unpublish',
        {},
        { Authorization: `Bearer ${token}` },
      )

      expect(res.status).toBe(404)
      expect(res.body.error.code).toBe('NOT_FOUND')
    })

    it('should return 401 without auth token', async () => {
      const courseId = await seedCourse()

      const res = await patch<ErrorResponse>(`/api/v1/courses/${courseId}/unpublish`)

      expect(res.status).toBe(401)
    })

    it('should return 403 for learner user', async () => {
      const { token } = await registerAndLogin()
      const courseId = await seedCourse()

      const res = await patch<ErrorResponse>(
        `/api/v1/courses/${courseId}/unpublish`,
        {},
        { Authorization: `Bearer ${token}` },
      )

      expect(res.status).toBe(403)
    })
  })

  // ────────────────────────────────────────
  // DELETE /api/v1/courses/:id
  // ────────────────────────────────────────
  describe('DELETE /api/v1/courses/:id', () => {
    it('AC-08: should delete course and return 204', async () => {
      const { token } = await seedAdminAndLogin()
      const courseId = await seedCourse({ title: 'To Delete' })

      const res = await del(`/api/v1/courses/${courseId}`, {
        Authorization: `Bearer ${token}`,
      })

      expect(res.status).toBe(204)

      // Verify course no longer exists in DB
      const prisma = getTestPrisma()
      const rows = await prisma.$queryRaw`SELECT id FROM courses WHERE id = ${courseId}` as Array<{ id: number }>
      expect(rows).toHaveLength(0)
    })

    it('should return 404 when course does not exist', async () => {
      const { token } = await seedAdminAndLogin()

      const res = await del<ErrorResponse>('/api/v1/courses/99999', {
        Authorization: `Bearer ${token}`,
      })

      expect(res.status).toBe(404)
      expect(res.body.error.code).toBe('NOT_FOUND')
    })

    it('should return 401 without auth token', async () => {
      const courseId = await seedCourse()

      const res = await del<ErrorResponse>(`/api/v1/courses/${courseId}`)

      expect(res.status).toBe(401)
    })

    it('should return 403 for learner user', async () => {
      const { token } = await registerAndLogin()
      const courseId = await seedCourse()

      const res = await del<ErrorResponse>(`/api/v1/courses/${courseId}`, {
        Authorization: `Bearer ${token}`,
      })

      expect(res.status).toBe(403)
    })
  })
})
