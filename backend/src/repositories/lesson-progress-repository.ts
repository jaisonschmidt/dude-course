import type { LessonProgress, CreateLessonProgressData } from '../models/lesson-progress.js'
import { prisma } from 'database'
import { isRecordNotFoundError } from '../utils/prisma-errors.js'

export interface ILessonProgressRepository {
  create(data: CreateLessonProgressData): Promise<LessonProgress>
  findById(id: number): Promise<LessonProgress | null>
  findByUserAndLesson(userId: number, lessonId: number): Promise<LessonProgress | null>
  findByCourseProgress(userId: number, courseId: number): Promise<LessonProgress[]>
  delete(id: number): Promise<boolean>
}

export class PrismaLessonProgressRepository implements ILessonProgressRepository {
  async create(data: CreateLessonProgressData): Promise<LessonProgress> {
    const progress = await prisma.lessonProgress.create({
      data: {
        userId: data.userId,
        courseId: data.courseId,
        lessonId: data.lessonId,
      },
    })

    return this.mapToLessonProgress(progress)
  }

  async findById(id: number): Promise<LessonProgress | null> {
    const progress = await prisma.lessonProgress.findUnique({
      where: { id },
    })

    if (!progress) {
      return null
    }

    return this.mapToLessonProgress(progress)
  }

  async findByUserAndLesson(userId: number, lessonId: number): Promise<LessonProgress | null> {
    const progress = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: { userId, lessonId },
      },
    })

    if (!progress) {
      return null
    }

    return this.mapToLessonProgress(progress)
  }

  async findByCourseProgress(userId: number, courseId: number): Promise<LessonProgress[]> {
    const progress = await prisma.lessonProgress.findMany({
      where: { userId, courseId },
    })

    return progress.map((p) => this.mapToLessonProgress(p))
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.lessonProgress.delete({
        where: { id },
      })
      return true
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        return false
      }
      throw error
    }
  }

  private mapToLessonProgress(progress: any): LessonProgress {
    return {
      id: progress.id,
      userId: progress.userId,
      courseId: progress.courseId,
      lessonId: progress.lessonId,
      completedAt: progress.completedAt,
      createdAt: progress.createdAt,
      updatedAt: progress.updatedAt,
    }
  }
}
