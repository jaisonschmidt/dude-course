import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AdminLessonService } from '../../../src/services/admin-lesson-service.js'
import type { ICourseRepository } from '../../../src/repositories/course-repository.js'
import type { ILessonRepository } from '../../../src/repositories/lesson-repository.js'
import { createCourseFactory, createLessonFactory } from '../../helpers/factories.js'
import { NotFoundError, ConflictError, BadRequestError } from '../../../src/models/errors.js'

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

describe('AdminLessonService', () => {
  let service: AdminLessonService
  let mockCourseRepo: ICourseRepository
  let mockLessonRepo: ILessonRepository

  beforeEach(() => {
    vi.clearAllMocks()
    mockCourseRepo = createMockCourseRepository()
    mockLessonRepo = createMockLessonRepository()
    service = new AdminLessonService(mockLessonRepo, mockCourseRepo)
  })

  // ────────────────────────────────────────
  // create
  // ────────────────────────────────────────
  describe('create', () => {
    it('should create a lesson in an existing course', async () => {
      const course = createCourseFactory({ id: 1 })
      const lesson = createLessonFactory({ id: 10, courseId: 1, position: 1 })

      vi.mocked(mockCourseRepo.findById).mockResolvedValue(course)
      vi.mocked(mockLessonRepo.create).mockResolvedValue(lesson)

      const result = await service.create(1, {
        title: 'Lesson 1',
        youtubeUrl: 'https://youtube.com/watch?v=abc123',
        position: 1,
      })

      expect(result).toEqual(lesson)
      expect(mockLessonRepo.create).toHaveBeenCalledWith({
        courseId: 1,
        title: 'Lesson 1',
        description: null,
        youtubeUrl: 'https://youtube.com/watch?v=abc123',
        position: 1,
      })
    })

    it('should pass description when provided', async () => {
      const course = createCourseFactory({ id: 1 })
      const lesson = createLessonFactory({ id: 10, courseId: 1, description: 'A lesson desc' })

      vi.mocked(mockCourseRepo.findById).mockResolvedValue(course)
      vi.mocked(mockLessonRepo.create).mockResolvedValue(lesson)

      await service.create(1, {
        title: 'Lesson 1',
        description: 'A lesson desc',
        youtubeUrl: 'https://youtube.com/watch?v=abc123',
        position: 1,
      })

      expect(mockLessonRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'A lesson desc' }),
      )
    })

    it('should throw NotFoundError when course does not exist', async () => {
      vi.mocked(mockCourseRepo.findById).mockResolvedValue(null)

      await expect(
        service.create(999, {
          title: 'Lesson',
          youtubeUrl: 'https://youtube.com/watch?v=abc',
          position: 1,
        }),
      ).rejects.toThrow(NotFoundError)
    })

    it('should throw ConflictError on duplicate position (P2002)', async () => {
      const course = createCourseFactory({ id: 1 })
      vi.mocked(mockCourseRepo.findById).mockResolvedValue(course)

      const prismaError = Object.assign(new Error('Unique constraint'), {
        name: 'PrismaClientKnownRequestError',
        code: 'P2002',
      })
      vi.mocked(mockLessonRepo.create).mockRejectedValue(prismaError)

      await expect(
        service.create(1, {
          title: 'Lesson',
          youtubeUrl: 'https://youtube.com/watch?v=abc',
          position: 1,
        }),
      ).rejects.toThrow(ConflictError)
    })

    it('should rethrow non-P2002 errors', async () => {
      const course = createCourseFactory({ id: 1 })
      vi.mocked(mockCourseRepo.findById).mockResolvedValue(course)
      vi.mocked(mockLessonRepo.create).mockRejectedValue(new Error('DB down'))

      await expect(
        service.create(1, {
          title: 'Lesson',
          youtubeUrl: 'https://youtube.com/watch?v=abc',
          position: 1,
        }),
      ).rejects.toThrow('DB down')
    })
  })

  // ────────────────────────────────────────
  // update
  // ────────────────────────────────────────
  describe('update', () => {
    it('should update lesson and return updated data', async () => {
      const course = createCourseFactory({ id: 1 })
      const lesson = createLessonFactory({ id: 10, courseId: 1, position: 1 })
      const updated = { ...lesson, title: 'Updated Title' }

      vi.mocked(mockCourseRepo.findById).mockResolvedValue(course)
      vi.mocked(mockLessonRepo.findById).mockResolvedValue(lesson)
      vi.mocked(mockLessonRepo.update).mockResolvedValue(updated)

      const result = await service.update(1, 10, { title: 'Updated Title' })

      expect(result.title).toBe('Updated Title')
      expect(mockLessonRepo.update).toHaveBeenCalledWith(10, { title: 'Updated Title' })
    })

    it('should throw NotFoundError when course does not exist', async () => {
      vi.mocked(mockCourseRepo.findById).mockResolvedValue(null)

      await expect(service.update(999, 10, { title: 'X' })).rejects.toThrow(NotFoundError)
      await expect(service.update(999, 10, { title: 'X' })).rejects.toThrow('Course not found')
    })

    it('should throw NotFoundError when lesson does not exist', async () => {
      const course = createCourseFactory({ id: 1 })
      vi.mocked(mockCourseRepo.findById).mockResolvedValue(course)
      vi.mocked(mockLessonRepo.findById).mockResolvedValue(null)

      await expect(service.update(1, 999, { title: 'X' })).rejects.toThrow(NotFoundError)
      await expect(service.update(1, 999, { title: 'X' })).rejects.toThrow('Lesson not found in this course')
    })

    it('should throw NotFoundError when lesson belongs to a different course', async () => {
      const course = createCourseFactory({ id: 1 })
      const lesson = createLessonFactory({ id: 10, courseId: 2 }) // different courseId

      vi.mocked(mockCourseRepo.findById).mockResolvedValue(course)
      vi.mocked(mockLessonRepo.findById).mockResolvedValue(lesson)

      await expect(service.update(1, 10, { title: 'X' })).rejects.toThrow(NotFoundError)
      await expect(service.update(1, 10, { title: 'X' })).rejects.toThrow('Lesson not found in this course')
    })

    it('should throw ConflictError on duplicate position (P2002)', async () => {
      const course = createCourseFactory({ id: 1 })
      const lesson = createLessonFactory({ id: 10, courseId: 1, position: 1 })

      vi.mocked(mockCourseRepo.findById).mockResolvedValue(course)
      vi.mocked(mockLessonRepo.findById).mockResolvedValue(lesson)

      const prismaError = Object.assign(new Error('Unique constraint'), {
        name: 'PrismaClientKnownRequestError',
        code: 'P2002',
      })
      vi.mocked(mockLessonRepo.update).mockRejectedValue(prismaError)

      await expect(service.update(1, 10, { position: 2 })).rejects.toThrow(ConflictError)
    })
  })

  // ────────────────────────────────────────
  // delete
  // ────────────────────────────────────────
  describe('delete', () => {
    it('should delete lesson successfully', async () => {
      const course = createCourseFactory({ id: 1 })
      const lesson = createLessonFactory({ id: 10, courseId: 1 })

      vi.mocked(mockCourseRepo.findById).mockResolvedValue(course)
      vi.mocked(mockLessonRepo.findById).mockResolvedValue(lesson)
      vi.mocked(mockLessonRepo.delete).mockResolvedValue(true)

      await expect(service.delete(1, 10)).resolves.toBeUndefined()
      expect(mockLessonRepo.delete).toHaveBeenCalledWith(10)
    })

    it('should throw NotFoundError when course does not exist', async () => {
      vi.mocked(mockCourseRepo.findById).mockResolvedValue(null)

      await expect(service.delete(999, 10)).rejects.toThrow(NotFoundError)
      await expect(service.delete(999, 10)).rejects.toThrow('Course not found')
    })

    it('should throw NotFoundError when lesson does not belong to course', async () => {
      const course = createCourseFactory({ id: 1 })
      const lesson = createLessonFactory({ id: 10, courseId: 2 })

      vi.mocked(mockCourseRepo.findById).mockResolvedValue(course)
      vi.mocked(mockLessonRepo.findById).mockResolvedValue(lesson)

      await expect(service.delete(1, 10)).rejects.toThrow(NotFoundError)
      await expect(service.delete(1, 10)).rejects.toThrow('Lesson not found in this course')
    })

    it('should throw NotFoundError when lesson does not exist', async () => {
      const course = createCourseFactory({ id: 1 })
      vi.mocked(mockCourseRepo.findById).mockResolvedValue(course)
      vi.mocked(mockLessonRepo.findById).mockResolvedValue(null)

      await expect(service.delete(1, 999)).rejects.toThrow(NotFoundError)
    })
  })

  // ────────────────────────────────────────
  // reorder
  // ────────────────────────────────────────
  describe('reorder', () => {
    it('should reorder lessons successfully', async () => {
      const course = createCourseFactory({ id: 1 })
      const lesson1 = createLessonFactory({ id: 10, courseId: 1, position: 1 })
      const lesson2 = createLessonFactory({ id: 11, courseId: 1, position: 2 })
      const reorderedLessons = [
        { ...lesson2, position: 1 },
        { ...lesson1, position: 2 },
      ]

      vi.mocked(mockCourseRepo.findById).mockResolvedValue(course)
      vi.mocked(mockLessonRepo.findByCourseId).mockResolvedValueOnce([lesson1, lesson2])
      vi.mocked(mockLessonRepo.updatePositions).mockResolvedValue(undefined)
      vi.mocked(mockLessonRepo.findByCourseId).mockResolvedValueOnce(reorderedLessons)

      const result = await service.reorder(1, [
        { lessonId: 11, position: 1 },
        { lessonId: 10, position: 2 },
      ])

      expect(result).toEqual(reorderedLessons)
      // Two-phase: first temp positions, then final positions
      expect(mockLessonRepo.updatePositions).toHaveBeenCalledTimes(2)
    })

    it('should throw NotFoundError when course does not exist', async () => {
      vi.mocked(mockCourseRepo.findById).mockResolvedValue(null)

      await expect(
        service.reorder(999, [{ lessonId: 10, position: 1 }]),
      ).rejects.toThrow(NotFoundError)
    })

    it('should throw NotFoundError when a lesson does not belong to the course', async () => {
      const course = createCourseFactory({ id: 1 })
      const lesson1 = createLessonFactory({ id: 10, courseId: 1, position: 1 })

      vi.mocked(mockCourseRepo.findById).mockResolvedValue(course)
      vi.mocked(mockLessonRepo.findByCourseId).mockResolvedValue([lesson1])

      await expect(
        service.reorder(1, [
          { lessonId: 10, position: 1 },
          { lessonId: 999, position: 2 }, // doesn't belong
        ]),
      ).rejects.toThrow(NotFoundError)
    })

    it('should throw BadRequestError on duplicate positions', async () => {
      const course = createCourseFactory({ id: 1 })
      const lesson1 = createLessonFactory({ id: 10, courseId: 1, position: 1 })
      const lesson2 = createLessonFactory({ id: 11, courseId: 1, position: 2 })

      vi.mocked(mockCourseRepo.findById).mockResolvedValue(course)
      vi.mocked(mockLessonRepo.findByCourseId).mockResolvedValue([lesson1, lesson2])

      await expect(
        service.reorder(1, [
          { lessonId: 10, position: 1 },
          { lessonId: 11, position: 1 }, // duplicate position
        ]),
      ).rejects.toThrow(BadRequestError)
    })

    it('should throw BadRequestError on duplicate lesson IDs', async () => {
      const course = createCourseFactory({ id: 1 })
      const lesson1 = createLessonFactory({ id: 10, courseId: 1, position: 1 })

      vi.mocked(mockCourseRepo.findById).mockResolvedValue(course)
      vi.mocked(mockLessonRepo.findByCourseId).mockResolvedValue([lesson1])

      await expect(
        service.reorder(1, [
          { lessonId: 10, position: 1 },
          { lessonId: 10, position: 2 }, // duplicate lessonId
        ]),
      ).rejects.toThrow(BadRequestError)
    })
  })
})
