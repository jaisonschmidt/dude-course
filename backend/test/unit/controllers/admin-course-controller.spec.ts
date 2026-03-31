import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AdminCourseController } from '../../../src/controllers/admin-course-controller.js'
import type { AdminCourseService } from '../../../src/services/admin-course-service.js'
import { createMockRequest, createMockReply } from '../../helpers/fastify-mocks.js'
import { createCourseFactory } from '../../helpers/factories.js'

vi.mock('../../../src/utils/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

function createMockAdminCourseService(): AdminCourseService {
  return {
    create: vi.fn(),
    update: vi.fn(),
    publish: vi.fn(),
    unpublish: vi.fn(),
    delete: vi.fn(),
  } as unknown as AdminCourseService
}

const adminUser = { id: 1, email: 'admin@test.com', role: 'admin' }

describe('AdminCourseController', () => {
  let controller: AdminCourseController
  let mockService: AdminCourseService

  beforeEach(() => {
    vi.clearAllMocks()
    mockService = createMockAdminCourseService()
    controller = new AdminCourseController(mockService)
  })

  describe('create', () => {
    it('should return 201 with course data on successful creation', async () => {
      const course = createCourseFactory({ id: 1 })
      vi.mocked(mockService.create).mockResolvedValue(course)

      const request = createMockRequest({
        body: { title: 'New Course', description: 'Desc' },
        user: adminUser,
      })
      const reply = createMockReply()

      await controller.create(request, reply)

      expect(reply.status).toHaveBeenCalledWith(201)
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ id: 1 }),
          requestId: 'test-req-id',
        }),
      )
    })

    it('should log admin.course.created event', async () => {
      const course = createCourseFactory({ id: 5 })
      vi.mocked(mockService.create).mockResolvedValue(course)

      const { logger } = await import('../../../src/utils/logger.js')

      const request = createMockRequest({
        body: { title: 'New Course', description: 'Desc' },
        user: adminUser,
      })
      const reply = createMockReply()

      await controller.create(request, reply)

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({ courseId: 5, userId: 1 }),
        'admin.course.created',
      )
    })

    it('should return 401 when user is not authenticated', async () => {
      const request = createMockRequest({
        body: { title: 'New Course', description: 'Desc' },
      })
      const reply = createMockReply()

      await controller.create(request, reply)

      expect(reply.status).toHaveBeenCalledWith(401)
    })
  })

  describe('update', () => {
    it('should return 200 with updated course data', async () => {
      const course = createCourseFactory({ id: 1, title: 'Updated' })
      vi.mocked(mockService.update).mockResolvedValue(course)

      const request = createMockRequest({
        params: { id: '1' },
        body: { title: 'Updated' },
        user: adminUser,
      })
      const reply = createMockReply()

      await controller.update(request, reply)

      expect(reply.status).toHaveBeenCalledWith(200)
      expect(mockService.update).toHaveBeenCalledWith(1, { title: 'Updated' })
    })

    it('should return 401 when user is not authenticated', async () => {
      const request = createMockRequest({
        params: { id: '1' },
        body: { title: 'Updated' },
      })
      const reply = createMockReply()

      await controller.update(request, reply)

      expect(reply.status).toHaveBeenCalledWith(401)
    })
  })

  describe('publish', () => {
    it('should return 200 with published course', async () => {
      const course = createCourseFactory({ id: 1, status: 'published' })
      vi.mocked(mockService.publish).mockResolvedValue(course)

      const request = createMockRequest({
        params: { id: '1' },
        user: adminUser,
      })
      const reply = createMockReply()

      await controller.publish(request, reply)

      expect(reply.status).toHaveBeenCalledWith(200)
      expect(mockService.publish).toHaveBeenCalledWith(1)
    })

    it('should log course.published event', async () => {
      const course = createCourseFactory({ id: 1 })
      vi.mocked(mockService.publish).mockResolvedValue(course)

      const { logger } = await import('../../../src/utils/logger.js')

      const request = createMockRequest({ params: { id: '1' }, user: adminUser })
      const reply = createMockReply()

      await controller.publish(request, reply)

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({ courseId: 1 }),
        'course.published',
      )
    })

    it('should return 401 when user is not authenticated', async () => {
      const request = createMockRequest({ params: { id: '1' } })
      const reply = createMockReply()

      await controller.publish(request, reply)

      expect(reply.status).toHaveBeenCalledWith(401)
    })
  })

  describe('unpublish', () => {
    it('should return 200 with unpublished course', async () => {
      const course = createCourseFactory({ id: 1, status: 'draft' })
      vi.mocked(mockService.unpublish).mockResolvedValue(course)

      const request = createMockRequest({
        params: { id: '1' },
        user: adminUser,
      })
      const reply = createMockReply()

      await controller.unpublish(request, reply)

      expect(reply.status).toHaveBeenCalledWith(200)
      expect(mockService.unpublish).toHaveBeenCalledWith(1)
    })

    it('should return 401 when user is not authenticated', async () => {
      const request = createMockRequest({ params: { id: '1' } })
      const reply = createMockReply()

      await controller.unpublish(request, reply)

      expect(reply.status).toHaveBeenCalledWith(401)
    })
  })

  describe('delete', () => {
    it('should return 204 on successful deletion', async () => {
      vi.mocked(mockService.delete).mockResolvedValue(undefined)

      const request = createMockRequest({
        params: { id: '1' },
        user: adminUser,
      })
      const reply = createMockReply()

      await controller.delete(request, reply)

      expect(reply.status).toHaveBeenCalledWith(204)
      expect(mockService.delete).toHaveBeenCalledWith(1)
    })

    it('should log admin.course.deleted event', async () => {
      vi.mocked(mockService.delete).mockResolvedValue(undefined)

      const { logger } = await import('../../../src/utils/logger.js')

      const request = createMockRequest({ params: { id: '1' }, user: adminUser })
      const reply = createMockReply()

      await controller.delete(request, reply)

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({ courseId: 1 }),
        'admin.course.deleted',
      )
    })

    it('should return 401 when user is not authenticated', async () => {
      const request = createMockRequest({ params: { id: '1' } })
      const reply = createMockReply()

      await controller.delete(request, reply)

      expect(reply.status).toHaveBeenCalledWith(401)
    })
  })
})
