import type { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { logger } from '../utils/logger.js'

export interface AuthUser {
  id: number
  email: string
  role: string
}

interface JwtPayload {
  sub: number
  email: string
  role: string
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser
  }
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const authHeader = request.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn(
      { requestId: request.id },
      'Auth middleware: missing or malformed Authorization header',
    )
    return reply.status(401).send({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid authentication token',
        requestId: request.id,
      },
    })
  }

  const token = authHeader.slice(7) // Remove 'Bearer '

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as unknown as JwtPayload

    request.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    }
  } catch (err) {
    logger.warn(
      { requestId: request.id, error: (err as Error).name },
      'Auth middleware: token verification failed',
    )
    return reply.status(401).send({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid authentication token',
        requestId: request.id,
      },
    })
  }
}
