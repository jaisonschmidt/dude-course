import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthController } from '../../../src/controllers/auth-controller.js'
import type { AuthService } from '../../../src/services/auth-service.js'
import { createMockRequest, createMockReply } from '../../helpers/fastify-mocks.js'
import { UnauthorizedError } from '../../../src/models/errors.js'

vi.mock('../../../src/utils/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

function createMockAuthService(): AuthService {
  return {
    register: vi.fn(),
    login: vi.fn(),
  } as unknown as AuthService
}

describe('AuthController', () => {
  let controller: AuthController
  let mockService: AuthService

  beforeEach(() => {
    vi.clearAllMocks()
    mockService = createMockAuthService()
    controller = new AuthController(mockService)
  })

  describe('register', () => {
    it('should return 201 with user data on successful registration', async () => {
      const userData = { id: 1, name: 'Jane', email: 'jane@example.com', role: 'learner' }
      vi.mocked(mockService.register).mockResolvedValue(userData)

      const request = createMockRequest({
        body: { name: 'Jane', email: 'jane@example.com', password: 'ValidPassword1!' },
      })
      const reply = createMockReply()

      await controller.register(request, reply)

      expect(reply.status).toHaveBeenCalledWith(201)
      expect(reply.send).toHaveBeenCalledWith({
        data: userData,
        requestId: 'test-req-id',
      })
    })

    it('should call authService.register with parsed body', async () => {
      vi.mocked(mockService.register).mockResolvedValue({ id: 1, name: 'X', email: 'x@x.com', role: 'learner' })

      const request = createMockRequest({
        body: { name: 'X', email: 'x@x.com', password: 'ValidPassword1!' },
      })
      const reply = createMockReply()

      await controller.register(request, reply)

      expect(mockService.register).toHaveBeenCalledWith({
        name: 'X',
        email: 'x@x.com',
        password: 'ValidPassword1!',
      })
    })
  })

  describe('login', () => {
    it('should return 200 with token and user on successful login', async () => {
      const loginResult = {
        user: { id: 1, name: 'Jane', email: 'jane@example.com', role: 'learner' },
        accessToken: 'jwt-token',
        expiresIn: '24h',
      }
      vi.mocked(mockService.login).mockResolvedValue(loginResult)

      const request = createMockRequest({
        body: { email: 'jane@example.com', password: 'ValidPassword1!' },
      })
      const reply = createMockReply()

      await controller.login(request, reply)

      expect(reply.status).toHaveBeenCalledWith(200)
      expect(reply.send).toHaveBeenCalledWith({
        data: loginResult,
        requestId: 'test-req-id',
      })
    })

    it('should log warning on login failure with UnauthorizedError', async () => {
      vi.mocked(mockService.login).mockRejectedValue(new UnauthorizedError('Invalid credentials'))

      const { logger } = await import('../../../src/utils/logger.js')

      const request = createMockRequest({
        body: { email: 'jane@example.com', password: 'wrong' },
      })
      const reply = createMockReply()

      await expect(controller.login(request, reply)).rejects.toThrow(UnauthorizedError)
      expect(logger.warn).toHaveBeenCalledWith(
        { requestId: 'test-req-id' },
        'user.login.failure',
      )
    })

    it('should re-throw non-UnauthorizedError errors without logging warning', async () => {
      vi.mocked(mockService.login).mockRejectedValue(new Error('DB down'))

      const request = createMockRequest({
        body: { email: 'jane@example.com', password: 'ValidPassword1!' },
      })
      const reply = createMockReply()

      await expect(controller.login(request, reply)).rejects.toThrow('DB down')
    })
  })

  describe('logout', () => {
    it('should return 204 with no content', async () => {
      const request = createMockRequest()
      const reply = createMockReply()

      await controller.logout(request, reply)

      expect(reply.status).toHaveBeenCalledWith(204)
      expect(reply.send).toHaveBeenCalled()
    })
  })
})
