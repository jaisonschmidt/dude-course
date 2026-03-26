import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import Fastify from 'fastify'
import type { FastifyInstance } from 'fastify'
import { registerErrorHandler } from '../../../src/middlewares/error-handler.js'

describe('Error Handler', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = Fastify({
      logger: false,
      genReqId: (req) => {
        const incoming = req.headers['x-request-id']
        return typeof incoming === 'string' && incoming.length > 0
          ? incoming
          : `req-${Math.random().toString(36).slice(2)}`
      },
    })
    registerErrorHandler(app)

    app.get('/test-generic-error', async () => {
      throw new Error('Something went wrong')
    })

    app.get('/test-not-found', async (_request, reply) => {
      const error = new Error('Resource not found') as Error & { statusCode: number }
      error.statusCode = 404
      return reply.send(error)
    })

    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should include requestId in error response', async () => {
    const response = await app.inject({ method: 'GET', url: '/test-generic-error' })
    const body = JSON.parse(response.body) as { error: { requestId: string } }

    expect(body.error.requestId).toBeDefined()
    expect(typeof body.error.requestId).toBe('string')
  })

  it('should follow { error: { code, message, requestId } } response format', async () => {
    const response = await app.inject({ method: 'GET', url: '/test-generic-error' })
    const body = JSON.parse(response.body) as { error: Record<string, unknown> }

    expect(body.error).toHaveProperty('code')
    expect(body.error).toHaveProperty('message')
    expect(body.error).toHaveProperty('requestId')
  })

  it('should return 500 for unhandled errors', async () => {
    const response = await app.inject({ method: 'GET', url: '/test-generic-error' })

    expect(response.statusCode).toBe(500)
    const body = JSON.parse(response.body) as { error: { code: string } }
    expect(body.error.code).toBe('INTERNAL_ERROR')
  })

  it('should use requestId from X-Request-Id header when provided', async () => {
    const customId = 'error-test-request-id'
    const response = await app.inject({
      method: 'GET',
      url: '/test-generic-error',
      headers: { 'x-request-id': customId },
    })

    const body = JSON.parse(response.body) as { error: { requestId: string } }
    expect(body.error.requestId).toBe(customId)
  })
})
