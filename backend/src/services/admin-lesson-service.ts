import type { Lesson, CreateLessonData } from '../models/lesson.js'
import type { ILessonRepository } from '../repositories/lesson-repository.js'
import type { ICourseRepository } from '../repositories/course-repository.js'
import { NotFoundError, ConflictError, BadRequestError } from '../models/errors.js'
import { isUniqueConstraintError } from '../utils/prisma-errors.js'

export interface CreateLessonInput {
  title: string
  description?: string
  youtubeUrl: string
  position: number
}

export interface UpdateLessonInput {
  title?: string
  description?: string | null
  youtubeUrl?: string
  position?: number
}

export interface ReorderLessonItem {
  lessonId: number
  position: number
}

export class AdminLessonService {
  constructor(
    private readonly lessonRepository: ILessonRepository,
    private readonly courseRepository: ICourseRepository,
  ) {}

  async create(courseId: number, data: CreateLessonInput): Promise<Lesson> {
    // Verify course exists
    const course = await this.courseRepository.findById(courseId)
    if (!course) {
      throw new NotFoundError('Course not found')
    }

    const lessonData: CreateLessonData = {
      courseId,
      title: data.title,
      description: data.description ?? null,
      youtubeUrl: data.youtubeUrl,
      position: data.position,
    }

    try {
      return await this.lessonRepository.create(lessonData)
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictError(
          `Position ${data.position} is already taken in this course`,
        )
      }
      throw error
    }
  }

  async update(
    courseId: number,
    lessonId: number,
    data: UpdateLessonInput,
  ): Promise<Lesson> {
    // Verify course exists
    const course = await this.courseRepository.findById(courseId)
    if (!course) {
      throw new NotFoundError('Course not found')
    }

    // Verify lesson exists and belongs to course
    const lesson = await this.lessonRepository.findById(lessonId)
    if (!lesson || lesson.courseId !== courseId) {
      throw new NotFoundError('Lesson not found in this course')
    }

    const updateData: Partial<CreateLessonData> = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.youtubeUrl !== undefined) updateData.youtubeUrl = data.youtubeUrl
    if (data.position !== undefined) updateData.position = data.position

    try {
      const updated = await this.lessonRepository.update(lessonId, updateData)
      if (!updated) {
        throw new NotFoundError('Lesson not found')
      }
      return updated
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictError(
          `Position ${data.position} is already taken in this course`,
        )
      }
      throw error
    }
  }

  async delete(courseId: number, lessonId: number): Promise<void> {
    // Verify course exists
    const course = await this.courseRepository.findById(courseId)
    if (!course) {
      throw new NotFoundError('Course not found')
    }

    // Verify lesson exists and belongs to course
    const lesson = await this.lessonRepository.findById(lessonId)
    if (!lesson || lesson.courseId !== courseId) {
      throw new NotFoundError('Lesson not found in this course')
    }

    const deleted = await this.lessonRepository.delete(lessonId)
    if (!deleted) {
      throw new NotFoundError('Lesson not found')
    }
  }

  async reorder(
    courseId: number,
    items: ReorderLessonItem[],
  ): Promise<Lesson[]> {
    // Verify course exists
    const course = await this.courseRepository.findById(courseId)
    if (!course) {
      throw new NotFoundError('Course not found')
    }

    // Verify all lessons exist and belong to the course
    const courseLessons = await this.lessonRepository.findByCourseId(courseId)
    const courseLessonIds = new Set(courseLessons.map((l) => l.id))

    for (const item of items) {
      if (!courseLessonIds.has(item.lessonId)) {
        throw new NotFoundError(
          `Lesson ${item.lessonId} not found in this course`,
        )
      }
    }

    // Check for duplicate positions
    const positions = items.map((i) => i.position)
    const uniquePositions = new Set(positions)
    if (uniquePositions.size !== positions.length) {
      throw new BadRequestError('Duplicate positions are not allowed')
    }

    // Check for duplicate lesson IDs
    const lessonIds = items.map((i) => i.lessonId)
    const uniqueLessonIds = new Set(lessonIds)
    if (uniqueLessonIds.size !== lessonIds.length) {
      throw new BadRequestError('Duplicate lesson IDs are not allowed')
    }

    // Use a two-phase approach to avoid unique constraint violations:
    // Phase 1: Move all affected lessons to temporary negative positions
    // Phase 2: Set final positions
    const tempUpdates = items.map((item, index) => ({
      id: item.lessonId,
      position: -(index + 1),
    }))
    await this.lessonRepository.updatePositions(tempUpdates)

    const finalUpdates = items.map((item) => ({
      id: item.lessonId,
      position: item.position,
    }))
    await this.lessonRepository.updatePositions(finalUpdates)

    // Return updated lessons in order
    return this.lessonRepository.findByCourseId(courseId)
  }
}
