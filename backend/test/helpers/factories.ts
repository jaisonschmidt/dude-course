/**
 * Test data factories.
 *
 * These builders generate test domain entities with sensible defaults
 * and support overrides. Each factory ensures unique constraint values
 * (email, certificate_code) using timestamps and random values.
 *
 * Usage:
 *   const user = createUserFactory({ email: 'custom@example.com' })
 *   const course = createCourseFactory()
 */

import type { User, CreateUserData } from '../../src/models/user.js'
import type { Course, CreateCourseData } from '../../src/models/course.js'
import type { Lesson, CreateLessonData } from '../../src/models/lesson.js'
import type {
  Enrollment,
  CreateEnrollmentData,
} from '../../src/models/enrollment.js'
import type {
  LessonProgress,
  CreateLessonProgressData,
} from '../../src/models/lesson-progress.js'
import type {
  Certificate,
  CreateCertificateData,
} from '../../src/models/certificate.js'

let userSequence = 0
let courseSequence = 0
let lessonSequence = 0
let enrollmentSequence = 0
let progressSequence = 0
let certificateSequence = 0

/**
 * Generate a unique identifier suffix for unique constraints.
 */
function uniqueSuffix(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(7)}`
}

/**
 * Create a User entity with defaults.
 */
export function createUserFactory(overrides?: Partial<User>): User {
  userSequence++
  const suffix = uniqueSuffix()

  return {
    id: 1000 + userSequence,
    name: `Test User ${userSequence}`,
    email: `user-${suffix}@example.com`,
    passwordHash: '$2b$10$examplehashedpassword', // dummy bcrypt hash
    role: 'learner',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/**
 * Create a User creation DTO with defaults.
 */
export function createUserCreateDataFactory(
  overrides?: Partial<CreateUserData>,
): CreateUserData {
  const suffix = uniqueSuffix()

  return {
    name: 'Test User',
    email: `user-${suffix}@example.com`,
    passwordHash: '$2b$10$examplehashedpassword',
    role: 'learner',
    ...overrides,
  }
}

/**
 * Create a Course entity with defaults.
 */
export function createCourseFactory(overrides?: Partial<Course>): Course {
  courseSequence++

  return {
    id: 2000 + courseSequence,
    title: `Test Course ${courseSequence}`,
    description: 'A test course description',
    thumbnailUrl: null,
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/**
 * Create a Course creation DTO with defaults.
 */
export function createCourseCreateDataFactory(
  overrides?: Partial<CreateCourseData>,
): CreateCourseData {
  courseSequence++

  return {
    title: `Test Course ${courseSequence}`,
    description: 'A test course description',
    status: 'draft',
    ...overrides,
  }
}

/**
 * Create a Lesson entity with defaults.
 */
export function createLessonFactory(overrides?: Partial<Lesson>): Lesson {
  lessonSequence++

  return {
    id: 3000 + lessonSequence,
    courseId: 2000,
    title: `Test Lesson ${lessonSequence}`,
    description: 'A test lesson description',
    youtubeUrl: 'https://youtube.com/watch?v=example',
    position: lessonSequence,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/**
 * Create a Lesson creation DTO with defaults.
 */
export function createLessonCreateDataFactory(
  overrides?: Partial<CreateLessonData>,
): CreateLessonData {
  lessonSequence++

  return {
    courseId: 2000,
    title: `Test Lesson ${lessonSequence}`,
    description: 'A test lesson description',
    youtubeUrl: 'https://youtube.com/watch?v=example',
    position: lessonSequence,
    ...overrides,
  }
}

/**
 * Create an Enrollment entity with defaults.
 */
export function createEnrollmentFactory(
  overrides?: Partial<Enrollment>,
): Enrollment {
  enrollmentSequence++

  return {
    id: 4000 + enrollmentSequence,
    userId: 1000,
    courseId: 2000,
    startedAt: new Date(),
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/**
 * Create an Enrollment creation DTO with defaults.
 */
export function createEnrollmentCreateDataFactory(
  overrides?: Partial<CreateEnrollmentData>,
): CreateEnrollmentData {
  return {
    userId: 1000,
    courseId: 2000,
    ...overrides,
  }
}

/**
 * Create a LessonProgress entity with defaults.
 */
export function createLessonProgressFactory(
  overrides?: Partial<LessonProgress>,
): LessonProgress {
  progressSequence++

  return {
    id: 5000 + progressSequence,
    userId: 1000,
    courseId: 2000,
    lessonId: 3000,
    completedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/**
 * Create a LessonProgress creation DTO with defaults.
 */
export function createLessonProgressCreateDataFactory(
  overrides?: Partial<CreateLessonProgressData>,
): CreateLessonProgressData {
  return {
    userId: 1000,
    courseId: 2000,
    lessonId: 3000,
    ...overrides,
  }
}

/**
 * Create a Certificate entity with defaults.
 */
export function createCertificateFactory(
  overrides?: Partial<Certificate>,
): Certificate {
  certificateSequence++
  const suffix = uniqueSuffix()

  return {
    id: 6000 + certificateSequence,
    userId: 1000,
    courseId: 2000,
    certificateCode: `CERT-${suffix}`,
    issuedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/**
 * Create a Certificate creation DTO with defaults.
 */
export function createCertificateCreateDataFactory(
  overrides?: Partial<CreateCertificateData>,
): CreateCertificateData {
  const suffix = uniqueSuffix()

  return {
    userId: 1000,
    courseId: 2000,
    certificateCode: `CERT-${suffix}`,
    ...overrides,
  }
}
