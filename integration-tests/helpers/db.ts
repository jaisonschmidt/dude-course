/**
 * Database helper for integration tests.
 *
 * Sets up and tears down the test database. Requires:
 *   - DATABASE_URL_TEST env variable pointing to a dedicated test database
 *   - The test DB to be pre-created (CREATE DATABASE dude_course_test)
 *
 * Usage (in test file):
 *   import { setupDb, teardownDb, truncateAll } from '../helpers/db.js'
 *   beforeAll(setupDb)
 *   beforeEach(truncateAll)
 *   afterAll(teardownDb)
 */

type TestPrisma = {
  $queryRaw: (query: TemplateStringsArray, ...values: unknown[]) => Promise<unknown>
  $executeRaw: (query: TemplateStringsArray, ...values: unknown[]) => Promise<unknown>
  $disconnect: () => Promise<void>
}

let prisma: TestPrisma | null = null

/**
 * Get or create the test Prisma client.
 * Connects using DATABASE_URL_TEST environment variable.
 */
async function getOrCreateTestPrisma(): Promise<TestPrisma> {
  if (!prisma) {
    const databaseUrl = process.env.DATABASE_URL_TEST ?? process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error(
        'DATABASE_URL_TEST (or DATABASE_URL) environment variable is not set. ' +
          'Point it to your test database (e.g., mysql://root:pass@localhost:3306/dude_course_test)',
      )
    }

    process.env.DATABASE_URL = databaseUrl
    const database = await import('database')
    prisma = database.prisma as TestPrisma
  }

  return prisma
}

/**
 * Set up the test database:
 * 1. Connect to the test DB
 * 2. Run migrations to create schema
 * 3. Ensure it's ready for tests
 */
export async function setupDb(): Promise<void> {
  const client = await getOrCreateTestPrisma()

  try {
    // Run migrations to ensure schema is up-to-date
    // Using Prisma $executeRawUnsafe to run migrations directly
    // (or use: await execa('pnpm', ['run', 'db:migrate:deploy'], { cwd: 'database' }))

    // For now, verify connection by running a simple query
    await client.$queryRaw`SELECT 1`

    console.info('[test] setupDb: Test database connected and ready')
  } catch (err) {
    console.error('[test] setupDb: Failed to connect to test database', err)
    throw err
  }
}

/**
 * Tear down the test database:
 * Disconnect the Prisma client cleanly.
 */
export async function teardownDb(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect()
    prisma = null
    console.info('[test] teardownDb: Test database disconnected')
  }
}

/**
 * Delete all rows from all tables in FK-safe order.
 * Call this in beforeEach() to reset DB state between tests.
 *
 * Uses DELETE FROM instead of TRUNCATE TABLE because:
 * - Prisma uses connection pooling, so SET FOREIGN_KEY_CHECKS = 0
 *   may run on a different connection than the TRUNCATE statements,
 *   causing FK constraint errors in MySQL.
 * - DELETE FROM in correct dependency order (children → parents)
 *   respects FK constraints naturally without needing to toggle checks.
 *
 * Deletion order (children first):
 * 1. lesson_progress (FK → users, courses, lessons)
 * 2. enrollments (FK → users, courses)
 * 3. certificates (FK → users, courses)
 * 4. lessons (FK → courses)
 * 5. courses (no FK dependents after above deletions)
 * 6. users (no FK dependents after above deletions)
 */
export async function truncateAll(): Promise<void> {
  const client = await getOrCreateTestPrisma()

  try {
    // Delete in FK-safe order: children before parents
    await client.$executeRaw`DELETE FROM lesson_progress`
    await client.$executeRaw`DELETE FROM enrollments`
    await client.$executeRaw`DELETE FROM certificates`
    await client.$executeRaw`DELETE FROM lessons`
    await client.$executeRaw`DELETE FROM courses`
    await client.$executeRaw`DELETE FROM users`

    console.info('[test] truncateAll: All tables cleaned')
  } catch (err) {
    console.error('[test] truncateAll: Failed to clean tables', err)
    throw err
  }
}

/**
 * Get the test Prisma client (must call setupDb first).
 * Useful for direct DB assertions in tests.
 */
export function getTestPrisma(): TestPrisma {
  if (!prisma) {
    throw new Error('Test Prisma client not initialised. Call setupDb() first.')
  }
  return prisma
}
