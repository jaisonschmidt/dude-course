/**
 * Shared OpenAPI response schemas used across route definitions.
 * These define the standard response shapes documented in docs/api-spec.md.
 */

export const errorResponseSchema = {
  type: 'object' as const,
  properties: {
    error: {
      type: 'object' as const,
      properties: {
        code: { type: 'string' as const },
        message: { type: 'string' as const },
        details: {},
        requestId: { type: 'string' as const },
      },
      required: ['code', 'message', 'requestId'],
    },
  },
  required: ['error'],
}

export function successResponse(dataSchema: Record<string, unknown>) {
  return {
    type: 'object' as const,
    properties: {
      data: dataSchema,
      requestId: { type: 'string' as const },
    },
    required: ['data', 'requestId'],
  }
}

export function paginatedResponse(itemSchema: Record<string, unknown>) {
  return {
    type: 'object' as const,
    properties: {
      data: {
        type: 'array' as const,
        items: itemSchema,
      },
      meta: {
        type: 'object' as const,
        properties: {
          page: { type: 'integer' as const },
          pageSize: { type: 'integer' as const },
          totalItems: { type: 'integer' as const },
          totalPages: { type: 'integer' as const },
        },
        required: ['page', 'pageSize', 'totalItems', 'totalPages'],
      },
      requestId: { type: 'string' as const },
    },
    required: ['data', 'meta', 'requestId'],
  }
}

// ── Common entity schemas ─────────────────────────────────────

export const userResponseSchema = {
  type: 'object' as const,
  properties: {
    id: { type: 'integer' as const },
    name: { type: 'string' as const },
    email: { type: 'string' as const },
    role: { type: 'string' as const },
  },
  required: ['id', 'name', 'email', 'role'],
}

export const courseResponseSchema = {
  type: 'object' as const,
  properties: {
    id: { type: 'integer' as const },
    title: { type: 'string' as const },
    description: { type: 'string' as const },
    thumbnailUrl: { type: 'string' as const, nullable: true },
    status: { type: 'string' as const },
    createdAt: { type: 'string' as const, format: 'date-time' },
    updatedAt: { type: 'string' as const, format: 'date-time' },
  },
  required: ['id', 'title', 'description', 'status', 'createdAt', 'updatedAt'],
}

export const lessonResponseSchema = {
  type: 'object' as const,
  properties: {
    id: { type: 'integer' as const },
    title: { type: 'string' as const },
    description: { type: 'string' as const, nullable: true },
    youtubeUrl: { type: 'string' as const },
    position: { type: 'integer' as const },
  },
  required: ['id', 'title', 'youtubeUrl', 'position'],
}

export const adminLessonResponseSchema = {
  type: 'object' as const,
  properties: {
    id: { type: 'integer' as const },
    courseId: { type: 'integer' as const },
    title: { type: 'string' as const },
    description: { type: 'string' as const, nullable: true },
    youtubeUrl: { type: 'string' as const },
    position: { type: 'integer' as const },
    createdAt: { type: 'string' as const, format: 'date-time' },
    updatedAt: { type: 'string' as const, format: 'date-time' },
  },
  required: ['id', 'courseId', 'title', 'youtubeUrl', 'position', 'createdAt', 'updatedAt'],
}

export const enrollmentResponseSchema = {
  type: 'object' as const,
  properties: {
    id: { type: 'integer' as const },
    userId: { type: 'integer' as const },
    courseId: { type: 'integer' as const },
    startedAt: { type: 'string' as const, format: 'date-time' },
  },
  required: ['id', 'userId', 'courseId', 'startedAt'],
}

export const lessonProgressResponseSchema = {
  type: 'object' as const,
  properties: {
    id: { type: 'integer' as const },
    userId: { type: 'integer' as const },
    courseId: { type: 'integer' as const },
    lessonId: { type: 'integer' as const },
    completedAt: { type: 'string' as const, format: 'date-time' },
  },
  required: ['id', 'userId', 'courseId', 'lessonId', 'completedAt'],
}

export const certificateResponseSchema = {
  type: 'object' as const,
  properties: {
    id: { type: 'integer' as const },
    certificateCode: { type: 'string' as const },
    issuedAt: { type: 'string' as const, format: 'date-time' },
    courseName: { type: 'string' as const },
    learnerName: { type: 'string' as const },
  },
  required: ['id', 'certificateCode', 'issuedAt', 'courseName', 'learnerName'],
}

export const dashboardResponseSchema = {
  type: 'object' as const,
  properties: {
    inProgress: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          courseId: { type: 'integer' as const },
          title: { type: 'string' as const },
          thumbnailUrl: { type: 'string' as const, nullable: true },
          progress: {
            type: 'object' as const,
            properties: {
              completed: { type: 'integer' as const },
              total: { type: 'integer' as const },
              percentage: { type: 'number' as const },
            },
            required: ['completed', 'total', 'percentage'],
          },
        },
        required: ['courseId', 'title', 'progress'],
      },
    },
    completed: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          courseId: { type: 'integer' as const },
          title: { type: 'string' as const },
          completedAt: { type: 'string' as const, format: 'date-time' },
        },
        required: ['courseId', 'title', 'completedAt'],
      },
    },
    certificates: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          courseId: { type: 'integer' as const },
          title: { type: 'string' as const },
          certificateCode: { type: 'string' as const },
          issuedAt: { type: 'string' as const, format: 'date-time' },
        },
        required: ['courseId', 'title', 'certificateCode', 'issuedAt'],
      },
    },
  },
  required: ['inProgress', 'completed', 'certificates'],
}
