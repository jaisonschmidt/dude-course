import fp from 'fastify-plugin'
import type { FastifyInstance } from 'fastify'
import { env } from '../config/env.js'

async function swaggerPlugin(app: FastifyInstance): Promise<void> {
  // Guard: do not register Swagger in production — zero exposure
  if (env.NODE_ENV === 'production') return

  const fastifySwagger = await import('@fastify/swagger')
  const fastifySwaggerUi = await import('@fastify/swagger-ui')

  await app.register(fastifySwagger.default, {
    openapi: {
      info: {
        title: 'Dude Course API',
        description:
          'REST API for the Dude Course platform — online course management with enrollments, progress tracking, and certificates.',
        version: process.env['npm_package_version'] ?? '0.1.0',
      },
      servers: [
        { url: '/api/v1', description: 'API v1' },
      ],
      tags: [
        { name: 'Auth', description: 'Authentication endpoints' },
        { name: 'Courses', description: 'Public course catalog' },
        { name: 'Admin: Courses', description: 'Admin course management' },
        { name: 'Admin: Lessons', description: 'Admin lesson management' },
        { name: 'Enrollments', description: 'Course enrollment' },
        { name: 'Lesson Progress', description: 'Lesson completion tracking' },
        { name: 'Dashboard', description: 'Learner dashboard' },
        { name: 'Certificates', description: 'Course certificates' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  })

  await app.register(fastifySwaggerUi.default, {
    routePrefix: '/documentation',
  })
}

export default fp(swaggerPlugin, { name: 'swagger' })
