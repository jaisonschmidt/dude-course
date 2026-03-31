/**
 * Type guard for Prisma known-request errors.
 * Uses duck-typing so the backend package doesn't need a direct
 * dependency on @prisma/client (it comes through the `database` workspace package).
 */
interface PrismaKnownRequestError {
  name: string
  code: string
}

function isPrismaKnownRequestError(error: unknown): error is PrismaKnownRequestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'name' in error &&
    (error as PrismaKnownRequestError).name === 'PrismaClientKnownRequestError'
  )
}

/**
 * Check if an error is a Prisma unique constraint violation (P2002).
 * Used to handle TOCTOU race conditions gracefully.
 */
export function isUniqueConstraintError(error: unknown): boolean {
  return isPrismaKnownRequestError(error) && error.code === 'P2002'
}

/**
 * Check if an error is a Prisma "record not found" error (P2025).
 * Used in repository update/delete methods to distinguish
 * "not found" from other errors.
 */
export function isRecordNotFoundError(error: unknown): boolean {
  return isPrismaKnownRequestError(error) && error.code === 'P2025'
}
