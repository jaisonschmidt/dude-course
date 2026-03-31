import { describe, it, expect, afterEach } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { createTestServer } from '../../helpers/test-server.js'

/**
 * These tests verify the Swagger plugin's conditional behavior:
 * - Swagger UI is available in dev/staging/test (test env uses createTestServer)
 * - OpenAPI JSON contains expected metadata and security schemes
 *
 * Note: The production guard (`if (NODE_ENV === 'production') return`) is
 * verified structurally — the plugin early-returns before any registration.
 * A full integration test with NODE_ENV=production would require process
 * isolation (separate Vitest project), which is deferred to integration-tests.
 */

describe('Swagger Plugin', () => {
  let app: FastifyInstance | undefined

  afterEach(async () => {
    if (app) {
      await app.close()
      app = undefined
    }
  })

  describe('when NODE_ENV=test (via createTestServer)', () => {
    it('should serve Swagger UI at /documentation', async () => {
      app = await createTestServer()

      const response = await app.inject({
        method: 'GET',
        url: '/documentation/static/index.html',
      })

      // @fastify/swagger-ui may redirect /documentation → /documentation/static/index.html
      // Accept both 200 (direct) and 302 (redirect) as valid
      expect([200, 302]).toContain(response.statusCode)
    })

    it('should serve OpenAPI JSON at /documentation/json', async () => {
      app = await createTestServer()

      const response = await app.inject({
        method: 'GET',
        url: '/documentation/json',
      })

      expect(response.statusCode).toBe(200)
      const spec = JSON.parse(response.body) as {
        openapi: string
        info: { title: string; version: string }
      }
      expect(spec.openapi).toMatch(/^3\./)
      expect(spec.info.title).toBe('Dude Course API')
    })

    it('should include bearerAuth security scheme in OpenAPI spec', async () => {
      app = await createTestServer()

      const response = await app.inject({
        method: 'GET',
        url: '/documentation/json',
      })

      const spec = JSON.parse(response.body) as {
        components: {
          securitySchemes: {
            bearerAuth: { type: string; scheme: string; bearerFormat: string }
          }
        }
      }
      expect(spec.components.securitySchemes.bearerAuth).toBeDefined()
      expect(spec.components.securitySchemes.bearerAuth.type).toBe('http')
      expect(spec.components.securitySchemes.bearerAuth.scheme).toBe('bearer')
      expect(spec.components.securitySchemes.bearerAuth.bearerFormat).toBe('JWT')
    })

    it('should include all expected tags in OpenAPI spec', async () => {
      app = await createTestServer()

      const response = await app.inject({
        method: 'GET',
        url: '/documentation/json',
      })

      const spec = JSON.parse(response.body) as {
        tags: Array<{ name: string }>
      }
      const tagNames = spec.tags.map((t) => t.name)
      expect(tagNames).toContain('Auth')
      expect(tagNames).toContain('Courses')
      expect(tagNames).toContain('Admin: Courses')
      expect(tagNames).toContain('Admin: Lessons')
      expect(tagNames).toContain('Enrollments')
      expect(tagNames).toContain('Lesson Progress')
      expect(tagNames).toContain('Dashboard')
      expect(tagNames).toContain('Certificates')
    })

    it('should include API routes in OpenAPI spec paths', async () => {
      app = await createTestServer()

      const response = await app.inject({
        method: 'GET',
        url: '/documentation/json',
      })

      const spec = JSON.parse(response.body) as {
        paths: Record<string, unknown>
      }
      const paths = Object.keys(spec.paths)

      // Verify key endpoints exist in the spec
      const hasAuthRegister = paths.some((p) => p.includes('auth/register'))
      const hasAuthLogin = paths.some((p) => p.includes('auth/login'))
      const hasCourses = paths.some((p) => p.endsWith('/courses') || p.endsWith('/courses/'))
      const hasDashboard = paths.some((p) => p.includes('me/dashboard'))

      expect(hasAuthRegister).toBe(true)
      expect(hasAuthLogin).toBe(true)
      expect(hasCourses).toBe(true)
      expect(hasDashboard).toBe(true)
    })

    it('should not expose sensitive data in schema examples', async () => {
      app = await createTestServer()

      const response = await app.inject({
        method: 'GET',
        url: '/documentation/json',
      })

      const specText = response.body
      // Ensure no real tokens or passwords leak in the spec
      expect(specText).not.toContain('password_hash')
      expect(specText).not.toContain('jwt-token-example')
    })
  })
})
