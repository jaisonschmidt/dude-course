import type { Lesson } from '@/services/types/course'
import { LessonItem } from './LessonItem'

interface LessonListProps {
  courseId: number
  lessons: Lesson[]
  completedLessonIds?: number[]
  activeLessonId?: number
}

export function LessonList({
  courseId,
  lessons,
  completedLessonIds = [],
  activeLessonId,
}: LessonListProps) {
  const sorted = [...lessons].sort((a, b) => a.position - b.position)

  if (sorted.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-gray-500" data-testid="lesson-list-empty">
        Este curso ainda não possui aulas.
      </p>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-gray-100" data-testid="lesson-list">
      {sorted.map((lesson) => (
        <LessonItem
          key={lesson.id}
          courseId={courseId}
          lessonId={lesson.id}
          title={lesson.title}
          position={lesson.position}
          isCompleted={completedLessonIds.includes(lesson.id)}
          isActive={activeLessonId === lesson.id}
        />
      ))}
    </div>
  )
}
