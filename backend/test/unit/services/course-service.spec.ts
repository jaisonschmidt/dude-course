import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CourseService } from '../../../src/services/course-service.js'
import type { ICourseRepository } from '../../../src/repositories/course-repository.js'
import type { ILessonRepository } from '../../../src/repositories/lesson-repository.js'
import { createCourseFactory, createLessonFactory } from '../../helpers/factories.js'
import { NotFoundError } from '../../../src/models/errors.js'

function createMockCourseRepository(): ICourseRepository {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findByStatus: vi.fn(),
    findPublished: vi.fn(),
    countByStatus: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
}

function createMockLessonRepository(): ILessonRepository {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findByCourseId: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    updatePositions: vi.fn(),
  }
}

describe('CourseService', () => {
  let courseService: CourseService
  let mockCourseRepo: ICourseRepository
  let mockLessonRepo: ILessonRepository

  beforeEach(() => {
    vi.clearAllMocks()
    mockCourseRepo = createMockCourseRepository()
    mockLessonRepo = createMockLessonRepository()
    courseService = new CourseService(mockCourseRepo, mockLessonRepo)
  })

  // ────────────────────────────────────────
  // listPublished
  // ────────────────────────────────────────
  describe('listPublished', () => {
    it('should return published courses with pagination meta', async () => {
      const courses = [
        createCourseFactory({ id: 1, status: 'published' }),
        createCourseFactory({ id: 2, status: 'published' }),
      ]
      vi.mocked(mockCourseRepo.findPublished).mockResolvedValue(courses)
      vi.mocked(mockCourseRepo.countByStatus).mockResolvedValue(2)

      const result = await courseService.listPublished(1, 20)

      expect(result.data).toHaveLength(2)
      expect(result.meta).toEqual({
        page: 1,
        pageSize: 20,
        totalItems: 2,
        totalPages: 1,
      })
      expect(mockCourseRepo.findPublished).toHaveBeenCalledWith(1, 20)
      expect(mockCourseRepo.countByStatus).toHaveBeenCalledWith('published')
    })

    it('should use default page=1 and pageSize=20', async () => {
      vi.mocked(mockCourseRepo.findPublished).mockResolvedValue([])
      vi.mocked(mockCourseRepo.countByStatus).mockResolvedValue(0)

      await courseService.listPublished(1, 20)

      expect(mockCourseRepo.findPublished).toHaveBeenCalledWith(1, 20)
    })

    it('should calculate totalPages correctly', async () => {
      vi.mocked(mockCourseRepo.findPublished).mockResolvedValue([
        createCourseFactory({ status: 'published' }),
      ])
      vi.mocked(mockCourseRepo.countByStatus).mockResolvedValue(23)

      const result = await courseService.listPublished(1, 5)

      expect(result.meta.totalPages).toBe(5) // ceil(23/5)
      expect(result.meta.totalItems).toBe(23)
    })

    it('should return empty data when no published courses exist', async () => {
      vi.mocked(mockCourseRepo.findPublished).mockResolvedValue([])
      vi.mocked(mockCourseRepo.countByStatus).mockResolvedValue(0)

      const result = await courseService.listPublished(1, 20)

      expect(result.data).toEqual([])
      expect(result.meta).toEqual({
        page: 1,
        pageSize: 20,
        totalItems: 0,
        totalPages: 0,
      })
    })

    it('should handle second page correctly', async () => {
      const courses = [
        createCourseFactory({ status: 'published' }),
      ]
      vi.mocked(mockCourseRepo.findPublished).mockResolvedValue(courses)
      vi.mocked(mockCourseRepo.countByStatus).mockResolvedValue(6)

      const result = await courseService.listPublished(2, 5)

      expect(mockCourseRepo.findPublished).toHaveBeenCalledWith(2, 5)
      expect(result.meta.page).toBe(2)
      expect(result.meta.pageSize).toBe(5)
      expect(result.meta.totalItems).toBe(6)
      expect(result.meta.totalPages).toBe(2)
    })
  })

  // ────────────────────────────────────────
  // getById
  // ────────────────────────────────────────
  describe('getById', () => {
    it('should return course with lessons ordered by position', async () => {
      const course = createCourseFactory({ id: 10, status: 'published' })
      const lessons = [
        createLessonFactory({ courseId: 10, position: 1 }),
        createLessonFactory({ courseId: 10, position: 2 }),
        createLessonFactory({ courseId: 10, position: 3 }),
      ]

      vi.mocked(mockCourseRepo.findById).mockResolvedValue(course)
      vi.mocked(mockLessonRepo.findByCourseId).mockResolvedValue(lessons)

      const result = await courseService.getById(10)

      expect(result.id).toBe(10)
      expect(result.lessons).toHaveLength(3)
      expect(result.lessons[0].position).toBe(1)
      expect(result.lessons[2].position).toBe(3)
      expect(mockCourseRepo.findById).toHaveBeenCalledWith(10)
      expect(mockLessonRepo.findByCourseId).toHaveBeenCalledWith(10)
    })

    it('should throw NotFoundError when course does not exist', async () => {
      vi.mocked(mockCourseRepo.findById).mockResolvedValue(null)

      await expect(courseService.getById(999)).rejects.toThrow(NotFoundError)
      await expect(courseService.getById(999)).rejects.toThrow('Course not found')

      expect(mockLessonRepo.findByCourseId).not.toHaveBeenCalled()
    })

    it('should throw NotFoundError when course is not published (draft)', async () => {
      const draftCourse = createCourseFactory({ id: 5, status: 'draft' })
      vi.mocked(mockCourseRepo.findById).mockResolvedValue(draftCourse)

      await expect(courseService.getById(5)).rejects.toThrow(NotFoundError)
      await expect(courseService.getById(5)).rejects.toThrow('Course not found')

      expect(mockLessonRepo.findByCourseId).not.toHaveBeenCalled()
    })

    it('should throw NotFoundError when course is unpublished', async () => {
      const unpublishedCourse = createCourseFactory({ id: 7, status: 'unpublished' })
      vi.mocked(mockCourseRepo.findById).mockResolvedValue(unpublishedCourse)

      await expect(courseService.getById(7)).rejects.toThrow(NotFoundError)
    })

    it('should return course with empty lessons array when no lessons exist', async () => {
      const course = createCourseFactory({ id: 15, status: 'published' })
      vi.mocked(mockCourseRepo.findById).mockResolvedValue(course)
      vi.mocked(mockLessonRepo.findByCourseId).mockResolvedValue([])

      const result = await courseService.getById(15)

      expect(result.id).toBe(15)
      expect(result.lessons).toEqual([])
    })
  })
})
