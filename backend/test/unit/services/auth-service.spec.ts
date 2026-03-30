import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthService } from '../../../src/services/auth-service.js'
import type { IUserRepository } from '../../../src/repositories/user-repository.js'
import { createUserFactory } from '../../helpers/factories.js'

// Mock bcrypt
vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}))

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
  },
}))

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

function createMockUserRepository(): IUserRepository {
  return {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
  }
}

describe('AuthService', () => {
  let authService: AuthService
  let mockUserRepo: IUserRepository

  beforeEach(() => {
    vi.clearAllMocks()
    mockUserRepo = createMockUserRepository()
    authService = new AuthService(mockUserRepo)
  })

  describe('register', () => {
    it('should create a user and return user DTO without passwordHash', async () => {
      const user = createUserFactory({ id: 1, name: 'Jane', email: 'jane@example.com', role: 'learner' })

      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(null)
      vi.mocked(bcrypt.hash).mockResolvedValue('$2b$10$hashedpassword' as never)
      vi.mocked(mockUserRepo.create).mockResolvedValue(user)

      const result = await authService.register({
        name: 'Jane',
        email: 'jane@example.com',
        password: 'securepassword',
      })

      expect(result).toEqual({
        id: 1,
        name: 'Jane',
        email: 'jane@example.com',
        role: 'learner',
      })
      expect(result).not.toHaveProperty('passwordHash')
    })

    it('should hash the password with bcrypt (min 10 rounds)', async () => {
      const user = createUserFactory()

      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(null)
      vi.mocked(bcrypt.hash).mockResolvedValue('$2b$10$hashed' as never)
      vi.mocked(mockUserRepo.create).mockResolvedValue(user)

      await authService.register({
        name: 'Test',
        email: 'test@example.com',
        password: 'mypassword',
      })

      expect(bcrypt.hash).toHaveBeenCalledWith('mypassword', 10)
    })

    it('should call userRepository.create with hashed password', async () => {
      const user = createUserFactory()

      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(null)
      vi.mocked(bcrypt.hash).mockResolvedValue('$2b$10$thehash' as never)
      vi.mocked(mockUserRepo.create).mockResolvedValue(user)

      await authService.register({
        name: 'Test',
        email: 'test@example.com',
        password: 'mypassword',
      })

      expect(mockUserRepo.create).toHaveBeenCalledWith({
        name: 'Test',
        email: 'test@example.com',
        passwordHash: '$2b$10$thehash',
      })
    })

    it('should throw ConflictError when email already exists', async () => {
      const existingUser = createUserFactory({ email: 'taken@example.com' })
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(existingUser)

      await expect(
        authService.register({
          name: 'Test',
          email: 'taken@example.com',
          password: 'securepassword',
        }),
      ).rejects.toThrow('Email already registered')

      expect(mockUserRepo.create).not.toHaveBeenCalled()
      expect(bcrypt.hash).not.toHaveBeenCalled()
    })

    it('should check email existence before hashing password (performance)', async () => {
      const existingUser = createUserFactory()
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(existingUser)

      await expect(
        authService.register({
          name: 'Test',
          email: existingUser.email,
          password: 'securepassword',
        }),
      ).rejects.toThrow()

      // If email already exists, bcrypt.hash should never be called (early return)
      expect(mockUserRepo.findByEmail).toHaveBeenCalledOnce()
      expect(bcrypt.hash).not.toHaveBeenCalled()
      expect(mockUserRepo.create).not.toHaveBeenCalled()
    })
  })

  describe('login', () => {
    it('should return accessToken, expiresIn, and user on valid credentials', async () => {
      const user = createUserFactory({
        id: 42,
        name: 'Jane',
        email: 'jane@example.com',
        role: 'learner',
        passwordHash: '$2b$10$storedhash',
      })

      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(user)
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never)
      vi.mocked(jwt.sign).mockReturnValue('mocked-jwt-token' as never)

      const result = await authService.login({
        email: 'jane@example.com',
        password: 'correctpassword',
      })

      expect(result).toEqual({
        accessToken: 'mocked-jwt-token',
        expiresIn: '1h',
        user: {
          id: 42,
          name: 'Jane',
          email: 'jane@example.com',
          role: 'learner',
        },
      })
    })

    it('should sign JWT with correct payload and options', async () => {
      const user = createUserFactory({
        id: 42,
        email: 'jane@example.com',
        role: 'learner',
      })

      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(user)
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never)
      vi.mocked(jwt.sign).mockReturnValue('token' as never)

      await authService.login({
        email: 'jane@example.com',
        password: 'correctpassword',
      })

      expect(jwt.sign).toHaveBeenCalledWith(
        { sub: 42, email: 'jane@example.com', role: 'learner' },
        expect.any(String),
        { expiresIn: '1h' },
      )
    })

    it('should throw UnauthorizedError when email not found', async () => {
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(null)

      await expect(
        authService.login({
          email: 'nonexistent@example.com',
          password: 'anypassword',
        }),
      ).rejects.toThrow('Invalid credentials')

      expect(bcrypt.compare).not.toHaveBeenCalled()
    })

    it('should throw UnauthorizedError when password is wrong', async () => {
      const user = createUserFactory({ passwordHash: '$2b$10$storedhash' })

      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(user)
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

      await expect(
        authService.login({
          email: user.email,
          password: 'wrongpassword',
        }),
      ).rejects.toThrow('Invalid credentials')

      expect(jwt.sign).not.toHaveBeenCalled()
    })

    it('should use the same error message for wrong email and wrong password', async () => {
      // Security: generic message prevents email enumeration
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(null)

      const errorForWrongEmail = await authService
        .login({ email: 'wrong@example.com', password: 'any' })
        .catch((e: Error) => e)

      vi.clearAllMocks()

      const user = createUserFactory()
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(user)
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

      const errorForWrongPassword = await authService
        .login({ email: user.email, password: 'wrong' })
        .catch((e: Error) => e)

      expect((errorForWrongEmail as Error).message).toBe(
        (errorForWrongPassword as Error).message,
      )
    })
  })
})
