'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Course } from '@/services/types/course'

interface CourseCardProps {
  course: Course
}

const FALLBACK_THUMBNAIL = '/images/course-placeholder.svg'

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link
      href={`/courses/${course.id}`}
      className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
      data-testid={`course-card-${course.id}`}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        <Image
          src={course.thumbnailUrl || FALLBACK_THUMBNAIL}
          alt={`Thumbnail de ${course.title}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = FALLBACK_THUMBNAIL
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="mb-1 line-clamp-2 text-lg font-semibold text-gray-900 group-hover:text-blue-600">
          {course.title}
        </h3>
        <p className="line-clamp-2 text-sm text-gray-600">{course.description}</p>
      </div>
    </Link>
  )
}
