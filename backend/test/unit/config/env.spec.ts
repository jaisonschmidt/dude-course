import { describe, it, expect, vi, afterEach } from 'vitest'

describe('env config', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  describe('when JWT_SECRET is too short', () => {
    it('should throw an error with a descriptive message', async () => {
      vi.stubEnv('JWT_SECRET', 'short-secret')
      vi.resetModules()

      await expect(import('../../../src/config/env.js')).rejects.toThrow(
        'Invalid environment variables',
      )
    })
  })

  describe('when JWT_SECRET is missing', () => {
    it('should throw an error', async () => {
      vi.stubEnv('JWT_SECRET', '')
      vi.resetModules()

      await expect(import('../../../src/config/env.js')).rejects.toThrow(
        'Invalid environment variables',
      )
    })
  })

  describe('when all required vars are valid', () => {
    it('should not throw and export a valid env object', async () => {
      vi.stubEnv('JWT_SECRET', 'valid-secret-key-minimum-32-characters-long')
      vi.stubEnv('DATABASE_URL', 'mysql://test:test@localhost:3306/test_db')
      vi.stubEnv('NODE_ENV', 'test')
      vi.resetModules()

      const { env } = await import('../../../src/config/env.js')
      expect(env.JWT_SECRET).toBe('valid-secret-key-minimum-32-characters-long')
      expect(env.PORT).toBe(3001)
      expect(env.NODE_ENV).toBe('test')
    })
  })
})
