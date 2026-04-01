import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import type { Course } from '@/services/types/course'

interface AdminCourseCardProps {
  course: Course
  onPublish: (id: number) => void
  onUnpublish: (id: number) => void
  onDelete: (id: number) => void
}

const statusLabel: Record<string, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  unpublished: 'Despublicado',
}

export function AdminCourseCard({
  course,
  onPublish,
  onUnpublish,
  onDelete,
}: AdminCourseCardProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm" data-testid={`admin-course-card-${course.id}`}>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/courses/${course.id}/edit`}
            className="font-semibold text-gray-900 hover:text-blue-600"
          >
            {course.title}
          </Link>
          <Badge variant={course.status}>{statusLabel[course.status]}</Badge>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Criado em{' '}
          {new Date(course.createdAt).toLocaleDateString('pt-BR')}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href={`/admin/courses/${course.id}/edit`}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
          data-testid={`admin-course-edit-${course.id}`}
        >
          Editar
        </Link>
        <Link
          href={`/admin/courses/${course.id}/lessons`}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          data-testid={`admin-course-lessons-${course.id}`}
        >
          Aulas
        </Link>
        {course.status !== 'published' ? (
          <button
            onClick={() => onPublish(course.id)}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-50"
            data-testid={`admin-course-publish-${course.id}`}
          >
            Publicar
          </button>
        ) : (
          <button
            onClick={() => onUnpublish(course.id)}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-yellow-600 hover:bg-yellow-50"
            data-testid={`admin-course-unpublish-${course.id}`}
          >
            Despublicar
          </button>
        )}
        <button
          onClick={() => onDelete(course.id)}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
          data-testid={`admin-course-delete-${course.id}`}
        >
          Deletar
        </button>
      </div>
    </div>
  )
}
