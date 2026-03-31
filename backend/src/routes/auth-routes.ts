import type { FastifyInstance } from 'fastify'
import type { AuthController } from '../controllers/auth-controller.js'
import { authMiddleware } from '../middlewares/auth.js'
import { RegisterRequestSchema, LoginRequestSchema } from '../dto/auth-dto.js'
import { zodToJsonSchema } from '../utils/zod-to-json-schema.js'
import {
  errorResponseSchema,
  successResponse,
  userResponseSchema,
} from '../dto/openapi-schemas.js'

const loginDataSchema = {
  type: 'object' as const,
  properties: {
    accessToken: { type: 'string' as const },
    expiresIn: { type: 'string' as const },
    user: userResponseSchema,
  },
  required: ['accessToken', 'expiresIn', 'user'],
}

export async function authRoutes(app: FastifyInstance, controller: AuthController): Promise<void> {
  app.post('/auth/register', {
    schema: {
      tags: ['Auth'],
      summary: 'Register a new user',
      description: 'Creates a new learner account. Returns user data without token — call POST /auth/login to obtain an access token.',
      body: zodToJsonSchema(RegisterRequestSchema),
      response: {
        201: successResponse(userResponseSchema),
        400: errorResponseSchema,
        409: errorResponseSchema,
      },
    },
  }, (request, reply) => controller.register(request, reply))

  app.post('/auth/login', {
    schema: {
      tags: ['Auth'],
      summary: 'Authenticate user',
      description: 'Returns a JWT access token and user profile.',
      body: zodToJsonSchema(LoginRequestSchema),
      response: {
        200: successResponse(loginDataSchema),
        401: errorResponseSchema,
      },
    },
  }, (request, reply) => controller.login(request, reply))

  app.post('/auth/logout', {
    schema: {
      tags: ['Auth'],
      summary: 'Logout (client-side)',
      description: 'Stateless logout — client should discard the token. Returns 204 No Content.',
      security: [{ bearerAuth: [] }],
      response: {
        204: { type: 'null' as const, description: 'No Content' },
        401: errorResponseSchema,
      },
    },
    preHandler: [authMiddleware],
  }, (request, reply) => controller.logout(request, reply))
}
