import type { Course } from '@/services/types/course'
import { CourseCard } from './CourseCard'
import { EmptyState } from '@/components/ui/EmptyState'

interface CourseListProps {
  courses: Course[]
  emptyMessage?: string
}

export function CourseList({ courses, emptyMessage = 'Nenhum curso disponível no momento.' }: CourseListProps) {
  if (courses.length === 0) {
    return (
      <div data-testid="course-list">
        <EmptyState message={emptyMessage} icon="📚" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="course-list">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  )
}
