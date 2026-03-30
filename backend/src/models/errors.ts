/**
 * Application error classes.
 *
 * These errors carry HTTP semantics (statusCode) but live in the models
 * layer, keeping the service layer framework-agnostic.
 * The global error handler in middlewares/error-handler.ts maps statusCode
 * to the appropriate API error code.
 */

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Invalid credentials') {
    super(message, 401)
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404)
  }
}
