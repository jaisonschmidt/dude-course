import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LessonItemProps {
  courseId: number
  lessonId: number
  title: string
  position: number
  isCompleted?: boolean
  isActive?: boolean
}

export function LessonItem({
  courseId,
  lessonId,
  title,
  position,
  isCompleted = false,
  isActive = false,
}: LessonItemProps) {
  return (
    <Link
      href={`/courses/${courseId}/lessons/${lessonId}`}
      className={cn(
        'flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors',
        isActive
          ? 'bg-blue-50 font-semibold text-blue-700'
          : 'hover:bg-gray-50',
      )}
    >
      <span
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs',
          isCompleted
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-500',
        )}
        aria-label={isCompleted ? 'Concluída' : 'Pendente'}
      >
        {isCompleted ? '✓' : position}
      </span>
      <span className="flex-1 truncate">{title}</span>
    </Link>
  )
}
