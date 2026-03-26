/**
 * Observability integration tests.
 *
 * Validate that requestId is always present in error responses,
 * and that the API's error shape follows the documented contract.
 *
 * NOTE: Tests are skipped in offline environments via CI_SKIP_INTEGRATION.
 */

import { describe, it, expect } from 'vitest'
import { get } from '../helpers/request.js'

// Integration tests require a live backend. They run only when RUN_INTEGRATION_TESTS=true.
const shouldRun = process.env['RUN_INTEGRATION_TESTS'] === 'true'
const describeOrSkip = shouldRun ? describe : describe.skip

describeOrSkip('Observability — error responses', () => {
  it('should return 404 with requestId for an unknown route', async () => {
    const res = await get<{ error: { code: string; message: string; requestId: string } }>(
      '/api/v1/rota-que-nao-existe',
    )

    expect(res.status).toBe(404)
    expect(res.body.error).toBeDefined()
    expect(res.body.error.requestId).toBeDefined()
    expect(typeof res.body.error.requestId).toBe('string')
    expect(res.body.error.requestId.length).toBeGreaterThan(0)
  })

  it('should include X-Request-Id header even on 404 responses', async () => {
    const res = await get('/api/v1/rota-que-nao-existe')

    expect(res.requestId).not.toBeNull()
  })

  it('should use the client-provided requestId in error responses', async () => {
    const clientId = 'observability-test-req-id'
    const res = await get<{ error: { requestId: string } }>(
      '/api/v1/rota-que-nao-existe',
      { 'x-request-id': clientId },
    )

    expect(res.body.error.requestId).toBe(clientId)
    expect(res.requestId).toBe(clientId)
  })
})
