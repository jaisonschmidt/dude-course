'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { CourseForm } from '@/components/admin'
import type { CourseFormData } from '@/components/admin'
import { createCourse } from '@/services/admin-course-service'

export default function NewCoursePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: CourseFormData) => {
    setLoading(true)
    setError(null)
    try {
      const course = await createCourse({
        title: data.title,
        description: data.description,
        thumbnailUrl: data.thumbnailUrl || undefined,
      })
      router.push(`/admin/courses/${course.id}/edit`)
    } catch {
      setError('Não foi possível criar o curso.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Novo Curso</h1>
      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <CourseForm onSubmit={handleSubmit} isLoading={loading} />
      </div>
    </div>
  )
}
