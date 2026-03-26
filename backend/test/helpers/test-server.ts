import { buildServer } from '../../src/server.js'
import type { FastifyInstance } from 'fastify'

export async function createTestServer(): Promise<FastifyInstance> {
  return buildServer()
}
