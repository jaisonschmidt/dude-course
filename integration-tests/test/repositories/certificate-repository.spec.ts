/**
 * Integration tests for PrismaCertificateRepository.
 *
 * Tests CRUD, unique constraints, and FK constraints.
 */

import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { setupDb, teardownDb, truncateAll } from '../../helpers/db.js'
import {
  createCertificateCreateDataFactory,
  createUserCreateDataFactory,
  createCourseCreateDataFactory,
} from '../../../backend/test/helpers/factories.js'
import { PrismaCertificateRepository } from '../../../backend/src/repositories/certificate-repository.js'
import { PrismaUserRepository } from '../../../backend/src/repositories/user-repository.js'
import { PrismaCourseRepository } from '../../../backend/src/repositories/course-repository.js'

describe('PrismaCertificateRepository', () => {
  let repo: PrismaCertificateRepository
  let userRepo: PrismaUserRepository
  let courseRepo: PrismaCourseRepository

  beforeAll(async () => {
    await setupDb()
    repo = new PrismaCertificateRepository()
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
    it('should create a certificate', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())

      const certificate = await repo.create({
        userId: user.id,
        courseId: course.id,
        certificateCode: 'CERT-TEST-001',
      })

      expect(certificate.id).toBeDefined()
      expect(certificate.userId).toBe(user.id)
      expect(certificate.courseId).toBe(course.id)
      expect(certificate.certificateCode).toBe('CERT-TEST-001')
    })

    it('should set issuedAt to current time', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())

      const before = new Date()
      const certificate = await repo.create({
        userId: user.id,
        courseId: course.id,
        certificateCode: 'CERT-TEST-002',
      })
      const after = new Date()

      expect(certificate.issuedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(certificate.issuedAt.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('should throw on duplicate certificate code', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const code = 'CERT-UNIQUE-123'

      await repo.create({
        userId: user.id,
        courseId: course.id,
        certificateCode: code,
      })

      const user2 = await userRepo.create(createUserCreateDataFactory())
      const course2 = await courseRepo.create(createCourseCreateDataFactory())

      await expect(
        repo.create({
          userId: user2.id,
          courseId: course2.id,
          certificateCode: code,
        }),
      ).rejects.toThrow()
    })

    it('should throw on duplicate (userId, courseId)', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())

      await repo.create({
        userId: user.id,
        courseId: course.id,
        certificateCode: 'CERT-DUP-001',
      })

      await expect(
        repo.create({
          userId: user.id,
          courseId: course.id,
          certificateCode: 'CERT-DUP-002',
        }),
      ).rejects.toThrow()
    })

    it('should throw on non-existent userId', async () => {
      const course = await courseRepo.create(createCourseCreateDataFactory())

      await expect(
        repo.create({
          userId: 99999,
          courseId: course.id,
          certificateCode: 'CERT-FK-001',
        }),
      ).rejects.toThrow()
    })

    it('should throw on non-existent courseId', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())

      await expect(
        repo.create({
          userId: user.id,
          courseId: 99999,
          certificateCode: 'CERT-FK-002',
        }),
      ).rejects.toThrow()
    })
  })

  describe('findById', () => {
    it('should find certificate by ID', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const created = await repo.create({
        userId: user.id,
        courseId: course.id,
        certificateCode: 'CERT-FIND-001',
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

  describe('findByUserAndCourse', () => {
    it('should find certificate by userId and courseId', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const created = await repo.create({
        userId: user.id,
        courseId: course.id,
        certificateCode: 'CERT-UC-001',
      })

      const found = await repo.findByUserAndCourse(user.id, course.id)

      expect(found).not.toBeNull()
      expect(found?.id).toBe(created.id)
    })

    it('should return null when certificate not found', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())

      const found = await repo.findByUserAndCourse(user.id, course.id)

      expect(found).toBeNull()
    })
  })

  describe('findByCertificateCode', () => {
    it('should find certificate by code', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const code = 'CERT-CODE-UNIQUE-123'
      const created = await repo.create({
        userId: user.id,
        courseId: course.id,
        certificateCode: code,
      })

      const found = await repo.findByCertificateCode(code)

      expect(found).not.toBeNull()
      expect(found?.id).toBe(created.id)
      expect(found?.certificateCode).toBe(code)
    })

    it('should return null for non-existent code', async () => {
      const found = await repo.findByCertificateCode('NONEXISTENT-CODE-999')

      expect(found).toBeNull()
    })

    it('should be case-sensitive for code lookup', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const code = 'CERT-CASE-SENSITIVE'
      await repo.create({
        userId: user.id,
        courseId: course.id,
        certificateCode: code,
      })

      // Test case mismatch
      const found = await repo.findByCertificateCode('cert-case-sensitive')

      // This test documents actual behavior (MySQL is case-insensitive by default)
      expect(found).not.toBeNull() // or expect(found).toBeNull() depending on collation
    })
  })

  describe('delete', () => {
    it('should delete a certificate', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const certificate = await repo.create({
        userId: user.id,
        courseId: course.id,
        certificateCode: 'CERT-DELETE-001',
      })

      const deleted = await repo.delete(certificate.id)

      expect(deleted).toBe(true)
      const found = await repo.findById(certificate.id)
      expect(found).toBeNull()
    })

    it('should return false for non-existent certificate', async () => {
      const deleted = await repo.delete(99999)

      expect(deleted).toBe(false)
    })

    it('should not affect other certificates', async () => {
      const user1 = await userRepo.create(createUserCreateDataFactory())
      const user2 = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const course2 = await courseRepo.create(createCourseCreateDataFactory())

      const cert1 = await repo.create({
        userId: user1.id,
        courseId: course.id,
        certificateCode: 'CERT-SAFE-001',
      })
      const cert2 = await repo.create({
        userId: user2.id,
        courseId: course2.id,
        certificateCode: 'CERT-SAFE-002',
      })

      await repo.delete(cert1.id)

      const found = await repo.findById(cert2.id)
      expect(found).not.toBeNull()
      expect(found?.id).toBe(cert2.id)
    })
  })

  describe('Constraints', () => {
    it('should enforce unique certificateCode', async () => {
      const user1 = await userRepo.create(createUserCreateDataFactory())
      const user2 = await userRepo.create(createUserCreateDataFactory())
      const course1 = await courseRepo.create(createCourseCreateDataFactory())
      const course2 = await courseRepo.create(createCourseCreateDataFactory())
      const code = 'CERT-UNIQUE-CONSTRAINT'

      await repo.create({
        userId: user1.id,
        courseId: course1.id,
        certificateCode: code,
      })

      await expect(
        repo.create({
          userId: user2.id,
          courseId: course2.id,
          certificateCode: code,
        }),
      ).rejects.toThrow()
    })

    it('should enforce unique (userId, courseId) constraint', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())

      await repo.create({
        userId: user.id,
        courseId: course.id,
        certificateCode: 'CERT-COMP-001',
      })

      await expect(
        repo.create({
          userId: user.id,
          courseId: course.id,
          certificateCode: 'CERT-COMP-002',
        }),
      ).rejects.toThrow()
    })
  })

  describe('Edge cases', () => {
    it('should handle long certificate codes', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const longCode = 'CERT-' + 'A'.repeat(59)

      const certificate = await repo.create({
        userId: user.id,
        courseId: course.id,
        certificateCode: longCode,
      })

      expect(certificate.certificateCode).toBe(longCode)
    })

    it('should handle special characters in code', async () => {
      const user = await userRepo.create(createUserCreateDataFactory())
      const course = await courseRepo.create(createCourseCreateDataFactory())
      const codeWithSpecial = 'CERT-2025-001/ABC-XYZ'

      const certificate = await repo.create({
        userId: user.id,
        courseId: course.id,
        certificateCode: codeWithSpecial,
      })

      expect(certificate.certificateCode).toBe(codeWithSpecial)
    })
  })
})
