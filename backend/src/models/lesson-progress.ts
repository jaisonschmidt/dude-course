export interface LessonProgress {
  id: number
  userId: number
  courseId: number
  lessonId: number
  completedAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface CreateLessonProgressData {
  userId: number
  courseId: number
  lessonId: number
}
