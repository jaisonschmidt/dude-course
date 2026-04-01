'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { getCourse } from '@/services/course-service'
import { markLessonComplete } from '@/services/enrollment-service'
import type { CourseWithLessons, Lesson } from '@/services/types/course'
import { YouTubePlayer } from '@/components/course/YouTubePlayer'
import { LessonList } from '@/components/course/LessonList'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'

export default function LessonPlayerPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = Number(params.id)
  const lessonId = Number(params.lessonId)
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const [course, setCourse] = useState<CourseWithLessons | null>(null)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [markingComplete, setMarkingComplete] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const sortedLessons = course?.lessons
    ? [...course.lessons].sort((a, b) => a.position - b.position)
    : []
  const currentIndex = sortedLessons.findIndex((l) => l.id === lessonId)
  const prevLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const courseData = await getCourse(courseId)
      setCourse(courseData)
      const foundLesson = courseData.lessons.find((l) => l.id === lessonId)
      if (!foundLesson) {
        setError('Aula não encontrada.')
        return
      }
      setLesson(foundLesson)
    } catch {
      setError('Erro ao carregar a aula.')
    } finally {
      setLoading(false)
    }
  }, [courseId, lessonId])

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login')
        return
      }
      fetchData()
    }
  }, [authLoading, isAuthenticated, fetchData, router])

  const handleMarkComplete = async () => {
    setMarkingComplete(true)
    try {
      await markLessonComplete(courseId, lessonId)
      setIsCompleted(true)
    } catch {
      // Silently handle — idempotent
    } finally {
      setMarkingComplete(false)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !course || !lesson) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorMessage message={error ?? 'Aula não encontrada.'} onRetry={fetchData} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Main Content */}
        <div className="flex-1">
          <YouTubePlayer youtubeUrl={lesson.youtubeUrl} />

          <div className="mt-6">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm text-gray-500">Aula {lesson.position}</span>
              {isCompleted && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700" data-testid="lesson-completed-badge">
                  ✓ Concluída
                </span>
              )}
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">{lesson.title}</h1>
            <p className="mb-6 text-gray-600">{lesson.description}</p>

            <div className="flex flex-wrap items-center gap-3">
              {!isCompleted && (
                <Button onClick={handleMarkComplete} loading={markingComplete} data-testid="lesson-mark-complete-button">
                  Marcar como Concluída
                </Button>
              )}

              <div className="flex gap-2">
                {prevLesson && (
                  <Link
                    href={`/courses/${courseId}/lessons/${prevLesson.id}`}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    data-testid="lesson-prev-link"
                  >
                    ← Aula Anterior
                  </Link>
                )}
                {nextLesson && (
                  <Link
                    href={`/courses/${courseId}/lessons/${nextLesson.id}`}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    data-testid="lesson-next-link"
                  >
                    Próxima Aula →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar — Lesson List */}
        <aside className="w-full rounded-xl border border-gray-200 bg-white lg:w-80">
          <div className="border-b border-gray-200 p-4">
            <Link
              href={`/courses/${courseId}`}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              ← {course.title}
            </Link>
          </div>
          <div className="p-2">
            <LessonList
              courseId={courseId}
              lessons={course.lessons}
              activeLessonId={lessonId}
            />
          </div>
        </aside>
      </div>
    </div>
  )
}
