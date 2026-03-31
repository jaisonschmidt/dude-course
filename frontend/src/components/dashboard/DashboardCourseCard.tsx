/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { ProgressBar } from '@/components/course/ProgressBar'
import type { DashboardProgress } from '@/services/types/dashboard'

interface DashboardCourseCardProps {
  courseId: number
  title: string
  thumbnailUrl: string | null
  progress: DashboardProgress
}

export function DashboardCourseCard({
  courseId,
  title,
  thumbnailUrl,
  progress,
}: DashboardCourseCardProps) {
  return (
    <Link
      href={`/courses/${courseId}`}
      className="block rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-gray-100">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            Sem imagem
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="mb-2 font-semibold text-gray-900 line-clamp-2">{title}</h3>
        <ProgressBar
          completed={progress.completed}
          total={progress.total}
        />
        <p className="mt-1 text-xs text-gray-500">
          {progress.completed}/{progress.total} aulas concluídas
        </p>
      </div>
    </Link>
  )
}
