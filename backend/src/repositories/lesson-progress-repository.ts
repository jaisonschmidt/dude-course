import type { LessonProgress, CreateLessonProgressData } from '../models/lesson-progress.js'

export interface ILessonProgressRepository {
  findByUserAndLesson(userId: number, lessonId: number): Promise<LessonProgress | null>
  findByUserAndCourse(userId: number, courseId: number): Promise<LessonProgress[]>
  create(data: CreateLessonProgressData): Promise<LessonProgress>
}

export class PrismaLessonProgressRepository implements ILessonProgressRepository {
  async findByUserAndLesson(_userId: number, _lessonId: number): Promise<LessonProgress | null> {
    // TODO: implement with Prisma
    throw new Error('PrismaLessonProgressRepository.findByUserAndLesson not implemented')
  }

  async findByUserAndCourse(_userId: number, _courseId: number): Promise<LessonProgress[]> {
    // TODO: implement with Prisma
    throw new Error('PrismaLessonProgressRepository.findByUserAndCourse not implemented')
  }

  async create(_data: CreateLessonProgressData): Promise<LessonProgress> {
    // TODO: implement with Prisma
    throw new Error('PrismaLessonProgressRepository.create not implemented')
  }
}
