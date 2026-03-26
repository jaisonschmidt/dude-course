import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import Fastify from 'fastify'
import { env } from './config/env.js'
import requestIdPlugin from './plugins/request-id.js'
import corsPlugin from './plugins/cors.js'
import { registerErrorHandler } from './middlewares/error-handler.js'
import { registerRoutes } from './routes/index.js'
import { logger } from './utils/logger.js'

export async function buildServer() {
  const app = Fastify({
    genReqId: (req) => {
      const incoming = req.headers['x-request-id']
      return typeof incoming === 'string' && incoming.length > 0
        ? incoming
        : crypto.randomUUID()
    },
    // logger: false — Fastify's internal request logger is disabled.
    // Application-level logs (errors, domain events, startup) use the
    // shared Pino logger directly (logger.info / logger.error).
    // Mixing loggerInstance causes type incompatibility in Fastify 5 + strict TS.
    logger: false,
  })

  await app.register(requestIdPlugin)
  await app.register(corsPlugin)

  registerErrorHandler(app)

  app.get('/health', async (request, reply) => {
    const mem = process.memoryUsage()
    return reply.send({
      data: {
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        version: process.env['npm_package_version'] ?? '0.1.0',
        memoryUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
      },
      requestId: request.id,
    })
  })

  app.get('/ready', async (request, reply) => {
    const checks: Record<string, 'ok' | 'error'> = {}
    let allReady = true

    checks.api = 'ok'

    // TODO: add database check here when Prisma is wired into the backend
    // e.g.:
    //   try { await prisma.$queryRaw`SELECT 1`; checks.db = 'ok' }
    //   catch { checks.db = 'error'; allReady = false }

    if (allReady) {
      return reply.status(200).send({
        data: { status: 'ready', checks },
        requestId: request.id,
      })
    }

    return reply.status(503).send({
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'One or more dependencies are not ready',
        details: checks,
        requestId: request.id,
      },
    })
  })

  await registerRoutes(app)

  return app
}

async function start(): Promise<void> {
  const app = await buildServer()
  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' })
    logger.info(
      {
        port: env.PORT,
        env: env.NODE_ENV,
        version: process.env['npm_package_version'] ?? '0.1.0',
        nodeVersion: process.version,
      },
      'Server started',
    )
  } catch (err) {
    logger.error(err, 'Failed to start server')
    process.exit(1)
  }
}

const currentFilePath = fileURLToPath(import.meta.url)
const isMain = resolve(process.argv[1] ?? '') === resolve(currentFilePath)

if (isMain) {
  start()
}
