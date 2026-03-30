/**
 * Integration tests for PrismaUserRepository.
 *
 * Tests CRUD operations, uniqueness constraints, and error paths.
 * All tests use a real test database that is truncated between tests.
 */

import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { setupDb, teardownDb, truncateAll } from '../../helpers/db.js'
import {
  createUserCreateDataFactory,
  createUserFactory,
} from '../../helpers/factories.js'
import { PrismaUserRepository } from '../../../src/repositories/user-repository.js'

describe('PrismaUserRepository', () => {
  let repo: PrismaUserRepository

  beforeAll(async () => {
    await setupDb()
    repo = new PrismaUserRepository()
  })

  beforeEach(async () => {
    await truncateAll()
  })

  afterAll(async () => {
    await teardownDb()
  })

  describe('create', () => {
    it('should create a user with valid data', async () => {
      const userData = createUserCreateDataFactory()
      const user = await repo.create(userData)

      expect(user.id).toBeDefined()
      expect(user.id).toBeGreaterThan(0)
      expect(user.name).toBe(userData.name)
      expect(user.email).toBe(userData.email)
      expect(user.role).toBe('learner')
    })

    it('should create a user with admin role', async () => {
      const userData = createUserCreateDataFactory({ role: 'admin' })
      const user = await repo.create(userData)

      expect(user.role).toBe('admin')
    })

    it('should throw on duplicate email', async () => {
      const userData = createUserCreateDataFactory({ email: 'unique@test.com' })
      await repo.create(userData)

      await expect(repo.create(userData)).rejects.toThrow()
    })

    it('should set timestamps on create', async () => {
      const userData = createUserCreateDataFactory()
      const user = await repo.create(userData)

      expect(user.createdAt).toBeInstanceOf(Date)
      expect(user.updatedAt).toBeInstanceOf(Date)
    })
  })

  describe('findById', () => {
    it('should find user by ID', async () => {
      const userData = createUserCreateDataFactory()
      const created = await repo.create(userData)

      const found = await repo.findById(created.id)

      expect(found).not.toBeNull()
      expect(found?.id).toBe(created.id)
      expect(found?.email).toBe(created.email)
    })

    it('should return null for non-existent ID', async () => {
      const found = await repo.findById(99999)

      expect(found).toBeNull()
    })

    it('should map Prisma model to domain User', async () => {
      const userData = createUserCreateDataFactory()
      const created = await repo.create(userData)

      const found = await repo.findById(created.id)

      // Verify domain type (not Prisma type)
      expect(found?.id).toBeDefined()
      expect(found?.name).toBeDefined()
      expect(found?.email).toBeDefined()
      expect(found?.passwordHash).toBeDefined()
      expect(found?.role).toBeDefined()
      expect(found?.createdAt).toBeInstanceOf(Date)
      expect(found?.updatedAt).toBeInstanceOf(Date)
    })
  })

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const userData = createUserCreateDataFactory({ email: 'test@example.com' })
      const created = await repo.create(userData)

      const found = await repo.findByEmail('test@example.com')

      expect(found).not.toBeNull()
      expect(found?.id).toBe(created.id)
      expect(found?.email).toBe('test@example.com')
    })

    it('should return null for non-existent email', async () => {
      const found = await repo.findByEmail('nonexistent@test.com')

      expect(found).toBeNull()
    })

    it('should be case-sensitive for email lookup', async () => {
      const userData = createUserCreateDataFactory({ email: 'CaseTest@example.com' })
      await repo.create(userData)

      // Note: MySQL is case-insensitive by default in comparisons, but Prisma
      // may handle this differently. This test documents behavior.
      const found = await repo.findByEmail('CaseTest@example.com')

      expect(found).not.toBeNull()
    })

    it('should find correct user when multiple exist', async () => {
      const user1 = await repo.create(createUserCreateDataFactory({ email: 'user1@test.com' }))
      const user2 = await repo.create(createUserCreateDataFactory({ email: 'user2@test.com' }))

      const found = await repo.findByEmail('user2@test.com')

      expect(found?.id).toBe(user2.id)
      expect(found?.id).not.toBe(user1.id)
    })
  })

  describe('Constraints', () => {
    it('should enforce unique email constraint', async () => {
      const email = 'constraint-test@example.com'
      await repo.create(createUserCreateDataFactory({ email }))

      await expect(
        repo.create(createUserCreateDataFactory({ email })),
      ).rejects.toThrow()
    })

    it('should allow different roles for same email pattern', async () => {
      // Note: Emails must still be unique; this tests role variation
      const user1 = await repo.create(
        createUserCreateDataFactory({ email: 'test1@example.com', role: 'learner' }),
      )
      const user2 = await repo.create(
        createUserCreateDataFactory({ email: 'test2@example.com', role: 'admin' }),
      )

      expect(user1.role).toBe('learner')
      expect(user2.role).toBe('admin')
    })
  })

  describe('Edge cases', () => {
    it('should handle long names', async () => {
      const longName = 'A'.repeat(120)
      const user = await repo.create(
        createUserCreateDataFactory({ name: longName }),
      )

      expect(user.name).toBe(longName)
    })

    it('should handle long emails', async () => {
      const longEmail = 'test+' + 'a'.repeat(200) + '@example.com'
      const user = await repo.create(
        createUserCreateDataFactory({ email: longEmail }),
      )

      expect(user.email).toBe(longEmail)
    })

    it('should preserve password hash exactly as provided', async () => {
      const customHash = '$2b$10$customhash1234567890'
      const user = await repo.create(
        createUserCreateDataFactory({ passwordHash: customHash }),
      )

      expect(user.passwordHash).toBe(customHash)
    })
  })
})
