// Test environment setup: ensure required env vars are present before any module loads
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'mysql://test:test@localhost:3306/test_db'
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? 'test-secret-key-minimum-32-characters-long'
process.env.NODE_ENV = 'test'
process.env.LOG_LEVEL = 'error'
process.env.PORT = process.env.PORT ?? '3001'
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN ?? '*'
