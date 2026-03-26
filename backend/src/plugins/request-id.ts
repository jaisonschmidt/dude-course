import fp from 'fastify-plugin'
import type { FastifyInstance } from 'fastify'

async function requestIdPlugin(app: FastifyInstance): Promise<void> {
  app.addHook('onSend', async (request, reply) => {
    reply.header('X-Request-Id', request.id)
  })
}

export default fp(requestIdPlugin, { name: 'request-id' })
