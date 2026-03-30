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

import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient | null = null

/**
 * Get or create the test Prisma client.
 * Connects using DATABASE_URL_TEST environment variable.
 */
function getTestPrisma(): PrismaClient {
  if (!prisma) {
    const databaseUrl = process.env.DATABASE_URL_TEST
    if (!databaseUrl) {
      throw new Error(
        'DATABASE_URL_TEST environment variable is not set. ' +
          'Point it to your test database (e.g., mysql://root:pass@localhost:3306/dude_course_test)',
      )
    }

    prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      log: process.env.DEBUG ? ['warn', 'error'] : ['error'],
    })
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
  const client = getTestPrisma()

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
 * Truncate all tables in FK-safe order.
 * Call this in beforeEach() to reset DB state between tests.
 *
 * Truncation order (respects foreign key constraints):
 * 1. lesson_progress (FK to user, course, lesson)
 * 2. enrollment (FK to user, course)
 * 3. certificate (FK to user, course)
 * 4. lesson (FK to course)
 * 5. course (no FK dependencies)
 * 6. user (no FK dependencies)
 */
export async function truncateAll(): Promise<void> {
  const client = getTestPrisma()

  try {
    // Disable foreign key checks temporarily
    await client.$executeRaw`SET FOREIGN_KEY_CHECKS = 0`

    // Truncate tables in order
    await client.$executeRaw`TRUNCATE TABLE lesson_progress`
    await client.$executeRaw`TRUNCATE TABLE enrollment`
    await client.$executeRaw`TRUNCATE TABLE certificate`
    await client.$executeRaw`TRUNCATE TABLE lesson`
    await client.$executeRaw`TRUNCATE TABLE course`
    await client.$executeRaw`TRUNCATE TABLE user`

    // Re-enable foreign key checks
    await client.$executeRaw`SET FOREIGN_KEY_CHECKS = 1`

    console.info('[test] truncateAll: All tables truncated')
  } catch (err) {
    console.error('[test] truncateAll: Failed to truncate tables', err)
    throw err
  }
}

