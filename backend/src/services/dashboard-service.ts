import type { IEnrollmentRepository } from '../repositories/enrollment-repository.js'
import type { ICourseRepository } from '../repositories/course-repository.js'
import type { ILessonRepository } from '../repositories/lesson-repository.js'
import type { ILessonProgressRepository } from '../repositories/lesson-progress-repository.js'
import type { ICertificateRepository } from '../repositories/certificate-repository.js'
import type {
  DashboardResponseDto,
  DashboardInProgressDto,
  DashboardCompletedDto,
  DashboardCertificateDto,
} from '../dto/dashboard-dto.js'

export class DashboardService {
  constructor(
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly courseRepository: ICourseRepository,
    private readonly lessonRepository: ILessonRepository,
    private readonly lessonProgressRepository: ILessonProgressRepository,
    private readonly certificateRepository: ICertificateRepository,
  ) {}

  async getDashboard(userId: number): Promise<DashboardResponseDto> {
    const enrollments = await this.enrollmentRepository.findByUserId(userId)

    const inProgress: DashboardInProgressDto[] = []
    const completed: DashboardCompletedDto[] = []

    for (const enrollment of enrollments) {
      const course = await this.courseRepository.findById(enrollment.courseId)
      if (!course) continue

      if (enrollment.completedAt) {
        completed.push({
          courseId: course.id,
          title: course.title,
          completedAt: enrollment.completedAt.toISOString(),
        })
      } else {
        const [allLessons, completedProgress] = await Promise.all([
          this.lessonRepository.findByCourseId(course.id),
          this.lessonProgressRepository.findByCourseProgress(userId, course.id),
        ])

        const total = allLessons.length
        const completedCount = completedProgress.length
        const percentage = total === 0 ? 0 : Math.floor((completedCount / total) * 100)

        inProgress.push({
          courseId: course.id,
          title: course.title,
          thumbnailUrl: course.thumbnailUrl,
          progress: { completed: completedCount, total, percentage },
        })
      }
    }

    // Fetch certificates for completed courses
    const userCertificates = await this.certificateRepository.findByUserId(userId)
    const certificates: DashboardCertificateDto[] = []

    for (const cert of userCertificates) {
      const course = await this.courseRepository.findById(cert.courseId)
      certificates.push({
        courseId: cert.courseId,
        title: course?.title ?? 'Unknown Course',
        certificateCode: cert.certificateCode,
        issuedAt: cert.issuedAt.toISOString(),
      })
    }

    return { inProgress, completed, certificates }
  }
}
