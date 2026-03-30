import type { Course, CreateCourseData, CourseStatus } from '../models/course.js'
import { prisma } from 'database'

export interface ICourseRepository {
  create(data: CreateCourseData): Promise<Course>
  findById(id: number): Promise<Course | null>
  findByStatus(status: CourseStatus): Promise<Course[]>
  findPublished(page: number, pageSize: number): Promise<Course[]>
  countByStatus(status: CourseStatus): Promise<number>
  update(id: number, data: Partial<CreateCourseData>): Promise<Course | null>
  delete(id: number): Promise<boolean>
}

export class PrismaCourseRepository implements ICourseRepository {
  async create(data: CreateCourseData): Promise<Course> {
    const course = await prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        thumbnailUrl: data.thumbnailUrl ?? null,
        status: data.status ?? 'draft',
      },
    })

    return this.mapToCourse(course)
  }

  async findById(id: number): Promise<Course | null> {
    const course = await prisma.course.findUnique({
      where: { id },
    })

    if (!course) {
      return null
    }

    return this.mapToCourse(course)
  }

  async findByStatus(status: CourseStatus): Promise<Course[]> {
    const courses = await prisma.course.findMany({
      where: { status },
    })

    return courses.map((c) => this.mapToCourse(c))
  }

  async findPublished(page: number, pageSize: number): Promise<Course[]> {
    const courses = await prisma.course.findMany({
      where: { status: 'published' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    })

    return courses.map((c) => this.mapToCourse(c))
  }

  async countByStatus(status: CourseStatus): Promise<number> {
    return prisma.course.count({
      where: { status },
    })
  }

  async update(
    id: number,
    data: Partial<CreateCourseData>,
  ): Promise<Course | null> {
    try {
      const course = await prisma.course.update({
        where: { id },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.thumbnailUrl !== undefined && { thumbnailUrl: data.thumbnailUrl }),
          ...(data.status !== undefined && { status: data.status }),
        },
      })

      return this.mapToCourse(course)
    } catch {
      return null
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.course.delete({
        where: { id },
      })
      return true
    } catch {
      return false
    }
  }

  private mapToCourse(course: any): Course {
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl,
      status: course.status,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    }
  }
}
