import type { Course } from '../models/course.js'
import type { Lesson } from '../models/lesson.js'
import type { ICourseRepository } from '../repositories/course-repository.js'
import type { ILessonRepository } from '../repositories/lesson-repository.js'
import { NotFoundError } from '../models/errors.js'

export interface PaginatedResult<T> {
  data: T[]
  meta: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
}

export interface CourseWithLessons extends Course {
  lessons: Lesson[]
}

export class CourseService {
  constructor(
    private readonly courseRepository: ICourseRepository,
    private readonly lessonRepository: ILessonRepository,
  ) {}

  async listPublished(page: number, pageSize: number): Promise<PaginatedResult<Course>> {
    const [courses, totalItems] = await Promise.all([
      this.courseRepository.findPublished(page, pageSize),
      this.courseRepository.countByStatus('published'),
    ])

    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize)

    return {
      data: courses,
      meta: { page, pageSize, totalItems, totalPages },
    }
  }

  async getById(id: number): Promise<CourseWithLessons> {
    const course = await this.courseRepository.findById(id)

    if (!course || course.status !== 'published') {
      throw new NotFoundError('Course not found')
    }

    const lessons = await this.lessonRepository.findByCourseId(id)

    return { ...course, lessons }
  }
}
