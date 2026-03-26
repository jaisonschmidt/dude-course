/**
 * Health check integration tests.
 *
 * These tests validate that a running backend instance responds correctly.
 * By default they run against BACKEND_URL (default: http://localhost:3001).
 *
 * To run against a live server:
 *   BACKEND_URL=http://localhost:3001 pnpm --filter integration-tests test
 *
 * In CI, ensure the backend and DB containers are healthy before running these.
 *
 * NOTE: These tests are skipped in offline environments via `skipIf`.
 */

import { describe, it, expect } from 'vitest'
import { get } from '../helpers/request.js'

// Integration tests require a live backend. They run only when RUN_INTEGRATION_TESTS=true.
const shouldRun = process.env['RUN_INTEGRATION_TESTS'] === 'true'
const describeOrSkip = shouldRun ? describe : describe.skip

describeOrSkip('GET /health', () => {
  it('should return 200 with status ok', async () => {
    const res = await get<{ data: { status: string }; requestId: string }>('/health')

    expect(res.status).toBe(200)
    expect(res.body.data.status).toBe('ok')
  })

  it('should include X-Request-Id header in the response', async () => {
    const res = await get('/health')

    expect(res.requestId).not.toBeNull()
    expect(typeof res.requestId).toBe('string')
    expect((res.requestId as string).length).toBeGreaterThan(0)
  })

  it('should propagate X-Request-Id when provided by the client', async () => {
    const clientRequestId = 'test-req-id-health-check'
    const res = await get('/health', { 'x-request-id': clientRequestId })

    expect(res.requestId).toBe(clientRequestId)
  })

  it('should include process metrics in data', async () => {
    const res = await get<{
      data: { uptime: number; memoryUsedMb: number; timestamp: string; version: string }
    }>('/health')

    expect(typeof res.body.data.uptime).toBe('number')
    expect(typeof res.body.data.memoryUsedMb).toBe('number')
    expect(typeof res.body.data.timestamp).toBe('string')
  })
})
