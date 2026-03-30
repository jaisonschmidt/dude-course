import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { authMiddleware } from '../../../src/middlewares/auth.js'

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
  },
}))

// Mock env — provide JWT_SECRET for middleware
vi.mock('../../../src/config/env.js', () => ({
  env: {
    JWT_SECRET: 'test-secret-that-is-at-least-32-characters-long',
    LOG_LEVEL: 'silent',
    NODE_ENV: 'test',
  },
}))

// Mock logger
vi.mock('../../../src/utils/logger.js', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}))

import jwt from 'jsonwebtoken'

function createMockRequest(overrides: Partial<FastifyRequest> = {}): FastifyRequest {
  return {
    id: 'req-test-123',
    headers: {},
    ...overrides,
  } as unknown as FastifyRequest
}

function createMockReply(): FastifyReply {
  const reply = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  }
  return reply as unknown as FastifyReply
}

describe('authMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should populate request.user when token is valid', async () => {
    const request = createMockRequest({
      headers: { authorization: 'Bearer valid-token' },
    } as Partial<FastifyRequest>)
    const reply = createMockReply()

    vi.mocked(jwt.verify).mockReturnValue({
      sub: 42,
      email: 'jane@example.com',
      role: 'learner',
    } as never)

    await authMiddleware(request, reply)

    expect(request.user).toEqual({
      id: 42,
      email: 'jane@example.com',
      role: 'learner',
    })
    expect(reply.status).not.toHaveBeenCalled()
  })

  it('should return 401 when Authorization header is missing', async () => {
    const request = createMockRequest({ headers: {} } as Partial<FastifyRequest>)
    const reply = createMockReply()

    await authMiddleware(request, reply)

    expect(reply.status).toHaveBeenCalledWith(401)
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'UNAUTHORIZED',
          requestId: 'req-test-123',
        }),
      }),
    )
  })

  it('should return 401 when Authorization header has no Bearer prefix', async () => {
    const request = createMockRequest({
      headers: { authorization: 'Basic some-token' },
    } as Partial<FastifyRequest>)
    const reply = createMockReply()

    await authMiddleware(request, reply)

    expect(reply.status).toHaveBeenCalledWith(401)
  })

  it('should return 401 when token is invalid', async () => {
    const request = createMockRequest({
      headers: { authorization: 'Bearer invalid-token' },
    } as Partial<FastifyRequest>)
    const reply = createMockReply()

    vi.mocked(jwt.verify).mockImplementation(() => {
      throw new Error('invalid token')
    })

    await authMiddleware(request, reply)

    expect(reply.status).toHaveBeenCalledWith(401)
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'UNAUTHORIZED',
          requestId: 'req-test-123',
        }),
      }),
    )
  })

  it('should return 401 when token is expired', async () => {
    const request = createMockRequest({
      headers: { authorization: 'Bearer expired-token' },
    } as Partial<FastifyRequest>)
    const reply = createMockReply()

    const expiredError = new Error('jwt expired')
    expiredError.name = 'TokenExpiredError'
    vi.mocked(jwt.verify).mockImplementation(() => {
      throw expiredError
    })

    await authMiddleware(request, reply)

    expect(reply.status).toHaveBeenCalledWith(401)
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'UNAUTHORIZED',
          requestId: 'req-test-123',
        }),
      }),
    )
  })

  it('should never include the full token in the error response', async () => {
    const request = createMockRequest({
      headers: { authorization: 'Bearer some-secret-token-value' },
    } as Partial<FastifyRequest>)
    const reply = createMockReply()

    vi.mocked(jwt.verify).mockImplementation(() => {
      throw new Error('invalid signature')
    })

    await authMiddleware(request, reply)

    const sentPayload = vi.mocked(reply.send).mock.calls[0]?.[0]
    const stringified = JSON.stringify(sentPayload)
    expect(stringified).not.toContain('some-secret-token-value')
  })
})
