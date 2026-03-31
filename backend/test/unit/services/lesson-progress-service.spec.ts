import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LessonProgressService } from '../../../src/services/lesson-progress-service.js'
import type { ILessonProgressRepository } from '../../../src/repositories/lesson-progress-repository.js'
import type { ILessonRepository } from '../../../src/repositories/lesson-repository.js'
import type { IEnrollmentRepository } from '../../../src/repositories/enrollment-repository.js'
import {
  createLessonFactory,
  createEnrollmentFactory,
  createLessonProgressFactory,
} from '../../helpers/factories.js'
import { NotFoundError } from '../../../src/models/errors.js'

vi.mock('../../../src/utils/prisma-errors.js', () => ({
  isUniqueConstraintError: vi.fn(),
}))

import { isUniqueConstraintError } from '../../../src/utils/prisma-errors.js'

function createMockLessonProgressRepository(): ILessonProgressRepository {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findByUserAndLesson: vi.fn(),
    findByCourseProgress: vi.fn(),
    delete: vi.fn(),
  }
}

function createMockLessonRepository(): Pick<ILessonRepository, 'findById' | 'findByCourseId'> {
  return {
    findById: vi.fn(),
    findByCourseId: vi.fn(),
  }
}

function createMockEnrollmentRepository(): Pick<IEnrollmentRepository, 'findByUserAndCourse' | 'markCompleted'> {
  return {
    findByUserAndCourse: vi.fn(),
    markCompleted: vi.fn(),
  }
}

describe('LessonProgressService', () => {
  let service: LessonProgressService
  let mockProgressRepo: ILessonProgressRepository
  let mockLessonRepo: ReturnType<typeof createMockLessonRepository>
  let mockEnrollmentRepo: ReturnType<typeof createMockEnrollmentRepository>

  beforeEach(() => {
    vi.clearAllMocks()
    mockProgressRepo = createMockLessonProgressRepository()
    mockLessonRepo = createMockLessonRepository()
    mockEnrollmentRepo = createMockEnrollmentRepository()
    service = new LessonProgressService(
      mockProgressRepo,
      mockLessonRepo as ILessonRepository,
      mockEnrollmentRepo as IEnrollmentRepository,
    )
  })

  describe('markCompleted', () => {
    const userId = 42
    const courseId = 10
    const lessonId = 5

    it('should create progress record for a valid lesson in an enrolled course', async () => {
      // Arrange
      const lesson = createLessonFactory({ id: lessonId, courseId })
      const enrollment = createEnrollmentFactory({ userId, courseId })
      const progress = createLessonProgressFactory({ userId, courseId, lessonId })

      vi.mocked(mockLessonRepo.findById).mockResolvedValue(lesson)
      vi.mocked(mockEnrollmentRepo.findByUserAndCourse).mockResolvedValue(enrollment)
      vi.mocked(mockProgressRepo.findByUserAndLesson).mockResolvedValue(null)
      vi.mocked(mockProgressRepo.create).mockResolvedValue(progress)
      vi.mocked(mockLessonRepo.findByCourseId).mockResolvedValue([lesson])
      vi.mocked(mockProgressRepo.findByCourseProgress).mockResolvedValue([progress])
      vi.mocked(mockEnrollmentRepo.markCompleted).mockResolvedValue(enrollment)

      // Act
      const result = await service.markCompleted(userId, courseId, lessonId)

      // Assert
      expect(result.progress).toEqual(progress)
      expect(mockProgressRepo.create).toHaveBeenCalledWith({ userId, courseId, lessonId })
    })

    it('should return existing progress without creating duplicate (idempotent)', async () => {
      // Arrange
      const lesson = createLessonFactory({ id: lessonId, courseId })
      const enrollment = createEnrollmentFactory({ userId, courseId })
      const existingProgress = createLessonProgressFactory({ id: 99, userId, courseId, lessonId })

      vi.mocked(mockLessonRepo.findById).mockResolvedValue(lesson)
      vi.mocked(mockEnrollmentRepo.findByUserAndCourse).mockResolvedValue(enrollment)
      vi.mocked(mockProgressRepo.findByUserAndLesson).mockResolvedValue(existingProgress)

      // Act
      const result = await service.markCompleted(userId, courseId, lessonId)

      // Assert
      expect(result.progress).toEqual(existingProgress)
      expect(result.autoCompleted).toBe(false)
      expect(mockProgressRepo.create).not.toHaveBeenCalled()
    })

    it('should throw NotFoundError when lesson does not exist', async () => {
      // Arrange
      vi.mocked(mockLessonRepo.findById).mockResolvedValue(null)

      // Act & Assert
      await expect(service.markCompleted(userId, courseId, 999)).rejects.toThrow(NotFoundError)
      await expect(service.markCompleted(userId, courseId, 999)).rejects.toThrow(
        'Lesson not found in this course',
      )
      expect(mockEnrollmentRepo.findByUserAndCourse).not.toHaveBeenCalled()
    })

    it('should throw NotFoundError when lesson belongs to a different course', async () => {
      // Arrange
      const lessonInOtherCourse = createLessonFactory({ id: lessonId, courseId: 999 })
      vi.mocked(mockLessonRepo.findById).mockResolvedValue(lessonInOtherCourse)

      // Act & Assert
      await expect(service.markCompleted(userId, courseId, lessonId)).rejects.toThrow(NotFoundError)
      expect(mockEnrollmentRepo.findByUserAndCourse).not.toHaveBeenCalled()
    })

    it('should throw NotFoundError when learner is not enrolled', async () => {
      // Arrange
      const lesson = createLessonFactory({ id: lessonId, courseId })
      vi.mocked(mockLessonRepo.findById).mockResolvedValue(lesson)
      vi.mocked(mockEnrollmentRepo.findByUserAndCourse).mockResolvedValue(null)

      // Act & Assert
      await expect(service.markCompleted(userId, courseId, lessonId)).rejects.toThrow(NotFoundError)
      await expect(service.markCompleted(userId, courseId, lessonId)).rejects.toThrow(
        'Enrollment not found',
      )
      expect(mockProgressRepo.findByUserAndLesson).not.toHaveBeenCalled()
    })

    it('should auto-complete enrollment when all lessons are completed', async () => {
      // Arrange
      const lesson1 = createLessonFactory({ id: 1, courseId, position: 1 })
      const lesson2 = createLessonFactory({ id: 2, courseId, position: 2 })
      const enrollment = createEnrollmentFactory({ id: 7, userId, courseId })
      const progress1 = createLessonProgressFactory({ userId, courseId, lessonId: 1 })
      const progress2 = createLessonProgressFactory({ userId, courseId, lessonId: 2 })

      vi.mocked(mockLessonRepo.findById).mockResolvedValue(lesson2)
      vi.mocked(mockEnrollmentRepo.findByUserAndCourse).mockResolvedValue(enrollment)
      vi.mocked(mockProgressRepo.findByUserAndLesson).mockResolvedValue(null)
      vi.mocked(mockProgressRepo.create).mockResolvedValue(progress2)

      // Auto-completion check: all 2 lessons completed
      vi.mocked(mockLessonRepo.findByCourseId).mockResolvedValue([lesson1, lesson2])
      vi.mocked(mockProgressRepo.findByCourseProgress).mockResolvedValue([progress1, progress2])
      vi.mocked(mockEnrollmentRepo.markCompleted).mockResolvedValue({
        ...enrollment,
        completedAt: new Date(),
      })

      // Act
      const result = await service.markCompleted(userId, courseId, 2)

      // Assert
      expect(result.autoCompleted).toBe(true)
      expect(mockEnrollmentRepo.markCompleted).toHaveBeenCalledWith(7, expect.any(Date))
    })

    it('should NOT auto-complete when not all lessons are completed', async () => {
      // Arrange
      const lesson1 = createLessonFactory({ id: 1, courseId, position: 1 })
      const lesson2 = createLessonFactory({ id: 2, courseId, position: 2 })
      const lesson3 = createLessonFactory({ id: 3, courseId, position: 3 })
      const enrollment = createEnrollmentFactory({ userId, courseId })
      const progress1 = createLessonProgressFactory({ userId, courseId, lessonId: 1 })

      vi.mocked(mockLessonRepo.findById).mockResolvedValue(lesson1)
      vi.mocked(mockEnrollmentRepo.findByUserAndCourse).mockResolvedValue(enrollment)
      vi.mocked(mockProgressRepo.findByUserAndLesson).mockResolvedValue(null)
      vi.mocked(mockProgressRepo.create).mockResolvedValue(progress1)

      // Auto-completion check: only 1 of 3 lessons completed
      vi.mocked(mockLessonRepo.findByCourseId).mockResolvedValue([lesson1, lesson2, lesson3])
      vi.mocked(mockProgressRepo.findByCourseProgress).mockResolvedValue([progress1])

      // Act
      const result = await service.markCompleted(userId, courseId, 1)

      // Assert
      expect(result.autoCompleted).toBe(false)
      expect(mockEnrollmentRepo.markCompleted).not.toHaveBeenCalled()
    })

    it('should handle race condition gracefully when concurrent create hits unique constraint', async () => {
      // Arrange
      const lesson = createLessonFactory({ id: lessonId, courseId })
      const enrollment = createEnrollmentFactory({ userId, courseId })
      const existingProgress = createLessonProgressFactory({ id: 99, userId, courseId, lessonId })

      vi.mocked(mockLessonRepo.findById).mockResolvedValue(lesson)
      vi.mocked(mockEnrollmentRepo.findByUserAndCourse).mockResolvedValue(enrollment)
      vi.mocked(mockProgressRepo.findByUserAndLesson)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(existingProgress)

      const uniqueError = new Error('Unique constraint failed')
      vi.mocked(mockProgressRepo.create).mockRejectedValue(uniqueError)
      vi.mocked(isUniqueConstraintError).mockReturnValue(true)

      // Act
      const result = await service.markCompleted(userId, courseId, lessonId)

      // Assert
      expect(result.progress).toEqual(existingProgress)
      expect(result.autoCompleted).toBe(false)
    })

    it('should rethrow non-unique-constraint errors from create', async () => {
      // Arrange
      const lesson = createLessonFactory({ id: lessonId, courseId })
      const enrollment = createEnrollmentFactory({ userId, courseId })

      vi.mocked(mockLessonRepo.findById).mockResolvedValue(lesson)
      vi.mocked(mockEnrollmentRepo.findByUserAndCourse).mockResolvedValue(enrollment)
      vi.mocked(mockProgressRepo.findByUserAndLesson).mockResolvedValue(null)

      const dbError = new Error('Connection refused')
      vi.mocked(mockProgressRepo.create).mockRejectedValue(dbError)
      vi.mocked(isUniqueConstraintError).mockReturnValue(false)

      // Act & Assert
      await expect(service.markCompleted(userId, courseId, lessonId)).rejects.toThrow(
        'Connection refused',
      )
    })

    it('should verify lesson existence before checking enrollment (fail fast)', async () => {
      // Arrange
      vi.mocked(mockLessonRepo.findById).mockResolvedValue(null)

      // Act
      await expect(service.markCompleted(userId, courseId, lessonId)).rejects.toThrow()

      // Assert — enrollment should never be checked
      expect(mockLessonRepo.findById).toHaveBeenCalledOnce()
      expect(mockEnrollmentRepo.findByUserAndCourse).not.toHaveBeenCalled()
    })
  })
})
