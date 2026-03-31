import type { Enrollment } from '../models/enrollment.js'
import type { IEnrollmentRepository } from '../repositories/enrollment-repository.js'
import type { ICourseRepository } from '../repositories/course-repository.js'
import { NotFoundError } from '../models/errors.js'

export interface EnrollResult {
  enrollment: Enrollment
  created: boolean
}

export class EnrollmentService {
  constructor(
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly courseRepository: ICourseRepository,
  ) {}

  async enroll(userId: number, courseId: number): Promise<EnrollResult> {
    // 1. Verify course exists and is published
    const course = await this.courseRepository.findById(courseId)

    if (!course || course.status !== 'published') {
      throw new NotFoundError('Course not found')
    }

    // 2. Check if already enrolled (idempotent)
    const existing = await this.enrollmentRepository.findByUserAndCourse(userId, courseId)

    if (existing) {
      return { enrollment: existing, created: false }
    }

    // 3. Create new enrollment
    const enrollment = await this.enrollmentRepository.create({ userId, courseId })

    return { enrollment, created: true }
  }
}
