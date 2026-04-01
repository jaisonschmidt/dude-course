import type { Course, CreateCourseData } from '../models/course.js'
import type { ICourseRepository } from '../repositories/course-repository.js'
import type { ILessonRepository } from '../repositories/lesson-repository.js'
import { NotFoundError, BadRequestError } from '../models/errors.js'

export interface CreateCourseInput {
  title: string
  description: string
  thumbnailUrl?: string
}

export interface UpdateCourseInput {
  title?: string
  description?: string
  thumbnailUrl?: string | null
}

export class AdminCourseService {
  constructor(
    private readonly courseRepository: ICourseRepository,
    private readonly lessonRepository: ILessonRepository,
  ) {}

  async listAll(
    page: number,
    pageSize: number,
  ): Promise<{
    data: Course[]
    meta: { page: number; pageSize: number; totalItems: number; totalPages: number }
  }> {
    const [courses, totalItems] = await Promise.all([
      this.courseRepository.findAll(page, pageSize),
      this.courseRepository.countAll(),
    ])

    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize)

    return {
      data: courses,
      meta: { page, pageSize, totalItems, totalPages },
    }
  }

  async create(data: CreateCourseInput): Promise<Course> {
    const courseData: CreateCourseData = {
      title: data.title,
      description: data.description,
      thumbnailUrl: data.thumbnailUrl ?? null,
      status: 'draft',
    }

    return this.courseRepository.create(courseData)
  }

  async update(id: number, data: UpdateCourseInput): Promise<Course> {
    const updateData: Partial<CreateCourseData> = {}

    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.thumbnailUrl !== undefined) updateData.thumbnailUrl = data.thumbnailUrl

    const course = await this.courseRepository.update(id, updateData)

    if (!course) {
      throw new NotFoundError('Course not found')
    }

    return course
  }

  async publish(id: number): Promise<Course> {
    const course = await this.courseRepository.findById(id)

    if (!course) {
      throw new NotFoundError('Course not found')
    }

    // Validate prerequisites
    const errors: string[] = []

    if (!course.title || course.title.trim() === '') {
      errors.push('Course title must not be empty')
    }

    if (!course.description || course.description.trim() === '') {
      errors.push('Course description must not be empty')
    }

    const lessons = await this.lessonRepository.findByCourseId(id)
    if (lessons.length === 0) {
      errors.push('Course must have at least one lesson')
    }

    if (errors.length > 0) {
      throw new BadRequestError(
        `Cannot publish course: ${errors.join('; ')}`,
      )
    }

    const updated = await this.courseRepository.update(id, { status: 'published' })

    if (!updated) {
      throw new NotFoundError('Course not found')
    }

    return updated
  }

  async unpublish(id: number): Promise<Course> {
    const updated = await this.courseRepository.update(id, { status: 'unpublished' })

    if (!updated) {
      throw new NotFoundError('Course not found')
    }

    return updated
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.courseRepository.delete(id)

    if (!deleted) {
      throw new NotFoundError('Course not found')
    }
  }
}
