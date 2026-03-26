export type CourseStatus = 'draft' | 'published' | 'unpublished'

export interface Course {
  id: number
  title: string
  description: string
  thumbnailUrl: string | null
  status: CourseStatus
  createdAt: Date
  updatedAt: Date
}

export interface CreateCourseData {
  title: string
  description: string
  thumbnailUrl?: string | null
  status?: CourseStatus
}
