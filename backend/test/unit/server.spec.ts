import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { createTestServer } from '../helpers/test-server.js'

describe('Server', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await createTestServer()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /health', () => {
    it('should return 200 with { data: { status: ok }, requestId }', async () => {
      const response = await app.inject({ method: 'GET', url: '/health' })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body) as {
        data: { status: string; uptime: number; memoryUsedMb: number; timestamp: string; version: string }
        requestId: string
      }
      expect(body.data.status).toBe('ok')
      expect(typeof body.data.uptime).toBe('number')
      expect(typeof body.data.memoryUsedMb).toBe('number')
      expect(typeof body.data.timestamp).toBe('string')
      expect(body.requestId).toBeDefined()
      expect(typeof body.requestId).toBe('string')
    })

    it('should include X-Request-Id in response headers', async () => {
      const response = await app.inject({ method: 'GET', url: '/health' })

      expect(response.headers['x-request-id']).toBeDefined()
      expect(typeof response.headers['x-request-id']).toBe('string')
    })

    it('should use X-Request-Id from incoming request when provided', async () => {
      const customRequestId = 'custom-request-id-123'
      const response = await app.inject({
        method: 'GET',
        url: '/health',
        headers: { 'x-request-id': customRequestId },
      })

      expect(response.headers['x-request-id']).toBe(customRequestId)
      const body = JSON.parse(response.body) as { requestId: string }
      expect(body.requestId).toBe(customRequestId)
    })
  })
})
