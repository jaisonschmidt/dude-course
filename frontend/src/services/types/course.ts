export interface Course {
  id: number
  title: string
  description: string
  thumbnailUrl: string | null
  status: 'draft' | 'published' | 'unpublished'
  createdAt: string
  updatedAt: string
}

export interface Lesson {
  id: number
  title: string
  description: string
  youtubeUrl: string
  position: number
}

export interface CourseWithLessons extends Course {
  lessons: Lesson[]
}

export interface PaginationMeta {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
  requestId: string
}
