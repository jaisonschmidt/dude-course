/**
 * Integration tests for PrismaLessonRepository.
 *
 * Tests CRUD, position ordering, FK constraints, and uniqueness.
 */

import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { setupDb, teardownDb, truncateAll } from '../../helpers/db.js'
import {
  createLessonCreateDataFactory,
  createCourseCreateDataFactory,
} from '../../../backend/test/helpers/factories.js'
import { PrismaLessonRepository } from '../../../backend/src/repositories/lesson-repository.js'
import { PrismaCourseRepository } from '../../../backend/src/repositories/course-repository.js'

describe('PrismaLessonRepository', () => {
  let repo: PrismaLessonRepository
  let courseRepo: PrismaCourseRepository

  beforeAll(async () => {
    await setupDb()
    repo = new PrismaLessonRepository()
    courseRepo = new PrismaCourseRepository()
  })

  beforeEach(async () => {
    await truncateAll()
  })

  afterAll(async () => {
    await teardownDb()
  })

  describe('create', () => {
    it('should create a lesson with valid data', async () => {
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const lessonData = createLessonCreateDataFactory({
        courseId: course.id,
        position: 1,
      })

      const lesson = await repo.create(lessonData)

      expect(lesson.id).toBeDefined()
      expect(lesson.courseId).toBe(course.id)
      expect(lesson.title).toBe(lessonData.title)
      expect(lesson.position).toBe(1)
    })

    it('should allow null description', async () => {
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const lessonData = createLessonCreateDataFactory({
        courseId: course.id,
        description: null,
      })

      const lesson = await repo.create(lessonData)

      expect(lesson.description).toBeNull()
    })

    it('should set timestamps on create', async () => {
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const lessonData = createLessonCreateDataFactory({ courseId: course.id })

      const lesson = await repo.create(lessonData)

      expect(lesson.createdAt).toBeInstanceOf(Date)
      expect(lesson.updatedAt).toBeInstanceOf(Date)
    })

    it('should throw on duplicate (courseId + position)', async () => {
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const lessonData = createLessonCreateDataFactory({
        courseId: course.id,
        position: 1,
      })

      await repo.create(lessonData)

      await expect(repo.create(lessonData)).rejects.toThrow()
    })

    it('should throw on non-existent course FK', async () => {
      const lessonData = createLessonCreateDataFactory({
        courseId: 99999,
        position: 1,
      })

      await expect(repo.create(lessonData)).rejects.toThrow()
    })

    it('should allow same position in different courses', async () => {
      const course1 = await courseRepo.create(createCourseCreateDataFactory())
      const course2 = await courseRepo.create(createCourseCreateDataFactory())

      const lesson1 = await repo.create(
        createLessonCreateDataFactory({ courseId: course1.id, position: 1 }),
      )
      const lesson2 = await repo.create(
        createLessonCreateDataFactory({ courseId: course2.id, position: 1 }),
      )

      expect(lesson1.position).toBe(1)
      expect(lesson2.position).toBe(1)
      expect(lesson1.courseId).not.toBe(lesson2.courseId)
    })
  })

  describe('findById', () => {
    it('should find lesson by ID', async () => {
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const created = await repo.create(
        createLessonCreateDataFactory({ courseId: course.id }),
      )

      const found = await repo.findById(created.id)

      expect(found).not.toBeNull()
      expect(found?.id).toBe(created.id)
    })

    it('should return null for non-existent ID', async () => {
      const found = await repo.findById(99999)

      expect(found).toBeNull()
    })
  })

  describe('findByCourseId', () => {
    it('should find all lessons for a course', async () => {
      const course = await courseRepo.create(createCourseCreateDataFactory())

      const lesson1 = await repo.create(
        createLessonCreateDataFactory({ courseId: course.id, position: 1 }),
      )
      const lesson2 = await repo.create(
        createLessonCreateDataFactory({ courseId: course.id, position: 2 }),
      )
      const lesson3 = await repo.create(
        createLessonCreateDataFactory({ courseId: course.id, position: 3 }),
      )

      const lessons = await repo.findByCourseId(course.id)

      expect(lessons).toHaveLength(3)
      expect(lessons.map((l) => l.id)).toEqual([lesson1.id, lesson2.id, lesson3.id])
    })

    it('should return lessons ordered by position', async () => {
      const course = await courseRepo.create(createCourseCreateDataFactory())

      // Create out of order
      await repo.create(
        createLessonCreateDataFactory({ courseId: course.id, position: 3 }),
      )
      await repo.create(
        createLessonCreateDataFactory({ courseId: course.id, position: 1 }),
      )
      await repo.create(
        createLessonCreateDataFactory({ courseId: course.id, position: 2 }),
      )

      const lessons = await repo.findByCourseId(course.id)

      expect(lessons[0].position).toBe(1)
      expect(lessons[1].position).toBe(2)
      expect(lessons[2].position).toBe(3)
    })

    it('should return empty array for course with no lessons', async () => {
      const course = await courseRepo.create(createCourseCreateDataFactory())

      const lessons = await repo.findByCourseId(course.id)

      expect(lessons).toHaveLength(0)
    })

    it('should not return lessons from other courses', async () => {
      const course1 = await courseRepo.create(createCourseCreateDataFactory())
      const course2 = await courseRepo.create(createCourseCreateDataFactory())

      await repo.create(
        createLessonCreateDataFactory({ courseId: course1.id, position: 1 }),
      )
      await repo.create(
        createLessonCreateDataFactory({ courseId: course2.id, position: 1 }),
      )

      const lessonsForCourse1 = await repo.findByCourseId(course1.id)

      expect(lessonsForCourse1).toHaveLength(1)
      expect(lessonsForCourse1[0].courseId).toBe(course1.id)
    })
  })

  describe('update', () => {
    it('should update lesson title', async () => {
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const created = await repo.create(
        createLessonCreateDataFactory({ courseId: course.id, title: 'Old Title' }),
      )

      const updated = await repo.update(created.id, { title: 'New Title' })

      expect(updated?.title).toBe('New Title')
    })

    it('should update lesson position', async () => {
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const lesson1 = await repo.create(
        createLessonCreateDataFactory({ courseId: course.id, position: 1 }),
      )
      const lesson2 = await repo.create(
        createLessonCreateDataFactory({ courseId: course.id, position: 2 }),
      )

      // Reorder: move lesson2 to position 1
      await repo.update(lesson2.id, { position: 1 })
      await repo.update(lesson1.id, { position: 2 })

      const lessons = await repo.findByCourseId(course.id)
      expect(lessons[0].id).toBe(lesson2.id)
      expect(lessons[1].id).toBe(lesson1.id)
    })

    it('should return null for non-existent lesson', async () => {
      const result = await repo.update(99999, { title: 'New' })

      expect(result).toBeNull()
    })
  })

  describe('delete', () => {
    it('should delete a lesson', async () => {
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const created = await repo.create(
        createLessonCreateDataFactory({ courseId: course.id }),
      )

      const deleted = await repo.delete(created.id)

      expect(deleted).toBe(true)
      const found = await repo.findById(created.id)
      expect(found).toBeNull()
    })

    it('should return false for non-existent lesson', async () => {
      const deleted = await repo.delete(99999)

      expect(deleted).toBe(false)
    })
  })

  describe('Constraints', () => {
    it('should enforce unique (courseId, position) constraint', async () => {
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const lessonData = createLessonCreateDataFactory({
        courseId: course.id,
        position: 1,
      })

      await repo.create(lessonData)

      await expect(repo.create(lessonData)).rejects.toThrow()
    })

    it('should enforce FK constraint on courseId', async () => {
      const lessonData = createLessonCreateDataFactory({ courseId: 99999 })

      await expect(repo.create(lessonData)).rejects.toThrow()
    })
  })

  describe('Edge cases', () => {
    it('should handle high position numbers', async () => {
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const lesson = await repo.create(
        createLessonCreateDataFactory({ courseId: course.id, position: 9999 }),
      )

      expect(lesson.position).toBe(9999)
    })

    it('should handle YouTube URL variations', async () => {
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const urls = [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtu.be/dQw4w9WgXcQ',
        'https://www.youtube.com/embed/dQw4w9WgXcQ',
      ]

      for (const url of urls) {
        const lesson = await repo.create(
          createLessonCreateDataFactory({ courseId: course.id, youtubeUrl: url }),
        )
        expect(lesson.youtubeUrl).toBe(url)
      }
    })
  })
})
