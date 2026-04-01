import { apiPost, apiPatch, apiDelete } from './api'

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'admin@dudecourse.local'
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'Admin@123456'

interface LoginResponse {
  accessToken: string
  expiresIn: string
  user: { id: number; name: string; email: string; role: string }
}

interface RegisterResponse {
  id: number
  name: string
  email: string
  role: string
}

interface CourseResponse {
  id: number
  title: string
  description: string
  thumbnailUrl: string | null
  status: string
}

interface LessonResponse {
  id: number
  courseId: number
  title: string
  youtubeUrl: string
  position: number
}

/**
 * Login as the seeded admin user.
 * Requires that `pnpm --filter database db:seed` has been run.
 */
export async function loginAsAdmin(): Promise<string> {
  const { status, body } = await apiPost<LoginResponse>('/auth/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  })
  if (status !== 200) {
    throw new Error(`Admin login failed (${status}): ${JSON.stringify(body)}`)
  }
  return (body as { data: LoginResponse }).data.accessToken
}

/**
 * Register a new learner via API.
 */
export async function registerLearner(data: {
  name: string
  email: string
  password: string
}): Promise<RegisterResponse> {
  const { status, body } = await apiPost<RegisterResponse>('/auth/register', data)
  if (status !== 201) {
    throw new Error(`Learner registration failed (${status}): ${JSON.stringify(body)}`)
  }
  return (body as { data: RegisterResponse }).data
}

/**
 * Login as a learner and return token + user info.
 */
export async function loginAsLearner(
  email: string,
  password: string,
): Promise<{ token: string; user: LoginResponse['user'] }> {
  const { status, body } = await apiPost<LoginResponse>('/auth/login', {
    email,
    password,
  })
  if (status !== 200) {
    throw new Error(`Learner login failed (${status}): ${JSON.stringify(body)}`)
  }
  const data = (body as { data: LoginResponse }).data
  return { token: data.accessToken, user: data.user }
}

/**
 * Create a course via admin API (status: draft).
 */
export async function createCourse(
  adminToken: string,
  data: { title: string; description: string; thumbnailUrl?: string },
): Promise<CourseResponse> {
  const { status, body } = await apiPost<CourseResponse>('/courses', data, adminToken)
  if (status !== 201) {
    throw new Error(`Course creation failed (${status}): ${JSON.stringify(body)}`)
  }
  return (body as { data: CourseResponse }).data
}

/**
 * Add a lesson to a course via admin API.
 */
export async function addLesson(
  adminToken: string,
  courseId: number,
  data: { title: string; youtubeUrl: string; position: number; description?: string },
): Promise<LessonResponse> {
  const { status, body } = await apiPost<LessonResponse>(
    `/courses/${courseId}/lessons`,
    data,
    adminToken,
  )
  if (status !== 201) {
    throw new Error(`Lesson creation failed (${status}): ${JSON.stringify(body)}`)
  }
  return (body as { data: LessonResponse }).data
}

/**
 * Publish a course via admin API.
 */
export async function publishCourse(
  adminToken: string,
  courseId: number,
): Promise<CourseResponse> {
  const { status, body } = await apiPatch<CourseResponse>(
    `/courses/${courseId}/publish`,
    undefined,
    adminToken,
  )
  if (status !== 200) {
    throw new Error(`Course publish failed (${status}): ${JSON.stringify(body)}`)
  }
  return (body as { data: CourseResponse }).data
}

/**
 * Convenience: seed a complete published course with lessons.
 */
export async function seedPublishedCourseWithLessons(
  adminToken: string,
  options?: {
    title?: string
    description?: string
    lessonCount?: number
  },
): Promise<{ course: CourseResponse; lessons: LessonResponse[] }> {
  const title = options?.title || 'E2E Test Course'
  const description = options?.description || 'Course created for E2E testing'
  const lessonCount = options?.lessonCount || 3

  const course = await createCourse(adminToken, { title, description })

  const lessons: LessonResponse[] = []
  for (let i = 1; i <= lessonCount; i++) {
    const lesson = await addLesson(adminToken, course.id, {
      title: `Lesson ${i}`,
      youtubeUrl: `https://www.youtube.com/watch?v=e2etest${i}`,
      position: i,
      description: `E2E test lesson ${i}`,
    })
    lessons.push(lesson)
  }

  const publishedCourse = await publishCourse(adminToken, course.id)
  return { course: publishedCourse, lessons }
}

/**
 * Unpublish a course via admin API.
 */
export async function unpublishCourse(
  adminToken: string,
  courseId: number,
): Promise<CourseResponse> {
  const { status, body } = await apiPatch<CourseResponse>(
    `/courses/${courseId}/unpublish`,
    undefined,
    adminToken,
  )
  if (status !== 200) {
    throw new Error(`Course unpublish failed (${status}): ${JSON.stringify(body)}`)
  }
  return (body as { data: CourseResponse }).data
}

/**
 * Delete a course via admin API.
 */
export async function deleteCourse(
  adminToken: string,
  courseId: number,
): Promise<void> {
  const { status } = await apiDelete(`/courses/${courseId}`, adminToken)
  if (status !== 200 && status !== 204) {
    throw new Error(`Course delete failed (${status})`)
  }
}

/**
 * Reorder lessons via admin API.
 */
export async function reorderLessons(
  adminToken: string,
  courseId: number,
  lessons: Array<{ lessonId: number; position: number }>,
): Promise<void> {
  const { status, body } = await apiPatch(
    `/courses/${courseId}/lessons/reorder`,
    { lessons } as unknown as Record<string, unknown>,
    adminToken,
  )
  if (status !== 200) {
    throw new Error(`Lesson reorder failed (${status}): ${JSON.stringify(body)}`)
  }
}
