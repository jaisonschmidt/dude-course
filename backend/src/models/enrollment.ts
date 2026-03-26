export interface Enrollment {
  id: number
  userId: number
  courseId: number
  startedAt: Date
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateEnrollmentData {
  userId: number
  courseId: number
}
