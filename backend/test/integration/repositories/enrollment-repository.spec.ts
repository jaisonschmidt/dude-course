/**
 * Integration tests for PrismaEnrollmentRepository.
 *
 * Tests CRUD, composite unique constraints, and FK constraints.
 */

import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { setupDb, teardownDb, truncateAll } from '../../helpers/db.js'
import {
  createEnrollmentCreateDataFactory,
  createUserCreateDataFactory,
  createCourseCreateDataFactory,
} from '../../helpers/factories.js'
import { PrismaEnrollmentRepository } from '../../../src/repositories/enrollment-repository.js'
import { PrismaUserRepository } from '../../../src/repositories/user-repository.js'
import { PrismaCourseRepository } from '../../../src/repositories/course-repository.js'

describe('PrismaEnrollmentRepository', () => {
  let repo: PrismaEnrollmentRepository
  let userRepo: PrismaUserRepository
  let courseRepo: PrismaCourseRepository

  beforeAll(async () => {
    await setupDb()
    repo = new PrismaEnrollmentRepository()
    userRepo = new PrismaUserRepository()
    courseRepo = new PrismaCourseRepository()
  })

  beforeEach(async () => {
    await truncateAll()
  })

  afterAll(async () => {
    await teardownDb()
  })

  describe('create', () => {
    it('should create an enrollment', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())

      const enrollment = await repo.create({
        userId: user.id,
        courseId: course.id,
      })

      expect(enrollment.id).toBeDefined()
      expect(enrollment.userId).toBe(user.id)
      expect(enrollment.courseId).toBe(course.id)
      expect(enrollment.completedAt).toBeNull()
    })

    it('should set startedAt to current time', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())

      const before = new Date()
      const enrollment = await repo.create({
        userId: user.id,
        courseId: course.id,
      })
      const after = new Date()

      expect(enrollment.startedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(enrollment.startedAt.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('should throw on duplicate (userId, courseId)', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())

      await repo.create({ userId: user.id, courseId: course.id })

      await expect(
        repo.create({ userId: user.id, courseId: course.id }),
      ).rejects.toThrow()
    })

    it('should throw on non-existent userId', async () => {
      const course = await courseRepo.create(createCourseCreateDataFactory())

      await expect(
        repo.create({ userId: 99999, courseId: course.id }),
      ).rejects.toThrow()
    })

    it('should throw on non-existent courseId', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())

      await expect(
        repo.create({ userId: user.id, courseId: 99999 }),
      ).rejects.toThrow()
    })

    it('should allow same user to enroll in different courses', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course1 = await courseRepo.create(createCourseCreateDataFactory())
      const course2 = await courseRepo.create(createCourseCreateDataFactory())

      const enrollment1 = await repo.create({ userId: user.id, courseId: course1.id })
      const enrollment2 = await repo.create({ userId: user.id, courseId: course2.id })

      expect(enrollment1.courseId).not.toBe(enrollment2.courseId)
    })

    it('should allow different users to enroll in same course', async () => {
      const user1 = await userRepo.create(createUserCreateDataFactory())
      const user2 = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())

      const enrollment1 = await repo.create({ userId: user1.id, courseId: course.id })
      const enrollment2 = await repo.create({ userId: user2.id, courseId: course.id })

      expect(enrollment1.userId).not.toBe(enrollment2.userId)
    })
  })

  describe('findById', () => {
    it('should find enrollment by ID', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const created = await repo.create({ userId: user.id, courseId: course.id })

      const found = await repo.findById(created.id)

      expect(found).not.toBeNull()
      expect(found?.id).toBe(created.id)
    })

    it('should return null for non-existent ID', async () => {
      const found = await repo.findById(99999)

      expect(found).toBeNull()
    })
  })

  describe('findByUserAndCourse', () => {
    it('should find enrollment by userId and courseId', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const created = await repo.create({ userId: user.id, courseId: course.id })

      const found = await repo.findByUserAndCourse(user.id, course.id)

      expect(found).not.toBeNull()
      expect(found?.id).toBe(created.id)
    })

    it('should return null when not found', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())

      const found = await repo.findByUserAndCourse(user.id, course.id)

      expect(found).toBeNull()
    })
  })

  describe('findByUserId', () => {
    it('should find all enrollments for a user', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course1 = await courseRepo.create(createCourseCreateDataFactory())
      const course2 = await courseRepo.create(createCourseCreateDataFactory())

      const enrollment1 = await repo.create({ userId: user.id, courseId: course1.id })
      const enrollment2 = await repo.create({ userId: user.id, courseId: course2.id })

      const enrollments = await repo.findByUserId(user.id)

      expect(enrollments).toHaveLength(2)
      expect(enrollments.map((e) => e.id)).toContain(enrollment1.id)
      expect(enrollments.map((e) => e.id)).toContain(enrollment2.id)
    })

    it('should return empty array when user has no enrollments', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())

      const enrollments = await repo.findByUserId(user.id)

      expect(enrollments).toHaveLength(0)
    })

    it('should not return enrollments for other users', async () => {
      const user1 = await userRepo.create(createUserCreateDataFactory())
      const user2 = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())

      await repo.create({ userId: user1.id, courseId: course.id })
      const enrollment2 = await repo.create({ userId: user2.id, courseId: course.id })

      const enrollments = await repo.findByUserId(user1.id)

      expect(enrollments).toHaveLength(1)
      expect(enrollments[0].userId).toBe(user1.id)
    })
  })

  describe('markCompleted', () => {
    it('should mark enrollment as completed', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const enrollment = await repo.create({ userId: user.id, courseId: course.id })

      const completedDate = new Date('2025-12-31T23:59:59Z')
      const marked = await repo.markCompleted(enrollment.id, completedDate)

      expect(marked?.completedAt).toBeDefined()
      expect(marked?.completedAt?.getTime()).toBe(completedDate.getTime())
    })

    it('should return null for non-existent enrollment', async () => {
      const date = new Date()
      const result = await repo.markCompleted(99999, date)

      expect(result).toBeNull()
    })

    it('should preserve other fields when marking completed', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const enrollment = await repo.create({ userId: user.id, courseId: course.id })

      const marked = await repo.markCompleted(enrollment.id, new Date())

      expect(marked?.userId).toBe(enrollment.userId)
      expect(marked?.courseId).toBe(enrollment.courseId)
      expect(marked?.startedAt).toEqual(enrollment.startedAt)
    })
  })

  describe('delete', () => {
    it('should delete an enrollment', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const enrollment = await repo.create({ userId: user.id, courseId: course.id })

      const deleted = await repo.delete(enrollment.id)

      expect(deleted).toBe(true)
      const found = await repo.findById(enrollment.id)
      expect(found).toBeNull()
    })

    it('should return false for non-existent enrollment', async () => {
      const deleted = await repo.delete(99999)

      expect(deleted).toBe(false)
    })
  })

  describe('Constraints', () => {
    it('should enforce unique (userId, courseId) constraint', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())

      await repo.create({ userId: user.id, courseId: course.id })

      await expect(
        repo.create({ userId: user.id, courseId: course.id }),
      ).rejects.toThrow()
    })

    it('should enforce FK constraint on userId', async () => {
      const course = await courseRepo.create(createCourseCreateDataFactory())

      await expect(repo.create({ userId: 99999, courseId: course.id })).rejects.toThrow()
    })

    it('should enforce FK constraint on courseId', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())

      await expect(repo.create({ userId: user.id, courseId: 99999 })).rejects.toThrow()
    })
  })
})
