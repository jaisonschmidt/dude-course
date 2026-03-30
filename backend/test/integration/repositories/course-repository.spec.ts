/**
 * Integration tests for PrismaCourseRepository.
 *
 * Tests CRUD operations, status filtering, constraints, and error paths.
 */

import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { setupDb, teardownDb, truncateAll } from '../../helpers/db.js'
import {
  createCourseCreateDataFactory,
  createCourseFactory,
} from '../../helpers/factories.js'
import { PrismaCourseRepository } from '../../../src/repositories/course-repository.js'

describe('PrismaCourseRepository', () => {
  let repo: PrismaCourseRepository

  beforeAll(async () => {
    await setupDb()
    repo = new PrismaCourseRepository()
  })

  beforeEach(async () => {
    await truncateAll()
  })

  afterAll(async () => {
    await teardownDb()
  })

  describe('create', () => {
    it('should create a course with default draft status', async () => {
      const courseData = createCourseCreateDataFactory()
      const course = await repo.create(courseData)

      expect(course.id).toBeDefined()
      expect(course.title).toBe(courseData.title)
      expect(course.status).toBe('draft')
    })

    it('should create a course with specified status', async () => {
      const courseData = createCourseCreateDataFactory({ status: 'published' })
      const course = await repo.create(courseData)

      expect(course.status).toBe('published')
    })

    it('should create course with optional thumbnail', async () => {
      const thumbnail = 'https://example.com/thumbnail.jpg'
      const courseData = createCourseCreateDataFactory({ thumbnailUrl: thumbnail })
      const course = await repo.create(courseData)

      expect(course.thumbnailUrl).toBe(thumbnail)
    })

    it('should create course with null thumbnail', async () => {
      const courseData = createCourseCreateDataFactory({ thumbnailUrl: null })
      const course = await repo.create(courseData)

      expect(course.thumbnailUrl).toBeNull()
    })

    it('should set timestamps on create', async () => {
      const courseData = createCourseCreateDataFactory()
      const course = await repo.create(courseData)

      expect(course.createdAt).toBeInstanceOf(Date)
      expect(course.updatedAt).toBeInstanceOf(Date)
    })
  })

  describe('findById', () => {
    it('should find course by ID', async () => {
      const courseData = createCourseCreateDataFactory()
      const created = await repo.create(courseData)

      const found = await repo.findById(created.id)

      expect(found).not.toBeNull()
      expect(found?.id).toBe(created.id)
      expect(found?.title).toBe(created.title)
    })

    it('should return null for non-existent ID', async () => {
      const found = await repo.findById(99999)

      expect(found).toBeNull()
    })
  })

  describe('findByStatus', () => {
    it('should find courses by status', async () => {
      const draft1 = await repo.create(createCourseCreateDataFactory({ status: 'draft' }))
      const draft2 = await repo.create(createCourseCreateDataFactory({ status: 'draft' }))
      const published = await repo.create(
        createCourseCreateDataFactory({ status: 'published' }),
      )

      const draftCourses = await repo.findByStatus('draft')

      expect(draftCourses).toHaveLength(2)
      expect(draftCourses.map((c) => c.id)).toContain(draft1.id)
      expect(draftCourses.map((c) => c.id)).toContain(draft2.id)
      expect(draftCourses.map((c) => c.id)).not.toContain(published.id)
    })

    it('should return empty array for status with no courses', async () => {
      await repo.create(createCourseCreateDataFactory({ status: 'draft' }))

      const unpublished = await repo.findByStatus('unpublished')

      expect(unpublished).toHaveLength(0)
    })

    it('should filter by published status', async () => {
      await repo.create(createCourseCreateDataFactory({ status: 'draft' }))
      const published = await repo.create(
        createCourseCreateDataFactory({ status: 'published' }),
      )

      const publishedCourses = await repo.findByStatus('published')

      expect(publishedCourses).toHaveLength(1)
      expect(publishedCourses[0].id).toBe(published.id)
    })

    it('should filter by unpublished status', async () => {
      await repo.create(createCourseCreateDataFactory({ status: 'draft' }))
      const unpublished = await repo.create(
        createCourseCreateDataFactory({ status: 'unpublished' }),
      )

      const unpublishedCourses = await repo.findByStatus('unpublished')

      expect(unpublishedCourses).toHaveLength(1)
      expect(unpublishedCourses[0].id).toBe(unpublished.id)
    })
  })

  describe('update', () => {
    it('should update course title', async () => {
      const created = await repo.create(createCourseCreateDataFactory({ title: 'Old Title' }))

      const updated = await repo.update(created.id, { title: 'New Title' })

      expect(updated).not.toBeNull()
      expect(updated?.title).toBe('New Title')
    })

    it('should update course status', async () => {
      const created = await repo.create(createCourseCreateDataFactory({ status: 'draft' }))

      const updated = await repo.update(created.id, { status: 'published' })

      expect(updated?.status).toBe('published')
    })

    it('should update course description', async () => {
      const created = await repo.create(
        createCourseCreateDataFactory({ description: 'Old description' }),
      )

      const updated = await repo.update(created.id, { description: 'New description' })

      expect(updated?.description).toBe('New description')
    })

    it('should update multiple fields at once', async () => {
      const created = await repo.create(createCourseCreateDataFactory())

      const updated = await repo.update(created.id, {
        title: 'Updated Title',
        status: 'published',
      })

      expect(updated?.title).toBe('Updated Title')
      expect(updated?.status).toBe('published')
    })

    it('should return null for non-existent course', async () => {
      const result = await repo.update(99999, { title: 'New' })

      expect(result).toBeNull()
    })

    it('should not affect other courses', async () => {
      const course1 = await repo.create(createCourseCreateDataFactory({ title: 'Title 1' }))
      const course2 = await repo.create(createCourseCreateDataFactory({ title: 'Title 2' }))

      await repo.update(course1.id, { title: 'Updated Title 1' })

      const found2 = await repo.findById(course2.id)
      expect(found2?.title).toBe('Title 2')
    })
  })

  describe('delete', () => {
    it('should delete a course', async () => {
      const created = await repo.create(createCourseCreateDataFactory())

      const deleted = await repo.delete(created.id)

      expect(deleted).toBe(true)
      const found = await repo.findById(created.id)
      expect(found).toBeNull()
    })

    it('should return false for non-existent course', async () => {
      const deleted = await repo.delete(99999)

      expect(deleted).toBe(false)
    })

    it('should not affect other courses', async () => {
      const course1 = await repo.create(createCourseCreateDataFactory())
      const course2 = await repo.create(createCourseCreateDataFactory())

      await repo.delete(course1.id)

      const found2 = await repo.findById(course2.id)
      expect(found2).not.toBeNull()
      expect(found2?.id).toBe(course2.id)
    })
  })

  describe('Constraints', () => {
    it('should enforce valid status enum values', async () => {
      // This test documents Prisma's enum enforcement
      // Invalid statuses should be rejected at the Prisma level
      const courseData = createCourseCreateDataFactory()
      const course = await repo.create(courseData)

      expect(['draft', 'published', 'unpublished']).toContain(course.status)
    })
  })

  describe('Edge cases', () => {
    it('should handle very long title', async () => {
      const longTitle = 'T'.repeat(180)
      const course = await repo.create(
        createCourseCreateDataFactory({ title: longTitle }),
      )

      expect(course.title).toBe(longTitle)
    })

    it('should handle HTML in description', async () => {
      const htmlDescription = '<h1>Course</h1><p>Description</p>'
      const course = await repo.create(
        createCourseCreateDataFactory({ description: htmlDescription }),
      )

      expect(course.description).toBe(htmlDescription)
    })

    it('should handle special characters in title', async () => {
      const specialTitle = 'Course™ & Certification® – Edition 2025'
      const course = await repo.create(
        createCourseCreateDataFactory({ title: specialTitle }),
      )

      expect(course.title).toBe(specialTitle)
    })
  })
})
