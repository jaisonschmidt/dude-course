import type { LessonProgress } from '../models/lesson-progress.js'
import type { ILessonProgressRepository } from '../repositories/lesson-progress-repository.js'
import type { ILessonRepository } from '../repositories/lesson-repository.js'
import type { IEnrollmentRepository } from '../repositories/enrollment-repository.js'
import { NotFoundError } from '../models/errors.js'
import { isUniqueConstraintError } from '../utils/prisma-errors.js'

export class LessonProgressService {
  constructor(
    private readonly lessonProgressRepository: ILessonProgressRepository,
    private readonly lessonRepository: ILessonRepository,
    private readonly enrollmentRepository: IEnrollmentRepository,
  ) {}

  async markCompleted(
    userId: number,
    courseId: number,
    lessonId: number,
  ): Promise<{ progress: LessonProgress; autoCompleted: boolean }> {
    // 1. Verify lesson exists and belongs to the course
    const lesson = await this.lessonRepository.findById(lessonId)

    if (!lesson || lesson.courseId !== courseId) {
      throw new NotFoundError('Lesson not found in this course')
    }

    // 2. Verify learner is enrolled in the course
    const enrollment = await this.enrollmentRepository.findByUserAndCourse(userId, courseId)

    if (!enrollment) {
      throw new NotFoundError('Enrollment not found')
    }

    // 3. Check if already completed (idempotent)
    const existing = await this.lessonProgressRepository.findByUserAndLesson(userId, lessonId)

    if (existing) {
      return { progress: existing, autoCompleted: false }
    }

    // 4. Create progress record — catch TOCTOU race condition
    let progress: LessonProgress
    try {
      progress = await this.lessonProgressRepository.create({
        userId,
        courseId,
        lessonId,
      })
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        const raceProgress = await this.lessonProgressRepository.findByUserAndLesson(userId, lessonId)
        if (raceProgress) {
          return { progress: raceProgress, autoCompleted: false }
        }
      }
      throw error
    }

    // 5. Check auto-completion: if all lessons of the course are completed
    const autoCompleted = await this.checkAutoCompletion(userId, courseId, enrollment.id)

    return { progress, autoCompleted }
  }

  private async checkAutoCompletion(
    userId: number,
    courseId: number,
    enrollmentId: number,
  ): Promise<boolean> {
    const [allLessons, completedProgress] = await Promise.all([
      this.lessonRepository.findByCourseId(courseId),
      this.lessonProgressRepository.findByCourseProgress(userId, courseId),
    ])

    if (allLessons.length === 0) {
      return false
    }

    if (completedProgress.length >= allLessons.length) {
      await this.enrollmentRepository.markCompleted(enrollmentId, new Date())
      return true
    }

    return false
  }
}
