/**
 * Integration tests for PrismaLessonProgressRepository.
 *
 * Tests CRUD, composite unique constraints, and FK constraints.
 */

import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { setupDb, teardownDb, truncateAll } from '../../helpers/db.js'
import {
  createLessonProgressCreateDataFactory,
  createUserCreateDataFactory,
  createCourseCreateDataFactory,
  createLessonCreateDataFactory,
} from '../../helpers/factories.js'
import { PrismaLessonProgressRepository } from '../../../src/repositories/lesson-progress-repository.js'
import { PrismaUserRepository } from '../../../src/repositories/user-repository.js'
import { PrismaCourseRepository } from '../../../src/repositories/course-repository.js'
import { PrismaLessonRepository } from '../../../src/repositories/lesson-repository.js'

describe('PrismaLessonProgressRepository', () => {
  let repo: PrismaLessonProgressRepository
  let userRepo: PrismaUserRepository
  let courseRepo: PrismaCourseRepository
  let lessonRepo: PrismaLessonRepository

  beforeAll(async () => {
    await setupDb()
    repo = new PrismaLessonProgressRepository()
    userRepo = new PrismaUserRepository()
    courseRepo = new PrismaCourseRepository()
    lessonRepo = new PrismaLessonRepository()
  })

  beforeEach(async () => {
    await truncateAll()
  })

  afterAll(async () => {
    await teardownDb()
  })

  describe('create', () => {
    it('should create a lesson progress record', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const lesson = await lessonRepo.create(
        createLessonCreateDataFactory({ courseId: course.id, position: 1 }),
      )

      const progress = await repo.create({
        userId: user.id,
        courseId: course.id,
        lessonId: lesson.id,
      })

      expect(progress.id).toBeDefined()
      expect(progress.userId).toBe(user.id)
      expect(progress.lessonId).toBe(lesson.id)
    })

    it('should set completedAt to current time', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const lesson = await lessonRepo.create(
        createLessonCreateDataFactory({ courseId: course.id, position: 1 }),
      )

      const before = new Date()
      const progress = await repo.create({
        userId: user.id,
        courseId: course.id,
        lessonId: lesson.id,
      })
      const after = new Date()

      expect(progress.completedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(progress.completedAt.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('should throw on duplicate (userId, lessonId)', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const lesson = await lessonRepo.create(
        createLessonCreateDataFactory({ courseId: course.id, position: 1 }),
      )

      const progressData = {
        userId: user.id,
        courseId: course.id,
        lessonId: lesson.id,
      }

      await repo.create(progressData)

      await expect(repo.create(progressData)).rejects.toThrow()
    })

    it('should throw on non-existent userId', async () => {
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const lesson = await lessonRepo.create(
        createLessonCreateDataFactory({ courseId: course.id, position: 1 }),
      )

      await expect(
        repo.create({
          userId: 99999,
          courseId: course.id,
          lessonId: lesson.id,
        }),
      ).rejects.toThrow()
    })

    it('should throw on non-existent lessonId', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())

      await expect(
        repo.create({
          userId: user.id,
          courseId: course.id,
          lessonId: 99999,
        }),
      ).rejects.toThrow()
    })

    it('should allow same user to complete different lessons', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const lesson1 = await lessonRepo.create(
        createLessonCreateDataFactory({ courseId: course.id, position: 1 }),
      )
      const lesson2 = await lessonRepo.create(
        createLessonCreateDataFactory({ courseId: course.id, position: 2 }),
      )

      const progress1 = await repo.create({
        userId: user.id,
        courseId: course.id,
        lessonId: lesson1.id,
      })
      const progress2 = await repo.create({
        userId: user.id,
        courseId: course.id,
        lessonId: lesson2.id,
      })

      expect(progress1.lessonId).not.toBe(progress2.lessonId)
    })
  })

  describe('findById', () => {
    it('should find progress by ID', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const lesson = await lessonRepo.create(
        createLessonCreateDataFactory({ courseId: course.id, position: 1 }),
      )
      const created = await repo.create({
        userId: user.id,
        courseId: course.id,
        lessonId: lesson.id,
      })

      const found = await repo.findById(created.id)

      expect(found).not.toBeNull()
      expect(found?.id).toBe(created.id)
    })

    it('should return null for non-existent ID', async () => {
      const found = await repo.findById(99999)

      expect(found).toBeNull()
    })
  })

  describe('findByUserAndLesson', () => {
    it('should find progress by userId and lessonId', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const lesson = await lessonRepo.create(
        createLessonCreateDataFactory({ courseId: course.id, position: 1 }),
      )
      const created = await repo.create({
        userId: user.id,
        courseId: course.id,
        lessonId: lesson.id,
      })

      const found = await repo.findByUserAndLesson(user.id, lesson.id)

      expect(found).not.toBeNull()
      expect(found?.id).toBe(created.id)
    })

    it('should return null when progress not found', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const lesson = await lessonRepo.create(
        createLessonCreateDataFactory({ courseId: course.id, position: 1 }),
      )

      const found = await repo.findByUserAndLesson(user.id, lesson.id)

      expect(found).toBeNull()
    })
  })

  describe('findByCourseProgress', () => {
    it('should find all progress for user in course', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const lesson1 = await lessonRepo.create(
        createLessonCreateDataFactory({ courseId: course.id, position: 1 }),
      )
      const lesson2 = await lessonRepo.create(
        createLessonCreateDataFactory({ courseId: course.id, position: 2 }),
      )

      const progress1 = await repo.create({
        userId: user.id,
        courseId: course.id,
        lessonId: lesson1.id,
      })
      const progress2 = await repo.create({
        userId: user.id,
        courseId: course.id,
        lessonId: lesson2.id,
      })

      const progressList = await repo.findByCourseProgress(user.id, course.id)

      expect(progressList).toHaveLength(2)
      expect(progressList.map((p) => p.id)).toContain(progress1.id)
      expect(progressList.map((p) => p.id)).toContain(progress2.id)
    })

    it('should return empty array when no progress exists', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())

      const progressList = await repo.findByCourseProgress(user.id, course.id)

      expect(progressList).toHaveLength(0)
    })

    it('should not return progress from other courses', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course1 = await courseRepo.create(createCourseCreateDataFactory())
      const course2 = await courseRepo.create(createCourseCreateDataFactory())
      const lesson1 = await lessonRepo.create(
        createLessonCreateDataFactory({ courseId: course1.id, position: 1 }),
      )
      const lesson2 = await lessonRepo.create(
        createLessonCreateDataFactory({ courseId: course2.id, position: 1 }),
      )

      await repo.create({
        userId: user.id,
        courseId: course1.id,
        lessonId: lesson1.id,
      })
      await repo.create({
        userId: user.id,
        courseId: course2.id,
        lessonId: lesson2.id,
      })

      const course1Progress = await repo.findByCourseProgress(user.id, course1.id)

      expect(course1Progress).toHaveLength(1)
      expect(course1Progress[0].courseId).toBe(course1.id)
    })
  })

  describe('delete', () => {
    it('should delete progress record', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const lesson = await lessonRepo.create(
        createLessonCreateDataFactory({ courseId: course.id, position: 1 }),
      )
      const progress = await repo.create({
        userId: user.id,
        courseId: course.id,
        lessonId: lesson.id,
      })

      const deleted = await repo.delete(progress.id)

      expect(deleted).toBe(true)
      const found = await repo.findById(progress.id)
      expect(found).toBeNull()
    })

    it('should return false for non-existent progress', async () => {
      const deleted = await repo.delete(99999)

      expect(deleted).toBe(false)
    })
  })

  describe('Constraints', () => {
    it('should enforce unique (userId, lessonId) constraint', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const lesson = await lessonRepo.create(
        createLessonCreateDataFactory({ courseId: course.id, position: 1 }),
      )

      const progressData = {
        userId: user.id,
        courseId: course.id,
        lessonId: lesson.id,
      }

      await repo.create(progressData)

      await expect(repo.create(progressData)).rejects.toThrow()
    })
  })
})
