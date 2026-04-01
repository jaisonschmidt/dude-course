import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DashboardService } from '../../../src/services/dashboard-service.js'
import type { IEnrollmentRepository } from '../../../src/repositories/enrollment-repository.js'
import type { ICourseRepository } from '../../../src/repositories/course-repository.js'
import type { ILessonRepository } from '../../../src/repositories/lesson-repository.js'
import type { ILessonProgressRepository } from '../../../src/repositories/lesson-progress-repository.js'
import type { ICertificateRepository } from '../../../src/repositories/certificate-repository.js'

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
  }
}

function createMockLessonProgressRepository(): ILessonProgressRepository {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findByUserAndLesson: vi.fn(),
    findByCourseProgress: vi.fn(),
    delete: vi.fn(),
  }
}

function createMockCertificateRepository(): ICertificateRepository {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findByUserAndCourse: vi.fn(),
    findByUserId: vi.fn(),
    findByCertificateCode: vi.fn(),
    delete: vi.fn(),
  }
}

const now = new Date('2026-01-20T14:00:00.000Z')

function createEnrollment(overrides = {}) {
  return {
    id: 1,
    userId: 42,
    courseId: 1,
    startedAt: new Date('2026-01-15T10:00:00.000Z'),
    completedAt: null as Date | null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

function createCourse(overrides = {}) {
  return {
    id: 1,
    title: 'Node.js Fundamentals',
    description: 'Learn Node.js',
    thumbnailUrl: 'https://example.com/thumb.jpg',
    status: 'published' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

function createLesson(id: number, courseId: number, position: number) {
  return {
    id,
    courseId,
    title: `Lesson ${position}`,
    description: null,
    youtubeUrl: `https://youtube.com/watch?v=test${id}`,
    position,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

function createProgress(id: number, userId: number, courseId: number, lessonId: number) {
  return {
    id,
    userId,
    courseId,
    lessonId,
    completedAt: now,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

function createCertificate(overrides = {}) {
  return {
    id: 1,
    userId: 42,
    courseId: 2,
    certificateCode: 'cert-uuid-1234',
    issuedAt: now,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

describe('DashboardService', () => {
  let service: DashboardService
  let enrollmentRepo: IEnrollmentRepository
  let courseRepo: ICourseRepository
  let lessonRepo: ILessonRepository
  let progressRepo: ILessonProgressRepository
  let certificateRepo: ICertificateRepository

  beforeEach(() => {
    enrollmentRepo = createMockEnrollmentRepository()
    courseRepo = createMockCourseRepository()
    lessonRepo = createMockLessonRepository()
    progressRepo = createMockLessonProgressRepository()
    certificateRepo = createMockCertificateRepository()
    service = new DashboardService(enrollmentRepo, courseRepo, lessonRepo, progressRepo, certificateRepo)
  })

  describe('getDashboard', () => {
    it('AC-04: should return empty lists when learner has no enrollments', async () => {
      vi.mocked(enrollmentRepo.findByUserId).mockResolvedValue([])
      vi.mocked(certificateRepo.findByUserId).mockResolvedValue([])

      const result = await service.getDashboard(42)

      expect(result).toEqual({ inProgress: [], completed: [], certificates: [] })
    })

    it('AC-01: should return in-progress courses with progress stats', async () => {
      vi.mocked(enrollmentRepo.findByUserId).mockResolvedValue([
        createEnrollment({ completedAt: null }),
      ])
      vi.mocked(courseRepo.findById).mockResolvedValue(createCourse())
      vi.mocked(lessonRepo.findByCourseId).mockResolvedValue([
        createLesson(1, 1, 1),
        createLesson(2, 1, 2),
        createLesson(3, 1, 3),
        createLesson(4, 1, 4),
        createLesson(5, 1, 5),
        createLesson(6, 1, 6),
        createLesson(7, 1, 7),
        createLesson(8, 1, 8),
        createLesson(9, 1, 9),
        createLesson(10, 1, 10),
      ])
      vi.mocked(progressRepo.findByCourseProgress).mockResolvedValue([
        createProgress(1, 42, 1, 1),
        createProgress(2, 42, 1, 2),
        createProgress(3, 42, 1, 3),
      ])
      vi.mocked(certificateRepo.findByUserId).mockResolvedValue([])

      const result = await service.getDashboard(42)

      expect(result.inProgress).toHaveLength(1)
      expect(result.inProgress[0]).toEqual({
        courseId: 1,
        title: 'Node.js Fundamentals',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        progress: { completed: 3, total: 10, percentage: 30 },
      })
      expect(result.completed).toHaveLength(0)
    })

    it('AC-02: should return completed courses with completedAt', async () => {
      vi.mocked(enrollmentRepo.findByUserId).mockResolvedValue([
        createEnrollment({ courseId: 2, completedAt: now }),
      ])
      vi.mocked(courseRepo.findById).mockResolvedValue(
        createCourse({ id: 2, title: 'TypeScript Mastery' }),
      )
      vi.mocked(certificateRepo.findByUserId).mockResolvedValue([])

      const result = await service.getDashboard(42)

      expect(result.completed).toHaveLength(1)
      expect(result.completed[0]).toEqual({
        courseId: 2,
        title: 'TypeScript Mastery',
        completedAt: now.toISOString(),
      })
      expect(result.inProgress).toHaveLength(0)
    })

    it('AC-03: should return certificates with course title and code', async () => {
      vi.mocked(enrollmentRepo.findByUserId).mockResolvedValue([])
      vi.mocked(certificateRepo.findByUserId).mockResolvedValue([createCertificate()])
      vi.mocked(courseRepo.findById).mockResolvedValue(
        createCourse({ id: 2, title: 'TypeScript Mastery' }),
      )

      const result = await service.getDashboard(42)

      expect(result.certificates).toHaveLength(1)
      expect(result.certificates[0]).toEqual({
        courseId: 2,
        title: 'TypeScript Mastery',
        certificateCode: 'cert-uuid-1234',
        issuedAt: now.toISOString(),
      })
    })

    it('should handle mixed state — in-progress, completed, and certificates', async () => {
      vi.mocked(enrollmentRepo.findByUserId).mockResolvedValue([
        createEnrollment({ id: 1, courseId: 1, completedAt: null }),
        createEnrollment({ id: 2, courseId: 2, completedAt: now }),
      ])
      vi.mocked(courseRepo.findById)
        .mockResolvedValueOnce(createCourse({ id: 1, title: 'Course In Progress' }))
        .mockResolvedValueOnce(createCourse({ id: 2, title: 'Course Completed' }))
        .mockResolvedValueOnce(createCourse({ id: 2, title: 'Course Completed' }))
      vi.mocked(lessonRepo.findByCourseId).mockResolvedValue([createLesson(1, 1, 1)])
      vi.mocked(progressRepo.findByCourseProgress).mockResolvedValue([])
      vi.mocked(certificateRepo.findByUserId).mockResolvedValue([
        createCertificate({ courseId: 2 }),
      ])

      const result = await service.getDashboard(42)

      expect(result.inProgress).toHaveLength(1)
      expect(result.completed).toHaveLength(1)
      expect(result.certificates).toHaveLength(1)
    })

    it('should calculate percentage as floor (no rounding up)', async () => {
      vi.mocked(enrollmentRepo.findByUserId).mockResolvedValue([
        createEnrollment({ completedAt: null }),
      ])
      vi.mocked(courseRepo.findById).mockResolvedValue(createCourse())
      vi.mocked(lessonRepo.findByCourseId).mockResolvedValue([
        createLesson(1, 1, 1),
        createLesson(2, 1, 2),
        createLesson(3, 1, 3),
      ])
      vi.mocked(progressRepo.findByCourseProgress).mockResolvedValue([
        createProgress(1, 42, 1, 1),
      ])
      vi.mocked(certificateRepo.findByUserId).mockResolvedValue([])

      const result = await service.getDashboard(42)

      // 1/3 = 33.33... → floor = 33
      expect(result.inProgress[0]!.progress.percentage).toBe(33)
    })

    it('should return 0% progress when course has no lessons', async () => {
      vi.mocked(enrollmentRepo.findByUserId).mockResolvedValue([
        createEnrollment({ completedAt: null }),
      ])
      vi.mocked(courseRepo.findById).mockResolvedValue(createCourse())
      vi.mocked(lessonRepo.findByCourseId).mockResolvedValue([])
      vi.mocked(progressRepo.findByCourseProgress).mockResolvedValue([])
      vi.mocked(certificateRepo.findByUserId).mockResolvedValue([])

      const result = await service.getDashboard(42)

      expect(result.inProgress[0]!.progress).toEqual({
        completed: 0,
        total: 0,
        percentage: 0,
      })
    })

    it('should skip enrollments for courses that no longer exist', async () => {
      vi.mocked(enrollmentRepo.findByUserId).mockResolvedValue([
        createEnrollment({ courseId: 999 }),
      ])
      vi.mocked(courseRepo.findById).mockResolvedValue(null)
      vi.mocked(certificateRepo.findByUserId).mockResolvedValue([])

      const result = await service.getDashboard(42)

      expect(result.inProgress).toHaveLength(0)
      expect(result.completed).toHaveLength(0)
    })
  })
})
