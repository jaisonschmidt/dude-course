import type { Certificate } from '../models/certificate.js'
import type { ICertificateRepository } from '../repositories/certificate-repository.js'
import type { IEnrollmentRepository } from '../repositories/enrollment-repository.js'
import type { ICourseRepository } from '../repositories/course-repository.js'
import type { IUserRepository } from '../repositories/user-repository.js'
import { NotFoundError, ForbiddenError } from '../models/errors.js'
import { isUniqueConstraintError } from '../utils/prisma-errors.js'
import { randomUUID } from 'node:crypto'

export interface CertificateResult {
  certificate: Certificate
  courseName: string
  learnerName: string
  isNew: boolean
}

export class CertificateService {
  constructor(
    private readonly certificateRepository: ICertificateRepository,
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly courseRepository: ICourseRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async generateOrGet(userId: number, courseId: number): Promise<CertificateResult> {
    // 1. Verify enrollment exists
    const enrollment = await this.enrollmentRepository.findByUserAndCourse(userId, courseId)

    if (!enrollment) {
      throw new NotFoundError('Enrollment not found')
    }

    // 2. Verify course is completed
    if (!enrollment.completedAt) {
      throw new ForbiddenError('Course not completed')
    }

    // 3. Check if certificate already exists (idempotent)
    const existing = await this.certificateRepository.findByUserAndCourse(userId, courseId)

    if (existing) {
      return this.enrichCertificate(existing, userId, courseId, false)
    }

    // 4. Generate new certificate — catch TOCTOU race condition
    let certificate: Certificate
    try {
      certificate = await this.certificateRepository.create({
        userId,
        courseId,
        certificateCode: randomUUID(),
      })
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        const raceCertificate = await this.certificateRepository.findByUserAndCourse(
          userId,
          courseId,
        )
        if (raceCertificate) {
          return this.enrichCertificate(raceCertificate, userId, courseId, false)
        }
      }
      throw error
    }

    return this.enrichCertificate(certificate, userId, courseId, true)
  }

  private async enrichCertificate(
    certificate: Certificate,
    userId: number,
    courseId: number,
    isNew: boolean,
  ): Promise<CertificateResult> {
    const [course, user] = await Promise.all([
      this.courseRepository.findById(courseId),
      this.userRepository.findById(userId),
    ])

    return {
      certificate,
      courseName: course?.title ?? 'Unknown Course',
      learnerName: user?.name ?? 'Unknown User',
      isNew,
    }
  }
}
