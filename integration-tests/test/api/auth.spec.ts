/**
 * Auth endpoints integration tests.
 *
 * Tests: POST /api/v1/auth/register, POST /api/v1/auth/login, POST /api/v1/auth/logout
 *
 * Requires:
 *   - A running backend instance (BACKEND_URL, default: http://localhost:3001)
 *   - A clean test database
 *   - RUN_INTEGRATION_TESTS=true
 */

import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { post } from '../../helpers/request.js'
import { setupDb, teardownDb, truncateAll, getTestPrisma } from '../../helpers/db.js'

const shouldRun = process.env['RUN_INTEGRATION_TESTS'] === 'true'
const describeOrSkip = shouldRun ? describe : describe.skip

interface AuthUserResponse {
  data: { id: number; name: string; email: string; role: string }
  requestId: string
}

interface LoginResponse {
  data: {
    accessToken: string
    expiresIn: string
    user: { id: number; name: string; email: string; role: string }
  }
  requestId: string
}

interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: Array<{ field: string; message: string }>
    requestId: string
  }
}

describeOrSkip('Auth Endpoints', () => {
  beforeAll(async () => {
    await setupDb()
  })

  beforeEach(async () => {
    await truncateAll()
  })

  afterAll(async () => {
    await teardownDb()
  })

  // ────────────────────────────────────────
  // POST /api/v1/auth/register
  // ────────────────────────────────────────
  describe('POST /api/v1/auth/register', () => {
    it('AC-01: should register a user and return 201 with user data', async () => {
      const res = await post<AuthUserResponse>('/api/v1/auth/register', {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'securepassword123',
      })

      expect(res.status).toBe(201)
      expect(res.body.data).toMatchObject({
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'learner',
      })
      expect(res.body.data.id).toBeTypeOf('number')
      expect(res.body.requestId).toBeTypeOf('string')
      // Should NOT contain passwordHash or password
      expect(res.body.data).not.toHaveProperty('passwordHash')
      expect(res.body.data).not.toHaveProperty('password')
    })

    it('AC-01: should store password as bcrypt hash (never plaintext)', async () => {
      await post('/api/v1/auth/register', {
        name: 'Jane Doe',
        email: 'jane-hash@example.com',
        password: 'securepassword123',
      })

      const prisma = getTestPrisma()
      const rows = await prisma.$queryRaw`SELECT password_hash FROM user WHERE email = 'jane-hash@example.com'` as Array<{ password_hash: string }>

      expect(rows).toHaveLength(1)
      expect(rows[0]!.password_hash).not.toBe('securepassword123')
      expect(rows[0]!.password_hash).toMatch(/^\$2[aby]?\$/)
    })

    it('AC-02: should return 409 when email already exists', async () => {
      // First registration
      await post('/api/v1/auth/register', {
        name: 'Jane',
        email: 'duplicate@example.com',
        password: 'password123',
      })

      // Duplicate registration
      const res = await post<ErrorResponse>('/api/v1/auth/register', {
        name: 'Other Jane',
        email: 'duplicate@example.com',
        password: 'otherpassword1',
      })

      expect(res.status).toBe(409)
      expect(res.body.error.code).toBe('CONFLICT')
      expect(res.body.error.requestId).toBeTypeOf('string')
    })

    it('AC-03: should return 400 for invalid email format', async () => {
      const res = await post<ErrorResponse>('/api/v1/auth/register', {
        name: 'Test',
        email: 'not-an-email',
        password: 'password123',
      })

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('VALIDATION_ERROR')
      expect(res.body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'email' }),
        ]),
      )
    })

    it('AC-03: should return 400 for password shorter than 8 chars', async () => {
      const res = await post<ErrorResponse>('/api/v1/auth/register', {
        name: 'Test',
        email: 'test@example.com',
        password: 'short',
      })

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('VALIDATION_ERROR')
      expect(res.body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'password' }),
        ]),
      )
    })

    it('AC-03: should return 400 for empty name', async () => {
      const res = await post<ErrorResponse>('/api/v1/auth/register', {
        name: '',
        email: 'test@example.com',
        password: 'password123',
      })

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('should include requestId in all responses', async () => {
      const res = await post<AuthUserResponse>('/api/v1/auth/register', {
        name: 'Test',
        email: 'requestid-test@example.com',
        password: 'password123',
      })

      expect(res.requestId).not.toBeNull()
      expect(res.body.requestId).toBeTypeOf('string')
    })
  })

  // ────────────────────────────────────────
  // POST /api/v1/auth/login
  // ────────────────────────────────────────
  describe('POST /api/v1/auth/login', () => {
    // Helper: register a user before login tests
    async function registerUser(
      email = 'login@example.com',
      password = 'correctpassword',
    ) {
      await post('/api/v1/auth/register', {
        name: 'Login Test User',
        email,
        password,
      })
    }

    it('AC-04: should return 200 with accessToken, expiresIn, and user', async () => {
      await registerUser()

      const res = await post<LoginResponse>('/api/v1/auth/login', {
        email: 'login@example.com',
        password: 'correctpassword',
      })

      expect(res.status).toBe(200)
      expect(res.body.data.accessToken).toBeTypeOf('string')
      expect(res.body.data.accessToken.length).toBeGreaterThan(0)
      expect(res.body.data.expiresIn).toBe('1h')
      expect(res.body.data.user).toMatchObject({
        name: 'Login Test User',
        email: 'login@example.com',
        role: 'learner',
      })
      expect(res.body.data.user.id).toBeTypeOf('number')
      expect(res.body.requestId).toBeTypeOf('string')
      // Should NOT contain passwordHash
      expect(res.body.data.user).not.toHaveProperty('passwordHash')
    })

    it('AC-05: should return 401 with generic message for wrong email', async () => {
      await registerUser()

      const res = await post<ErrorResponse>('/api/v1/auth/login', {
        email: 'nonexistent@example.com',
        password: 'correctpassword',
      })

      expect(res.status).toBe(401)
      expect(res.body.error.code).toBe('UNAUTHORIZED')
      // Generic message — must not reveal whether email or password is wrong
      expect(res.body.error.message).not.toContain('email')
      expect(res.body.error.message).not.toContain('password')
      expect(res.body.error.requestId).toBeTypeOf('string')
    })

    it('AC-05: should return 401 with generic message for wrong password', async () => {
      await registerUser()

      const res = await post<ErrorResponse>('/api/v1/auth/login', {
        email: 'login@example.com',
        password: 'wrongpassword123',
      })

      expect(res.status).toBe(401)
      expect(res.body.error.code).toBe('UNAUTHORIZED')
      expect(res.body.error.message).not.toContain('email')
      expect(res.body.error.message).not.toContain('password')
    })

    it('AC-05: should return the same error message for wrong email and wrong password', async () => {
      await registerUser()

      const wrongEmailRes = await post<ErrorResponse>('/api/v1/auth/login', {
        email: 'nonexistent@example.com',
        password: 'anypassword1',
      })

      const wrongPasswordRes = await post<ErrorResponse>('/api/v1/auth/login', {
        email: 'login@example.com',
        password: 'wrongpassword123',
      })

      expect(wrongEmailRes.body.error.message).toBe(
        wrongPasswordRes.body.error.message,
      )
    })
  })

  // ────────────────────────────────────────
  // POST /api/v1/auth/logout
  // ────────────────────────────────────────
  describe('POST /api/v1/auth/logout', () => {
    async function getValidToken(): Promise<string> {
      await post('/api/v1/auth/register', {
        name: 'Logout User',
        email: 'logout@example.com',
        password: 'password1234',
      })

      const loginRes = await post<LoginResponse>('/api/v1/auth/login', {
        email: 'logout@example.com',
        password: 'password1234',
      })

      return loginRes.body.data.accessToken
    }

    it('AC-08: should return 204 No Content with valid token', async () => {
      const token = await getValidToken()

      const res = await post('/api/v1/auth/logout', {}, {
        Authorization: `Bearer ${token}`,
      })

      expect(res.status).toBe(204)
    })

    it('AC-07: should return 401 without token', async () => {
      const res = await post<ErrorResponse>('/api/v1/auth/logout', {})

      expect(res.status).toBe(401)
      expect(res.body.error.code).toBe('UNAUTHORIZED')
      expect(res.body.error.requestId).toBeTypeOf('string')
    })

    it('AC-07: should return 401 with invalid token', async () => {
      const res = await post<ErrorResponse>('/api/v1/auth/logout', {}, {
        Authorization: 'Bearer invalid-token-value',
      })

      expect(res.status).toBe(401)
      expect(res.body.error.code).toBe('UNAUTHORIZED')
    })
  })
})
