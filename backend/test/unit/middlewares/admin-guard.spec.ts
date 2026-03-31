import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { adminGuardMiddleware } from '../../../src/middlewares/admin-guard.js'

// Mock logger
vi.mock('../../../src/utils/logger.js', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}))

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

describe('adminGuardMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should allow admin user to proceed', async () => {
    const request = createMockRequest()
    request.user = { id: 1, email: 'admin@example.com', role: 'admin' }
    const reply = createMockReply()

    await adminGuardMiddleware(request, reply)

    expect(reply.status).not.toHaveBeenCalled()
    expect(reply.send).not.toHaveBeenCalled()
  })

  it('should return 403 for learner user', async () => {
    const request = createMockRequest()
    request.user = { id: 2, email: 'learner@example.com', role: 'learner' }
    const reply = createMockReply()

    await adminGuardMiddleware(request, reply)

    expect(reply.status).toHaveBeenCalledWith(403)
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'FORBIDDEN',
          requestId: 'req-test-123',
        }),
      }),
    )
  })

  it('should return 401 if request.user is not set', async () => {
    const request = createMockRequest()
    // request.user is undefined
    const reply = createMockReply()

    await adminGuardMiddleware(request, reply)

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

  it('should return 403 for any non-admin role', async () => {
    const request = createMockRequest()
    request.user = { id: 3, email: 'mod@example.com', role: 'moderator' }
    const reply = createMockReply()

    await adminGuardMiddleware(request, reply)

    expect(reply.status).toHaveBeenCalledWith(403)
  })
})
