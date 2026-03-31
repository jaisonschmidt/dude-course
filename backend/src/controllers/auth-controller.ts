import type { FastifyRequest, FastifyReply } from 'fastify'
import type { AuthService } from '../services/auth-service.js'
import { RegisterRequestSchema, LoginRequestSchema } from '../dto/auth-dto.js'
import { logger } from '../utils/logger.js'
import { UnauthorizedError } from '../models/errors.js'

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async register(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = RegisterRequestSchema.parse(request.body)
    const user = await this.authService.register(body)

    logger.info(
      { requestId: request.id, userId: user.id },
      'user.registered',
    )

    return reply.status(201).send({ data: user, requestId: request.id })
  }

  async login(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = LoginRequestSchema.parse(request.body)

    try {
      const result = await this.authService.login(body)

      logger.info(
        { requestId: request.id, userId: result.user.id },
        'user.login.success',
      )

      return reply.status(200).send({ data: result, requestId: request.id })
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        logger.warn(
          { requestId: request.id },
          'user.login.failure',
        )
      }
      throw error
    }
  }

  async logout(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    return reply.status(204).send()
  }
}
