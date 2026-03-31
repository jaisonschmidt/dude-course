import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CourseController } from '../../../src/controllers/course-controller.js'
import type { CourseService } from '../../../src/services/course-service.js'
import { createMockRequest, createMockReply } from '../../helpers/fastify-mocks.js'
import { createCourseFactory, createLessonFactory } from '../../helpers/factories.js'

function createMockCourseService(): CourseService {
  return {
    listPublished: vi.fn(),
    getById: vi.fn(),
  } as unknown as CourseService
}

describe('CourseController', () => {
  let controller: CourseController
  let mockService: CourseService

  beforeEach(() => {
    vi.clearAllMocks()
    mockService = createMockCourseService()
    controller = new CourseController(mockService)
  })

  describe('list', () => {
    it('should return 200 with paginated course list', async () => {
      const course = createCourseFactory({ status: 'published' })
      const result = {
        data: [course],
        meta: { page: 1, pageSize: 10, totalItems: 1, totalPages: 1 },
      }
      vi.mocked(mockService.listPublished).mockResolvedValue(result)

      const request = createMockRequest({ query: { page: '1', pageSize: '10' } })
      const reply = createMockReply()

      await controller.list(request, reply)

      expect(reply.status).toHaveBeenCalledWith(200)
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.any(Array),
          meta: result.meta,
          requestId: 'test-req-id',
        }),
      )
    })

    it('should use default pagination when no query params', async () => {
      vi.mocked(mockService.listPublished).mockResolvedValue({
        data: [],
        meta: { page: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
      })

      const request = createMockRequest({ query: {} })
      const reply = createMockReply()

      await controller.list(request, reply)

      expect(mockService.listPublished).toHaveBeenCalled()
    })
  })

  describe('getById', () => {
    it('should return 200 with course detail including lessons', async () => {
      const course = createCourseFactory({ id: 1, status: 'published' })
      const lesson = createLessonFactory({ courseId: 1 })
      const courseWithLessons = { ...course, lessons: [lesson] }
      vi.mocked(mockService.getById).mockResolvedValue(courseWithLessons)

      const request = createMockRequest({ params: { id: '1' } })
      const reply = createMockReply()

      await controller.getById(request, reply)

      expect(reply.status).toHaveBeenCalledWith(200)
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            id: course.id,
            lessons: expect.any(Array),
          }),
          requestId: 'test-req-id',
        }),
      )
    })
  })
})
