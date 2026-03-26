/**
 * Database helper for integration tests.
 *
 * Sets up and tears down the test database. Requires:
 *   - DATABASE_URL_TEST env variable pointing to a dedicated test database
 *   - The test DB to be pre-created (CREATE DATABASE dude_course_test)
 *
 * Usage (in test file):
 *   import { setupDb, teardownDb } from '../helpers/db.js'
 *   beforeAll(setupDb)
 *   afterAll(teardownDb)
 */

// NOTE: This helper is a stub for the integration test baseline.
// Full Prisma-based setup/teardown will be added when integration tests
// are actively executed against a running MySQL test database.

export async function setupDb(): Promise<void> {
  // TODO: When a real DB is available:
  // 1. Connect Prisma client using DATABASE_URL_TEST
  // 2. Run migrations: await prisma.$executeRaw`...` or `prisma migrate deploy`
  // 3. Seed minimal test data
  console.info('[test] setupDb: stub — no real DB connected in baseline')
}

export async function teardownDb(): Promise<void> {
  // TODO: Truncate test tables or roll back transactions
  console.info('[test] teardownDb: stub — no real DB connected in baseline')
}
