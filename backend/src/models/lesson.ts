export interface Lesson {
  id: number
  courseId: number
  title: string
  description: string | null
  youtubeUrl: string
  position: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateLessonData {
  courseId: number
  title: string
  description?: string | null
  youtubeUrl: string
  position: number
}
