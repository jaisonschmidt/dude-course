'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { Button } from '@/components/ui/Button'
import { AdminCourseCard, ConfirmModal } from '@/components/admin'
import {
  listAllCourses,
  publishCourse,
  unpublishCourse,
  deleteCourse,
} from '@/services/admin-course-service'
import type { Course } from '@/services/types/course'

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [unpublishTarget, setUnpublishTarget] = useState<number | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchCourses = useCallback(async () => {
    try {
      setError(null)
      const { courses: data } = await listAllCourses()
      setCourses(data)
    } catch {
      setError('Não foi possível carregar os cursos.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const handlePublish = useCallback(async (id: number) => {
    setActionLoading(true)
    try {
      const updated = await publishCourse(id)
      setCourses((prev) => prev.map((c) => (c.id === id ? updated : c)))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao publicar curso.'
      setError(message)
    } finally {
      setActionLoading(false)
    }
  }, [])

  const handleUnpublish = useCallback(async () => {
    if (!unpublishTarget) return
    setActionLoading(true)
    try {
      const updated = await unpublishCourse(unpublishTarget)
      setCourses((prev) => prev.map((c) => (c.id === unpublishTarget ? updated : c)))
      setUnpublishTarget(null)
    } catch {
      setError('Erro ao despublicar curso.')
    } finally {
      setActionLoading(false)
    }
  }, [unpublishTarget])

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    setActionLoading(true)
    try {
      await deleteCourse(deleteTarget)
      setCourses((prev) => prev.filter((c) => c.id !== deleteTarget))
      setDeleteTarget(null)
    } catch {
      setError('Erro ao deletar curso.')
    } finally {
      setActionLoading(false)
    }
  }, [deleteTarget])

  if (loading) return <LoadingSpinner />

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Cursos</h1>
        <Link href="/admin/courses/new">
          <Button data-testid="admin-create-course-button">Novo Curso</Button>
        </Link>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {courses.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-500">Nenhum curso cadastrado.</p>
          <Link href="/admin/courses/new" className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline">
            Criar primeiro curso
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <AdminCourseCard
              key={course.id}
              course={course}
              onPublish={handlePublish}
              onUnpublish={(id) => setUnpublishTarget(id)}
              onDelete={(id) => setDeleteTarget(id)}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Deletar Curso"
        message="Tem certeza que deseja deletar este curso? Esta ação não pode ser desfeita."
        confirmLabel="Deletar"
        loading={actionLoading}
      />

      <ConfirmModal
        isOpen={unpublishTarget !== null}
        onClose={() => setUnpublishTarget(null)}
        onConfirm={handleUnpublish}
        title="Despublicar Curso"
        message="Tem certeza que deseja despublicar este curso? Ele ficará invisível no catálogo."
        confirmLabel="Despublicar"
        loading={actionLoading}
      />
    </div>
  )
}
