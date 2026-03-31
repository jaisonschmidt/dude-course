import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CertificateService } from '../../../src/services/certificate-service.js'
import type { ICertificateRepository } from '../../../src/repositories/certificate-repository.js'
import type { IEnrollmentRepository } from '../../../src/repositories/enrollment-repository.js'
import type { ICourseRepository } from '../../../src/repositories/course-repository.js'
import type { IUserRepository } from '../../../src/repositories/user-repository.js'
import { NotFoundError, ForbiddenError } from '../../../src/models/errors.js'

function createMockCertificateRepository(): ICertificateRepository {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findByUserAndCourse: vi.fn(),
    findByCertificateCode: vi.fn(),
    delete: vi.fn(),
  }
}

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

function createMockUserRepository(): IUserRepository {
  return {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
  }
}

const now = new Date('2026-01-20T14:05:00.000Z')

function createEnrollment(overrides = {}) {
  return {
    id: 1,
    userId: 42,
    courseId: 1,
    startedAt: new Date('2026-01-15T10:00:00.000Z'),
    completedAt: now,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

function createCertificate(overrides = {}) {
  return {
    id: 1,
    userId: 42,
    courseId: 1,
    certificateCode: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    issuedAt: now,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

function createCourse(overrides = {}) {
  return {
    id: 1,
    title: 'TypeScript Mastery',
    description: 'Master TypeScript',
    thumbnailUrl: null,
    status: 'published' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

function createUser(overrides = {}) {
  return {
    id: 42,
    name: 'Jane Doe',
    email: 'jane@example.com',
    passwordHash: 'hashed',
    role: 'learner' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

describe('CertificateService', () => {
  let service: CertificateService
  let certificateRepo: ICertificateRepository
  let enrollmentRepo: IEnrollmentRepository
  let courseRepo: ICourseRepository
  let userRepo: IUserRepository

  beforeEach(() => {
    certificateRepo = createMockCertificateRepository()
    enrollmentRepo = createMockEnrollmentRepository()
    courseRepo = createMockCourseRepository()
    userRepo = createMockUserRepository()
    service = new CertificateService(certificateRepo, enrollmentRepo, courseRepo, userRepo)
  })

  describe('generateOrGet', () => {
    it('should generate a new certificate for a completed course', async () => {
      vi.mocked(enrollmentRepo.findByUserAndCourse).mockResolvedValue(createEnrollment())
      vi.mocked(certificateRepo.findByUserAndCourse).mockResolvedValue(null)
      vi.mocked(certificateRepo.create).mockResolvedValue(createCertificate())
      vi.mocked(courseRepo.findById).mockResolvedValue(createCourse())
      vi.mocked(userRepo.findById).mockResolvedValue(createUser())

      const result = await service.generateOrGet(42, 1)

      expect(result.certificate.id).toBe(1)
      expect(result.certificate.certificateCode).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890')
      expect(result.courseName).toBe('TypeScript Mastery')
      expect(result.learnerName).toBe('Jane Doe')
      expect(certificateRepo.create).toHaveBeenCalledOnce()
    })

    it('should return existing certificate when already generated (idempotent)', async () => {
      vi.mocked(enrollmentRepo.findByUserAndCourse).mockResolvedValue(createEnrollment())
      vi.mocked(certificateRepo.findByUserAndCourse).mockResolvedValue(createCertificate())
      vi.mocked(courseRepo.findById).mockResolvedValue(createCourse())
      vi.mocked(userRepo.findById).mockResolvedValue(createUser())

      const result = await service.generateOrGet(42, 1)

      expect(result.certificate.certificateCode).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890')
      expect(certificateRepo.create).not.toHaveBeenCalled()
    })

    it('should throw NotFoundError when user is not enrolled', async () => {
      vi.mocked(enrollmentRepo.findByUserAndCourse).mockResolvedValue(null)

      await expect(service.generateOrGet(42, 1)).rejects.toThrow(NotFoundError)
      await expect(service.generateOrGet(42, 1)).rejects.toThrow('Enrollment not found')
    })

    it('should throw ForbiddenError when course is not completed', async () => {
      vi.mocked(enrollmentRepo.findByUserAndCourse).mockResolvedValue(
        createEnrollment({ completedAt: null }),
      )

      await expect(service.generateOrGet(42, 1)).rejects.toThrow(ForbiddenError)
      await expect(service.generateOrGet(42, 1)).rejects.toThrow('Course not completed')
    })

    it('should handle TOCTOU race condition on certificate create (P2002)', async () => {
      const p2002Error = Object.assign(new Error('Unique constraint'), {
        name: 'PrismaClientKnownRequestError',
        code: 'P2002',
      })

      vi.mocked(enrollmentRepo.findByUserAndCourse).mockResolvedValue(createEnrollment())
      vi.mocked(certificateRepo.findByUserAndCourse)
        .mockResolvedValueOnce(null) // first check: not found
        .mockResolvedValueOnce(createCertificate()) // after race: found
      vi.mocked(certificateRepo.create).mockRejectedValue(p2002Error)
      vi.mocked(courseRepo.findById).mockResolvedValue(createCourse())
      vi.mocked(userRepo.findById).mockResolvedValue(createUser())

      const result = await service.generateOrGet(42, 1)

      expect(result.certificate.certificateCode).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890')
    })

    it('should rethrow non-unique constraint errors from create', async () => {
      const dbError = new Error('Connection lost')

      vi.mocked(enrollmentRepo.findByUserAndCourse).mockResolvedValue(createEnrollment())
      vi.mocked(certificateRepo.findByUserAndCourse).mockResolvedValue(null)
      vi.mocked(certificateRepo.create).mockRejectedValue(dbError)

      await expect(service.generateOrGet(42, 1)).rejects.toThrow('Connection lost')
    })

    it('should check enrollment before certificate — fail-fast ordering', async () => {
      vi.mocked(enrollmentRepo.findByUserAndCourse).mockResolvedValue(null)

      await expect(service.generateOrGet(42, 1)).rejects.toThrow(NotFoundError)

      expect(certificateRepo.findByUserAndCourse).not.toHaveBeenCalled()
      expect(certificateRepo.create).not.toHaveBeenCalled()
    })

    it('should generate unique certificateCode (UUID) for each new certificate', async () => {
      vi.mocked(enrollmentRepo.findByUserAndCourse).mockResolvedValue(createEnrollment())
      vi.mocked(certificateRepo.findByUserAndCourse).mockResolvedValue(null)
      vi.mocked(certificateRepo.create).mockImplementation(async (data) => createCertificate({ certificateCode: data.certificateCode }))
      vi.mocked(courseRepo.findById).mockResolvedValue(createCourse())
      vi.mocked(userRepo.findById).mockResolvedValue(createUser())

      await service.generateOrGet(42, 1)

      const createCall = vi.mocked(certificateRepo.create).mock.calls[0]![0]
      expect(createCall.certificateCode).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      )
    })
  })
})
