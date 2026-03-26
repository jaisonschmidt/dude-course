import type { FastifyError, FastifyInstance } from 'fastify'
import { ZodError } from 'zod'
import { logger } from '../utils/logger.js'
import { env } from '../config/env.js'

type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_ERROR'

function httpStatusToCode(status: number): ErrorCode {
  switch (status) {
    case 400:
      return 'VALIDATION_ERROR'
    case 401:
      return 'UNAUTHORIZED'
    case 403:
      return 'FORBIDDEN'
    case 404:
      return 'NOT_FOUND'
    case 409:
      return 'CONFLICT'
    default:
      return 'INTERNAL_ERROR'
  }
}

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error: FastifyError, request, reply) => {
    const requestId = request.id

    if (error instanceof ZodError) {
      const details = error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details,
          requestId,
        },
      })
    }

    const statusCode = (error as { statusCode?: number }).statusCode ?? 500
    const code = httpStatusToCode(statusCode)

    if (statusCode >= 500) {
      logger.error(
        {
          requestId,
          err: {
            name: error.name,
            message: error.message,
            stack: env.NODE_ENV !== 'production' ? error.stack : undefined,
          },
        },
        'Internal server error',
      )
    }

    const message =
      statusCode >= 500 && env.NODE_ENV === 'production'
        ? 'Internal server error'
        : error.message

    return reply.status(statusCode).send({
      error: {
        code,
        message,
        requestId,
      },
    })
  })
}
