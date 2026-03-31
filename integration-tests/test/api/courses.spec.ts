/**
 * Course catalog integration tests.
 *
 * Tests: GET /api/v1/courses (list) and GET /api/v1/courses/:id (detail)
 *
 * Requires:
 *   - A running backend instance (BACKEND_URL, default: http://localhost:3001)
 *   - A clean test database
 *   - RUN_INTEGRATION_TESTS=true
 */

import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { get } from '../../helpers/request.js'
import { setupDb, teardownDb, truncateAll, getTestPrisma } from '../../helpers/db.js'

const shouldRun = process.env['RUN_INTEGRATION_TESTS'] === 'true'
const describeOrSkip = shouldRun ? describe : describe.skip

interface CourseItem {
  id: number
  title: string
  description: string
  thumbnailUrl: string | null
  status: string
  createdAt: string
  updatedAt: string
}

interface PaginationMeta {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

interface CoursesListResponse {
  data: CourseItem[]
  meta: PaginationMeta
  requestId: string
}

interface LessonItem {
  id: number
  title: string
  description: string | null
  youtubeUrl: string
  position: number
}

interface CourseDetailResponse {
  data: CourseItem & { lessons: LessonItem[] }
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
  const status = overrides.status ?? 'published'

  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      INSERT INTO courses (title, description, thumbnail_url, status, created_at, updated_at)
      VALUES (${title}, ${description}, ${thumbnailUrl}, ${status}, NOW(), NOW())
    `
    const rows = await tx.$queryRaw`SELECT LAST_INSERT_ID() as id` as Array<{ id: bigint }>
    return Number(rows[0]!.id)
  })
}

/**
 * Seed a lesson directly in the DB.
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

  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      INSERT INTO lessons (course_id, title, description, youtube_url, position, created_at, updated_at)
      VALUES (${overrides.courseId}, ${title}, ${description}, ${youtubeUrl}, ${overrides.position}, NOW(), NOW())
    `
    const rows = await tx.$queryRaw`SELECT LAST_INSERT_ID() as id` as Array<{ id: bigint }>
    return Number(rows[0]!.id)
  })
}

describeOrSkip('Course Catalog Endpoints', () => {
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
  // GET /api/v1/courses
  // ────────────────────────────────────────
  describe('GET /api/v1/courses', () => {
    it('AC-01: should return 200 with only published courses', async () => {
      // Seed: 2 published + 1 draft
      await seedCourse({ title: 'Published 1', status: 'published' })
      await seedCourse({ title: 'Published 2', status: 'published' })
      await seedCourse({ title: 'Draft Course', status: 'draft' })

      const res = await get<CoursesListResponse>('/api/v1/courses')

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(2)
      expect(res.body.data.every((c) => c.status === 'published')).toBe(true)
      expect(res.body.meta).toEqual({
        page: 1,
        pageSize: 20,
        totalItems: 2,
        totalPages: 1,
      })
      expect(res.body.requestId).toBeTypeOf('string')
    })

    it('AC-02: should paginate correctly with page and pageSize', async () => {
      // Seed 7 published courses
      for (let i = 1; i <= 7; i++) {
        await seedCourse({ title: `Course ${i}`, status: 'published' })
      }

      const res = await get<CoursesListResponse>('/api/v1/courses?page=2&pageSize=5')

      expect(res.status).toBe(200)
      expect(res.body.data.length).toBeLessThanOrEqual(5)
      expect(res.body.data.length).toBe(2) // 7 total, page 2 of 5 = 2 items
      expect(res.body.meta).toEqual({
        page: 2,
        pageSize: 5,
        totalItems: 7,
        totalPages: 2,
      })
    })

    it('AC-03: should default to page=1 and pageSize=20', async () => {
      await seedCourse({ title: 'Single Course', status: 'published' })

      const res = await get<CoursesListResponse>('/api/v1/courses')

      expect(res.status).toBe(200)
      expect(res.body.meta.page).toBe(1)
      expect(res.body.meta.pageSize).toBe(20)
    })

    it('should return empty data when no published courses exist', async () => {
      await seedCourse({ status: 'draft' })

      const res = await get<CoursesListResponse>('/api/v1/courses')

      expect(res.status).toBe(200)
      expect(res.body.data).toEqual([])
      expect(res.body.meta.totalItems).toBe(0)
      expect(res.body.meta.totalPages).toBe(0)
    })

    it('AC-06: should return 400 when pageSize > 100', async () => {
      const res = await get<ErrorResponse>('/api/v1/courses?pageSize=101')

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('AC-06: should return 400 when page is not a positive integer', async () => {
      const res = await get<ErrorResponse>('/api/v1/courses?page=0')

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('should include requestId in successful response', async () => {
      const res = await get<CoursesListResponse>('/api/v1/courses')

      expect(res.status).toBe(200)
      expect(res.body.requestId).toBeTypeOf('string')
      expect(res.requestId).toBeTypeOf('string')
    })
  })

  // ────────────────────────────────────────
  // GET /api/v1/courses/:id
  // ────────────────────────────────────────
  describe('GET /api/v1/courses/:id', () => {
    it('AC-04: should return 200 with course and lessons ordered by position', async () => {
      const courseId = await seedCourse({ title: 'Node.js Basics', status: 'published' })
      // Seed lessons in reverse order to test ordering
      await seedLesson({ courseId, title: 'Lesson 3', position: 3 })
      await seedLesson({ courseId, title: 'Lesson 1', position: 1 })
      await seedLesson({ courseId, title: 'Lesson 2', position: 2 })

      const res = await get<CourseDetailResponse>(`/api/v1/courses/${courseId}`)

      expect(res.status).toBe(200)
      expect(res.body.data.title).toBe('Node.js Basics')
      expect(res.body.data.lessons).toHaveLength(3)
      expect(res.body.data.lessons[0].title).toBe('Lesson 1')
      expect(res.body.data.lessons[0].position).toBe(1)
      expect(res.body.data.lessons[1].position).toBe(2)
      expect(res.body.data.lessons[2].position).toBe(3)
      expect(res.body.requestId).toBeTypeOf('string')
    })

    it('AC-05: should return 404 when course does not exist', async () => {
      const res = await get<ErrorResponse>('/api/v1/courses/99999')

      expect(res.status).toBe(404)
      expect(res.body.error.code).toBe('NOT_FOUND')
      expect(res.body.error.requestId).toBeTypeOf('string')
    })

    it('AC-05: should return 404 when course is draft (not published)', async () => {
      const courseId = await seedCourse({ title: 'Draft Course', status: 'draft' })

      const res = await get<ErrorResponse>(`/api/v1/courses/${courseId}`)

      expect(res.status).toBe(404)
      expect(res.body.error.code).toBe('NOT_FOUND')
    })

    it('AC-05: should return 404 when course is unpublished', async () => {
      const courseId = await seedCourse({ title: 'Unpublished', status: 'unpublished' })

      const res = await get<ErrorResponse>(`/api/v1/courses/${courseId}`)

      expect(res.status).toBe(404)
      expect(res.body.error.code).toBe('NOT_FOUND')
    })

    it('AC-06: should return 400 for non-numeric id', async () => {
      const res = await get<ErrorResponse>('/api/v1/courses/abc')

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('should return course with empty lessons array when no lessons exist', async () => {
      const courseId = await seedCourse({ title: 'No Lessons', status: 'published' })

      const res = await get<CourseDetailResponse>(`/api/v1/courses/${courseId}`)

      expect(res.status).toBe(200)
      expect(res.body.data.lessons).toEqual([])
    })

    it('should include requestId in error response', async () => {
      const res = await get<ErrorResponse>('/api/v1/courses/99999')

      expect(res.status).toBe(404)
      expect(res.body.error.requestId).toBeTypeOf('string')
      expect(res.requestId).toBeTypeOf('string')
    })
  })
})
