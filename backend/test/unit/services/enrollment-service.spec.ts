import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EnrollmentService } from '../../../src/services/enrollment-service.js'
import type { IEnrollmentRepository } from '../../../src/repositories/enrollment-repository.js'
import type { ICourseRepository } from '../../../src/repositories/course-repository.js'
import { createEnrollmentFactory, createCourseFactory } from '../../helpers/factories.js'
import { NotFoundError } from '../../../src/models/errors.js'

vi.mock('../../../src/utils/prisma-errors.js', () => ({
  isUniqueConstraintError: vi.fn(),
}))

import { isUniqueConstraintError } from '../../../src/utils/prisma-errors.js'

function createMockEnrollmentRepository(): IEnrollmentRepository {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findByUserAndCourse: vi.fn(),
    findByUserId: vi.fn(),
    markCompleted: vi.fn(),
    delete: vi.fn(),
  }
}

function createMockCourseRepository(): ICourseRepository {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findByStatus: vi.fn(),
    findPublished: vi.fn(),
    countByStatus: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
}

describe('EnrollmentService', () => {
  let enrollmentService: EnrollmentService
  let mockEnrollmentRepo: IEnrollmentRepository
  let mockCourseRepo: ICourseRepository

  beforeEach(() => {
    vi.clearAllMocks()
    mockEnrollmentRepo = createMockEnrollmentRepository()
    mockCourseRepo = createMockCourseRepository()
    enrollmentService = new EnrollmentService(mockEnrollmentRepo, mockCourseRepo)
  })

  // ────────────────────────────────────────
  // enroll
  // ────────────────────────────────────────
  describe('enroll', () => {
    it('should create a new enrollment when user is not yet enrolled in a published course', async () => {
      // Arrange
      const course = createCourseFactory({ id: 10, status: 'published' })
      const newEnrollment = createEnrollmentFactory({ id: 1, userId: 42, courseId: 10 })

      vi.mocked(mockCourseRepo.findById).mockResolvedValue(course)
      vi.mocked(mockEnrollmentRepo.findByUserAndCourse).mockResolvedValue(null)
      vi.mocked(mockEnrollmentRepo.create).mockResolvedValue(newEnrollment)

      // Act
      const result = await enrollmentService.enroll(42, 10)

      // Assert
      expect(result.enrollment).toEqual(newEnrollment)
      expect(result.created).toBe(true)
      expect(mockCourseRepo.findById).toHaveBeenCalledWith(10)
      expect(mockEnrollmentRepo.findByUserAndCourse).toHaveBeenCalledWith(42, 10)
      expect(mockEnrollmentRepo.create).toHaveBeenCalledWith({ userId: 42, courseId: 10 })
    })

    it('should return existing enrollment without creating a duplicate (idempotent)', async () => {
      // Arrange
      const course = createCourseFactory({ id: 10, status: 'published' })
      const existingEnrollment = createEnrollmentFactory({ id: 5, userId: 42, courseId: 10 })

      vi.mocked(mockCourseRepo.findById).mockResolvedValue(course)
      vi.mocked(mockEnrollmentRepo.findByUserAndCourse).mockResolvedValue(existingEnrollment)

      // Act
      const result = await enrollmentService.enroll(42, 10)

      // Assert
      expect(result.enrollment).toEqual(existingEnrollment)
      expect(result.created).toBe(false)
      expect(mockEnrollmentRepo.create).not.toHaveBeenCalled()
    })

    it('should throw NotFoundError when course does not exist', async () => {
      // Arrange
      vi.mocked(mockCourseRepo.findById).mockResolvedValue(null)

      // Act & Assert
      await expect(enrollmentService.enroll(42, 999)).rejects.toThrow(NotFoundError)
      await expect(enrollmentService.enroll(42, 999)).rejects.toThrow('Course not found')

      expect(mockEnrollmentRepo.findByUserAndCourse).not.toHaveBeenCalled()
      expect(mockEnrollmentRepo.create).not.toHaveBeenCalled()
    })

    it('should throw NotFoundError when course is draft (not published)', async () => {
      // Arrange
      const draftCourse = createCourseFactory({ id: 5, status: 'draft' })
      vi.mocked(mockCourseRepo.findById).mockResolvedValue(draftCourse)

      // Act & Assert
      await expect(enrollmentService.enroll(42, 5)).rejects.toThrow(NotFoundError)
      await expect(enrollmentService.enroll(42, 5)).rejects.toThrow('Course not found')

      expect(mockEnrollmentRepo.findByUserAndCourse).not.toHaveBeenCalled()
      expect(mockEnrollmentRepo.create).not.toHaveBeenCalled()
    })

    it('should throw NotFoundError when course is unpublished', async () => {
      // Arrange
      const unpublishedCourse = createCourseFactory({ id: 7, status: 'unpublished' })
      vi.mocked(mockCourseRepo.findById).mockResolvedValue(unpublishedCourse)

      // Act & Assert
      await expect(enrollmentService.enroll(42, 7)).rejects.toThrow(NotFoundError)

      expect(mockEnrollmentRepo.findByUserAndCourse).not.toHaveBeenCalled()
      expect(mockEnrollmentRepo.create).not.toHaveBeenCalled()
    })

    it('should check course existence before checking enrollment (fail fast)', async () => {
      // Arrange
      vi.mocked(mockCourseRepo.findById).mockResolvedValue(null)

      // Act
      await expect(enrollmentService.enroll(42, 999)).rejects.toThrow()

      // Assert — enrollment repo should never be called
      expect(mockCourseRepo.findById).toHaveBeenCalledOnce()
      expect(mockEnrollmentRepo.findByUserAndCourse).not.toHaveBeenCalled()
      expect(mockEnrollmentRepo.create).not.toHaveBeenCalled()
    })

    it('should handle race condition gracefully when concurrent create hits unique constraint', async () => {
      // Arrange
      const course = createCourseFactory({ id: 10, status: 'published' })
      const existingEnrollment = createEnrollmentFactory({ id: 99, userId: 42, courseId: 10 })

      vi.mocked(mockCourseRepo.findById).mockResolvedValue(course)
      vi.mocked(mockEnrollmentRepo.findByUserAndCourse)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(existingEnrollment)

      const uniqueError = new Error('Unique constraint failed')
      vi.mocked(mockEnrollmentRepo.create).mockRejectedValue(uniqueError)
      vi.mocked(isUniqueConstraintError).mockReturnValue(true)

      // Act
      const result = await enrollmentService.enroll(42, 10)

      // Assert
      expect(result.enrollment).toEqual(existingEnrollment)
      expect(result.created).toBe(false)
    })

    it('should rethrow non-unique-constraint errors from create', async () => {
      // Arrange
      const course = createCourseFactory({ id: 10, status: 'published' })

      vi.mocked(mockCourseRepo.findById).mockResolvedValue(course)
      vi.mocked(mockEnrollmentRepo.findByUserAndCourse).mockResolvedValue(null)

      const dbError = new Error('Connection refused')
      vi.mocked(mockEnrollmentRepo.create).mockRejectedValue(dbError)
      vi.mocked(isUniqueConstraintError).mockReturnValue(false)

      // Act & Assert
      await expect(enrollmentService.enroll(42, 10)).rejects.toThrow('Connection refused')
    })
  })
})
