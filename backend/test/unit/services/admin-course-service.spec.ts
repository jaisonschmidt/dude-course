import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AdminCourseService } from '../../../src/services/admin-course-service.js'
import type { ICourseRepository } from '../../../src/repositories/course-repository.js'
import type { ILessonRepository } from '../../../src/repositories/lesson-repository.js'
import { createCourseFactory, createLessonFactory } from '../../helpers/factories.js'
import { NotFoundError, BadRequestError } from '../../../src/models/errors.js'

function createMockCourseRepository(): ICourseRepository {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
    findByStatus: vi.fn(),
    findPublished: vi.fn(),
    countAll: vi.fn(),
    countByStatus: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
}

function createMockLessonRepository(): ILessonRepository {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findByCourseId: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    updatePositions: vi.fn(),
    deleteByCourseId: vi.fn(),
  }
}

describe('AdminCourseService', () => {
  let service: AdminCourseService
  let mockCourseRepo: ICourseRepository
  let mockLessonRepo: ILessonRepository

  beforeEach(() => {
    vi.clearAllMocks()
    mockCourseRepo = createMockCourseRepository()
    mockLessonRepo = createMockLessonRepository()
    service = new AdminCourseService(mockCourseRepo, mockLessonRepo)
  })

  // ────────────────────────────────────────
  // create
  // ────────────────────────────────────────
  describe('create', () => {
    it('should create a course with status draft', async () => {
      const created = createCourseFactory({ id: 1, title: 'New Course', status: 'draft' })
      vi.mocked(mockCourseRepo.create).mockResolvedValue(created)

      const result = await service.create({
        title: 'New Course',
        description: 'A new course',
      })

      expect(result).toEqual(created)
      expect(mockCourseRepo.create).toHaveBeenCalledWith({
        title: 'New Course',
        description: 'A new course',
        thumbnailUrl: null,
        status: 'draft',
      })
    })

    it('should pass thumbnailUrl when provided', async () => {
      const created = createCourseFactory({ id: 2, thumbnailUrl: 'https://img.com/thumb.jpg' })
      vi.mocked(mockCourseRepo.create).mockResolvedValue(created)

      await service.create({
        title: 'With Thumb',
        description: 'Has thumbnail',
        thumbnailUrl: 'https://img.com/thumb.jpg',
      })

      expect(mockCourseRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ thumbnailUrl: 'https://img.com/thumb.jpg' }),
      )
    })
  })

  // ────────────────────────────────────────
  // update
  // ────────────────────────────────────────
  describe('update', () => {
    it('should update course and return updated data', async () => {
      const updated = createCourseFactory({ id: 1, title: 'Updated Title' })
      vi.mocked(mockCourseRepo.update).mockResolvedValue(updated)

      const result = await service.update(1, { title: 'Updated Title' })

      expect(result).toEqual(updated)
      expect(mockCourseRepo.update).toHaveBeenCalledWith(1, { title: 'Updated Title' })
    })

    it('should throw NotFoundError when course does not exist', async () => {
      vi.mocked(mockCourseRepo.update).mockResolvedValue(null)

      await expect(service.update(999, { title: 'X' })).rejects.toThrow(NotFoundError)
      await expect(service.update(999, { title: 'X' })).rejects.toThrow('Course not found')
    })
  })

  // ────────────────────────────────────────
  // publish
  // ────────────────────────────────────────
  describe('publish', () => {
    it('should publish course when all prerequisites are met', async () => {
      const course = createCourseFactory({ id: 1, title: 'Course', description: 'Desc', status: 'draft' })
      const lessons = [createLessonFactory({ courseId: 1 })]
      const published = { ...course, status: 'published' as const }

      vi.mocked(mockCourseRepo.findById).mockResolvedValue(course)
      vi.mocked(mockLessonRepo.findByCourseId).mockResolvedValue(lessons)
      vi.mocked(mockCourseRepo.update).mockResolvedValue(published)

      const result = await service.publish(1)

      expect(result.status).toBe('published')
      expect(mockCourseRepo.update).toHaveBeenCalledWith(1, { status: 'published' })
    })

    it('should throw BadRequestError when course has no lessons', async () => {
      const course = createCourseFactory({ id: 1, title: 'Course', description: 'Desc', status: 'draft' })

      vi.mocked(mockCourseRepo.findById).mockResolvedValue(course)
      vi.mocked(mockLessonRepo.findByCourseId).mockResolvedValue([])

      await expect(service.publish(1)).rejects.toThrow(BadRequestError)
      await expect(service.publish(1)).rejects.toThrow('Cannot publish course')
    })

    it('should throw NotFoundError when course does not exist', async () => {
      vi.mocked(mockCourseRepo.findById).mockResolvedValue(null)

      await expect(service.publish(999)).rejects.toThrow(NotFoundError)
      await expect(service.publish(999)).rejects.toThrow('Course not found')
    })
  })

  // ────────────────────────────────────────
  // unpublish
  // ────────────────────────────────────────
  describe('unpublish', () => {
    it('should unpublish course successfully', async () => {
      const unpublished = createCourseFactory({ id: 1, status: 'unpublished' })
      vi.mocked(mockCourseRepo.update).mockResolvedValue(unpublished)

      const result = await service.unpublish(1)

      expect(result.status).toBe('unpublished')
      expect(mockCourseRepo.update).toHaveBeenCalledWith(1, { status: 'unpublished' })
    })

    it('should throw NotFoundError when course does not exist', async () => {
      vi.mocked(mockCourseRepo.update).mockResolvedValue(null)

      await expect(service.unpublish(999)).rejects.toThrow(NotFoundError)
      await expect(service.unpublish(999)).rejects.toThrow('Course not found')
    })
  })

  // ────────────────────────────────────────
  // delete
  // ────────────────────────────────────────
  describe('delete', () => {
    it('should delete course successfully', async () => {
      vi.mocked(mockCourseRepo.delete).mockResolvedValue(true)

      await expect(service.delete(1)).resolves.toBeUndefined()
      expect(mockCourseRepo.delete).toHaveBeenCalledWith(1)
    })

    it('should throw NotFoundError when course does not exist', async () => {
      vi.mocked(mockCourseRepo.delete).mockResolvedValue(false)

      await expect(service.delete(999)).rejects.toThrow(NotFoundError)
      await expect(service.delete(999)).rejects.toThrow('Course not found')
    })
  })

  // ────────────────────────────────────────
  // listAll
  // ────────────────────────────────────────
  describe('listAll', () => {
    it('should return paginated results with courses and meta', async () => {
      const courses = [
        {
          id: 1,
          title: 'Course 1',
          description: 'Description 1',
          thumbnailUrl: null,
          status: 'draft' as const,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 2,
          title: 'Course 2',
          description: 'Description 2',
          thumbnailUrl: null,
          status: 'draft' as const,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ]

      vi.mocked(mockCourseRepo.findAll).mockResolvedValue(courses)
      vi.mocked(mockCourseRepo.countAll).mockResolvedValue(2)

      const result = await service.listAll(1, 20)

      expect(result.data).toEqual(courses)
      expect(result.data).toHaveLength(2)
      expect(result.meta).toEqual({
        page: 1,
        pageSize: 20,
        totalItems: 2,
        totalPages: 1,
      })
      expect(mockCourseRepo.findAll).toHaveBeenCalledWith(1, 20)
      expect(mockCourseRepo.countAll).toHaveBeenCalledOnce()
    })
  })
})
