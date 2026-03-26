import type { FastifyRequest, FastifyReply } from 'fastify'
import type { AuthService } from '../services/auth-service.js'
import { RegisterRequestSchema, LoginRequestSchema } from '../dto/auth-dto.js'

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async register(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    // TODO: implement after AuthService.register is ready
    const _body = RegisterRequestSchema.parse(request.body)
    // const user = await this.authService.register(_body)
    // return reply.status(201).send({ data: user, requestId: request.id })
    return reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'Not implemented', requestId: request.id } })
  }

  async login(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    // TODO: implement after AuthService.login is ready
    const _body = LoginRequestSchema.parse(request.body)
    // const result = await this.authService.login(_body)
    // return reply.status(200).send({ data: result, requestId: request.id })
    return reply.status(501).send({ error: { code: 'NOT_IMPLEMENTED', message: 'Not implemented', requestId: request.id } })
  }

  async logout(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    return reply.status(204).send()
  }
}
