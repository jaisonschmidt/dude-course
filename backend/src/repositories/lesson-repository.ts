import type { Lesson, CreateLessonData } from '../models/lesson.js'

export interface ILessonRepository {
  findById(id: number): Promise<Lesson | null>
  findByCourseId(courseId: number): Promise<Lesson[]>
  create(data: CreateLessonData): Promise<Lesson>
}

export class PrismaLessonRepository implements ILessonRepository {
  async findById(_id: number): Promise<Lesson | null> {
    // TODO: implement with Prisma
    throw new Error('PrismaLessonRepository.findById not implemented')
  }

  async findByCourseId(_courseId: number): Promise<Lesson[]> {
    // TODO: implement with Prisma
    throw new Error('PrismaLessonRepository.findByCourseId not implemented')
  }

  async create(_data: CreateLessonData): Promise<Lesson> {
    // TODO: implement with Prisma
    throw new Error('PrismaLessonRepository.create not implemented')
  }
}
