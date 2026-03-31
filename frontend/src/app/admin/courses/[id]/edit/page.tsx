'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { CourseForm, ConfirmModal } from '@/components/admin'
import type { CourseFormData } from '@/components/admin'
import {
  getAdminCourse,
  updateCourse,
  publishCourse,
  unpublishCourse,
  deleteCourse,
} from '@/services/admin-course-service'
import type { CourseWithLessons } from '@/services/types/course'

const statusLabel: Record<string, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  unpublished: 'Despublicado',
}

export default function EditCoursePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = Number(params.id)

  const [course, setCourse] = useState<CourseWithLessons | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showUnpublishModal, setShowUnpublishModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    async function fetchCourse() {
      try {
        const data = await getAdminCourse(courseId)
        setCourse(data)
      } catch {
        setError('Curso não encontrado.')
      } finally {
        setLoading(false)
      }
    }
    fetchCourse()
  }, [courseId])

  const handleSave = useCallback(
    async (data: CourseFormData) => {
      setSaving(true)
      setError(null)
      setSuccess(null)
      try {
        const updated = await updateCourse(courseId, {
          title: data.title,
          description: data.description,
          thumbnailUrl: data.thumbnailUrl || null,
        })
        setCourse((prev) => (prev ? { ...prev, ...updated } : prev))
        setSuccess('Curso atualizado com sucesso!')
      } catch {
        setError('Não foi possível salvar o curso.')
      } finally {
        setSaving(false)
      }
    },
    [courseId],
  )

  const handlePublish = useCallback(async () => {
    setActionLoading(true)
    setError(null)
    try {
      const updated = await publishCourse(courseId)
      setCourse((prev) => (prev ? { ...prev, ...updated } : prev))
      setSuccess('Curso publicado!')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao publicar.'
      setError(message)
    } finally {
      setActionLoading(false)
    }
  }, [courseId])

  const handleUnpublish = useCallback(async () => {
    setActionLoading(true)
    try {
      const updated = await unpublishCourse(courseId)
      setCourse((prev) => (prev ? { ...prev, ...updated } : prev))
      setShowUnpublishModal(false)
      setSuccess('Curso despublicado.')
    } catch {
      setError('Erro ao despublicar.')
    } finally {
      setActionLoading(false)
    }
  }, [courseId])

  const handleDelete = useCallback(async () => {
    setActionLoading(true)
    try {
      await deleteCourse(courseId)
      router.push('/admin/courses')
    } catch {
      setError('Erro ao deletar curso.')
      setShowDeleteModal(false)
    } finally {
      setActionLoading(false)
    }
  }, [courseId, router])

  if (loading) return <LoadingSpinner />
  if (!course) return <ErrorMessage message="Curso não encontrado." />

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Editar Curso</h1>
          <Badge variant={course.status}>{statusLabel[course.status]}</Badge>
        </div>
        <Link href="/admin/courses" className="text-sm text-gray-500 hover:text-gray-700">
          ← Voltar
        </Link>
      </div>

      {error && <div className="mb-4"><ErrorMessage message={error} /></div>}
      {success && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <CourseForm
          initialData={course}
          onSubmit={handleSave}
          isLoading={saving}
        />
      </div>

      <div className="mt-6 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex gap-3">
          {course.status !== 'published' ? (
            <Button onClick={handlePublish} loading={actionLoading}>
              Publicar
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => setShowUnpublishModal(true)}
              loading={actionLoading}
            >
              Despublicar
            </Button>
          )}
          <Link href={`/admin/courses/${courseId}/lessons`}>
            <Button variant="secondary">
              Gerenciar Aulas ({course.lessons.length})
            </Button>
          </Link>
        </div>
        <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
          Deletar
        </Button>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Deletar Curso"
        message="Tem certeza que deseja deletar este curso? Esta ação não pode ser desfeita."
        confirmLabel="Deletar"
        loading={actionLoading}
      />

      <ConfirmModal
        isOpen={showUnpublishModal}
        onClose={() => setShowUnpublishModal(false)}
        onConfirm={handleUnpublish}
        title="Despublicar Curso"
        message="O curso ficará invisível no catálogo. Deseja continuar?"
        confirmLabel="Despublicar"
        loading={actionLoading}
      />
    </div>
  )
}
