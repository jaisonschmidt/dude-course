import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AdminLessonController } from '../../../src/controllers/admin-lesson-controller.js'
import type { AdminLessonService } from '../../../src/services/admin-lesson-service.js'
import { createMockRequest, createMockReply } from '../../helpers/fastify-mocks.js'
import { createLessonFactory } from '../../helpers/factories.js'

vi.mock('../../../src/utils/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

function createMockAdminLessonService(): AdminLessonService {
  return {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    reorder: vi.fn(),
  } as unknown as AdminLessonService
}

const adminUser = { id: 1, email: 'admin@test.com', role: 'admin' }

describe('AdminLessonController', () => {
  let controller: AdminLessonController
  let mockService: AdminLessonService

  beforeEach(() => {
    vi.clearAllMocks()
    mockService = createMockAdminLessonService()
    controller = new AdminLessonController(mockService)
  })

  describe('create', () => {
    it('should return 201 with lesson data on successful creation', async () => {
      const lesson = createLessonFactory({ id: 1, courseId: 10 })
      vi.mocked(mockService.create).mockResolvedValue(lesson)

      const request = createMockRequest({
        params: { id: '10' },
        body: { title: 'New Lesson', youtubeUrl: 'https://youtube.com/watch?v=abc', position: 1 },
        user: adminUser,
      })
      const reply = createMockReply()

      await controller.create(request, reply)

      expect(reply.status).toHaveBeenCalledWith(201)
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ id: 1, courseId: 10 }),
          requestId: 'test-req-id',
        }),
      )
    })

    it('should log admin.lesson.created event', async () => {
      const lesson = createLessonFactory({ id: 5, courseId: 10 })
      vi.mocked(mockService.create).mockResolvedValue(lesson)

      const { logger } = await import('../../../src/utils/logger.js')

      const request = createMockRequest({
        params: { id: '10' },
        body: { title: 'New Lesson', youtubeUrl: 'https://youtube.com/watch?v=abc', position: 1 },
        user: adminUser,
      })
      const reply = createMockReply()

      await controller.create(request, reply)

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({ courseId: 10, lessonId: 5 }),
        'admin.lesson.created',
      )
    })

    it('should return 401 when user is not authenticated', async () => {
      const request = createMockRequest({
        params: { id: '10' },
        body: { title: 'Lesson', youtubeUrl: 'https://youtube.com/watch?v=abc', position: 1 },
      })
      const reply = createMockReply()

      await controller.create(request, reply)

      expect(reply.status).toHaveBeenCalledWith(401)
    })
  })

  describe('update', () => {
    it('should return 200 with updated lesson data', async () => {
      const lesson = createLessonFactory({ id: 5, courseId: 10, title: 'Updated' })
      vi.mocked(mockService.update).mockResolvedValue(lesson)

      const request = createMockRequest({
        params: { id: '10', lessonId: '5' },
        body: { title: 'Updated' },
        user: adminUser,
      })
      const reply = createMockReply()

      await controller.update(request, reply)

      expect(reply.status).toHaveBeenCalledWith(200)
      expect(mockService.update).toHaveBeenCalledWith(10, 5, { title: 'Updated' })
    })

    it('should return 401 when user is not authenticated', async () => {
      const request = createMockRequest({
        params: { id: '10', lessonId: '5' },
        body: { title: 'Updated' },
      })
      const reply = createMockReply()

      await controller.update(request, reply)

      expect(reply.status).toHaveBeenCalledWith(401)
    })
  })

  describe('delete', () => {
    it('should return 204 on successful deletion', async () => {
      vi.mocked(mockService.delete).mockResolvedValue(undefined)

      const request = createMockRequest({
        params: { id: '10', lessonId: '5' },
        user: adminUser,
      })
      const reply = createMockReply()

      await controller.delete(request, reply)

      expect(reply.status).toHaveBeenCalledWith(204)
      expect(mockService.delete).toHaveBeenCalledWith(10, 5)
    })

    it('should log admin.lesson.deleted event', async () => {
      vi.mocked(mockService.delete).mockResolvedValue(undefined)

      const { logger } = await import('../../../src/utils/logger.js')

      const request = createMockRequest({
        params: { id: '10', lessonId: '5' },
        user: adminUser,
      })
      const reply = createMockReply()

      await controller.delete(request, reply)

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({ courseId: 10, lessonId: 5 }),
        'admin.lesson.deleted',
      )
    })

    it('should return 401 when user is not authenticated', async () => {
      const request = createMockRequest({
        params: { id: '10', lessonId: '5' },
      })
      const reply = createMockReply()

      await controller.delete(request, reply)

      expect(reply.status).toHaveBeenCalledWith(401)
    })
  })

  describe('reorder', () => {
    it('should return 200 with reordered lessons', async () => {
      const lessons = [
        createLessonFactory({ id: 1, courseId: 10, position: 1 }),
        createLessonFactory({ id: 2, courseId: 10, position: 2 }),
      ]
      vi.mocked(mockService.reorder).mockResolvedValue(lessons)

      const request = createMockRequest({
        params: { id: '10' },
        body: { lessons: [{ lessonId: 1, position: 1 }, { lessonId: 2, position: 2 }] },
        user: adminUser,
      })
      const reply = createMockReply()

      await controller.reorder(request, reply)

      expect(reply.status).toHaveBeenCalledWith(200)
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({ id: 1, position: 1 }),
          ]),
          requestId: 'test-req-id',
        }),
      )
    })

    it('should log admin.lessons.reordered event', async () => {
      const lesson = createLessonFactory({ id: 1, courseId: 10, position: 1 })
      vi.mocked(mockService.reorder).mockResolvedValue([lesson])

      const { logger } = await import('../../../src/utils/logger.js')

      const request = createMockRequest({
        params: { id: '10' },
        body: { lessons: [{ lessonId: 1, position: 1 }] },
        user: adminUser,
      })
      const reply = createMockReply()

      await controller.reorder(request, reply)

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({ courseId: 10 }),
        'admin.lessons.reordered',
      )
    })

    it('should return 401 when user is not authenticated', async () => {
      const request = createMockRequest({
        params: { id: '10' },
        body: { lessons: [{ lessonId: 1, position: 1 }] },
      })
      const reply = createMockReply()

      await controller.reorder(request, reply)

      expect(reply.status).toHaveBeenCalledWith(401)
    })
  })
})
