'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/use-auth'
import { getCourse } from '@/services/course-service'
import { enrollInCourse } from '@/services/enrollment-service'
import { apiRequest } from '@/services/api'
import type { CourseWithLessons } from '@/services/types/course'
import { LessonList } from '@/components/course/LessonList'
import { ProgressBar } from '@/components/course/ProgressBar'
import { EnrollButton } from '@/components/course/EnrollButton'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'

interface DashboardCourse {
  courseId: number
  progress: { completed: number; total: number; percentage: number }
}

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = Number(params.id)
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const [course, setCourse] = useState<CourseWithLessons | null>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([])
  const [progress, setProgress] = useState<{ completed: number; total: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const courseData = await getCourse(courseId)
      setCourse(courseData)

      if (isAuthenticated) {
        try {
          const { data } = await apiRequest<{ inProgress: DashboardCourse[]; completed: { courseId: number }[] }>(
            '/me/dashboard',
          )
          const inProgress = data.inProgress.find((c) => c.courseId === courseId)
          const completed = data.completed.find((c) => c.courseId === courseId)

          if (inProgress || completed) {
            setIsEnrolled(true)
            if (inProgress) {
              setProgress({ completed: inProgress.progress.completed, total: inProgress.progress.total })
              // Fetch completed lesson IDs by checking dashboard data
              // We infer from progress data — lessons that are completed
              try {
                const { data: progressData } = await apiRequest<Array<{ lessonId: number }>>(
                  `/courses/${courseId}/enrollments`,
                )
                // If the API returns lesson progress, use it
                if (Array.isArray(progressData)) {
                  setCompletedLessonIds(progressData.map((p) => p.lessonId))
                }
              } catch {
                // Dashboard gives us enough info
              }
            } else if (completed) {
              setProgress({ completed: courseData.lessons.length, total: courseData.lessons.length })
              setCompletedLessonIds(courseData.lessons.map((l) => l.id))
            }
          }
        } catch {
          // Not enrolled or dashboard error — that's fine
        }
      }
    } catch {
      setError('Curso não encontrado.')
    } finally {
      setLoading(false)
    }
  }, [courseId, isAuthenticated])

  useEffect(() => {
    if (!authLoading) {
      fetchData()
    }
  }, [authLoading, fetchData])

  const handleEnroll = async () => {
    await enrollInCourse(courseId)
    setIsEnrolled(true)
    setProgress({ completed: 0, total: course?.lessons.length ?? 0 })
  }

  if (loading || authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorMessage message={error ?? 'Curso não encontrado.'} onRetry={fetchData} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Course Header */}
      <div className="mb-8 flex flex-col gap-6 lg:flex-row">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100 lg:w-96">
          <Image
            src={course.thumbnailUrl || '/images/course-placeholder.svg'}
            alt={course.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 384px"
          />
        </div>
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900" data-testid="course-detail-title">{course.title}</h1>
            <p className="mb-4 text-gray-600" data-testid="course-detail-description">{course.description}</p>
            <p className="text-sm text-gray-500" data-testid="course-detail-lesson-count">
              {course.lessons.length} {course.lessons.length === 1 ? 'aula' : 'aulas'}
            </p>
          </div>

          <div className="mt-4">
            {isAuthenticated ? (
              <div className="flex flex-col gap-3">
                <EnrollButton isEnrolled={isEnrolled} onEnroll={handleEnroll} />
                {isEnrolled && progress && (
                  <ProgressBar completed={progress.completed} total={progress.total} />
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
              >
                Faça login para iniciar
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Lesson List */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Aulas</h2>
        <LessonList
          courseId={courseId}
          lessons={course.lessons}
          completedLessonIds={completedLessonIds}
        />
      </div>
    </div>
  )
}
