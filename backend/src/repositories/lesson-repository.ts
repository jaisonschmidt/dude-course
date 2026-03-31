import type { Lesson, CreateLessonData } from '../models/lesson.js'
import { prisma } from 'database'
import { isRecordNotFoundError } from '../utils/prisma-errors.js'

export interface ILessonRepository {
  create(data: CreateLessonData): Promise<Lesson>
  findById(id: number): Promise<Lesson | null>
  findByCourseId(courseId: number): Promise<Lesson[]>
  update(id: number, data: Partial<CreateLessonData>): Promise<Lesson | null>
  delete(id: number): Promise<boolean>
}

export class PrismaLessonRepository implements ILessonRepository {
  async create(data: CreateLessonData): Promise<Lesson> {
    const lesson = await prisma.lesson.create({
      data: {
        courseId: data.courseId,
        title: data.title,
        description: data.description ?? null,
        youtubeUrl: data.youtubeUrl,
        position: data.position,
      },
    })

    return this.mapToLesson(lesson)
  }

  async findById(id: number): Promise<Lesson | null> {
    const lesson = await prisma.lesson.findUnique({
      where: { id },
    })

    if (!lesson) {
      return null
    }

    return this.mapToLesson(lesson)
  }

  async findByCourseId(courseId: number): Promise<Lesson[]> {
    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      orderBy: { position: 'asc' },
    })

    return lessons.map((l) => this.mapToLesson(l))
  }

  async update(
    id: number,
    data: Partial<CreateLessonData>,
  ): Promise<Lesson | null> {
    try {
      const lesson = await prisma.lesson.update({
        where: { id },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.youtubeUrl !== undefined && { youtubeUrl: data.youtubeUrl }),
          ...(data.position !== undefined && { position: data.position }),
        },
      })

      return this.mapToLesson(lesson)
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        return null
      }
      throw error
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.lesson.delete({
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

  private mapToLesson(lesson: any): Lesson {
    return {
      id: lesson.id,
      courseId: lesson.courseId,
      title: lesson.title,
      description: lesson.description,
      youtubeUrl: lesson.youtubeUrl,
      position: lesson.position,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
    }
  }
}
