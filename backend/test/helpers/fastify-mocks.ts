import type { FastifyRequest, FastifyReply } from 'fastify'
import { vi } from 'vitest'

/**
 * Creates a mock FastifyRequest with sensible defaults.
 */
export function createMockRequest(overrides: Record<string, unknown> = {}): FastifyRequest {
  return {
    id: 'test-req-id',
    body: {},
    params: {},
    query: {},
    user: undefined,
    ...overrides,
  } as unknown as FastifyRequest
}

/**
 * Creates a mock FastifyReply with chainable `.status().send()`.
 */
export function createMockReply() {
  const reply = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn(),
  }
  return reply as unknown as FastifyReply & {
    status: ReturnType<typeof vi.fn>
    send: ReturnType<typeof vi.fn>
  }
}
