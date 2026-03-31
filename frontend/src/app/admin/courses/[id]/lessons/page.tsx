'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { LessonReorderList, LessonForm, ConfirmModal } from '@/components/admin'
import type { LessonFormData } from '@/components/admin'
import {
  addLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
} from '@/services/admin-lesson-service'
import { getAdminCourse } from '@/services/admin-course-service'
import type { Lesson } from '@/services/types/course'

export default function AdminLessonsPage() {
  const params = useParams()
  const courseId = Number(params.id)

  const [lessons, setLessons] = useState<Lesson[]>([])
  const [courseTitle, setCourseTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    async function fetchCourse() {
      try {
        const course = await getAdminCourse(courseId)
        setCourseTitle(course.title)
        setLessons(course.lessons.sort((a, b) => a.position - b.position))
      } catch {
        setError('Curso não encontrado.')
      } finally {
        setLoading(false)
      }
    }
    fetchCourse()
  }, [courseId])

  const handleAddLesson = useCallback(
    async (data: LessonFormData) => {
      setFormLoading(true)
      setError(null)
      try {
        const newLesson = await addLesson(courseId, {
          title: data.title,
          description: data.description || undefined,
          youtubeUrl: data.youtubeUrl,
          position: data.position,
        })
        setLessons((prev) =>
          [...prev, newLesson].sort((a, b) => a.position - b.position),
        )
        setShowAddForm(false)
      } catch {
        setError('Não foi possível adicionar a aula.')
      } finally {
        setFormLoading(false)
      }
    },
    [courseId],
  )

  const handleUpdateLesson = useCallback(
    async (data: LessonFormData) => {
      if (!editingLesson) return
      setFormLoading(true)
      setError(null)
      try {
        const updated = await updateLesson(courseId, editingLesson.id, {
          title: data.title,
          description: data.description || undefined,
          youtubeUrl: data.youtubeUrl,
          position: data.position,
        })
        setLessons((prev) =>
          prev
            .map((l) => (l.id === updated.id ? updated : l))
            .sort((a, b) => a.position - b.position),
        )
        setEditingLesson(null)
      } catch {
        setError('Não foi possível atualizar a aula.')
      } finally {
        setFormLoading(false)
      }
    },
    [courseId, editingLesson],
  )

  const handleDeleteLesson = useCallback(async () => {
    if (!deleteTarget) return
    setActionLoading(true)
    try {
      await deleteLesson(courseId, deleteTarget)
      setLessons((prev) => prev.filter((l) => l.id !== deleteTarget))
      setDeleteTarget(null)
    } catch {
      setError('Não foi possível deletar a aula.')
    } finally {
      setActionLoading(false)
    }
  }, [courseId, deleteTarget])

  const handleReorder = useCallback(
    async (reordered: Lesson[]) => {
      try {
        await reorderLessons(
          courseId,
          reordered.map((l) => ({ lessonId: l.id, position: l.position })),
        )
      } catch {
        setError('Não foi possível reordenar as aulas.')
      }
    },
    [courseId],
  )

  if (loading) return <LoadingSpinner />

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href={`/admin/courses/${courseId}/edit`}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Voltar para o curso
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            Aulas — {courseTitle}
          </h1>
        </div>
        <Button onClick={() => setShowAddForm(true)}>Adicionar Aula</Button>
      </div>

      {error && <div className="mb-4"><ErrorMessage message={error} /></div>}

      <LessonReorderList
        lessons={lessons}
        onReorder={handleReorder}
        onEdit={(lesson) => setEditingLesson(lesson)}
        onDelete={(lessonId) => setDeleteTarget(lessonId)}
      />

      {/* Add Lesson Modal */}
      <Modal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        title="Adicionar Aula"
        className="max-w-lg"
      >
        <LessonForm
          initialData={{ title: '', youtubeUrl: '', position: lessons.length + 1 }}
          onSubmit={handleAddLesson}
          onCancel={() => setShowAddForm(false)}
          isLoading={formLoading}
        />
      </Modal>

      {/* Edit Lesson Modal */}
      <Modal
        isOpen={editingLesson !== null}
        onClose={() => setEditingLesson(null)}
        title="Editar Aula"
        className="max-w-lg"
      >
        {editingLesson && (
          <LessonForm
            initialData={editingLesson}
            onSubmit={handleUpdateLesson}
            onCancel={() => setEditingLesson(null)}
            isLoading={formLoading}
          />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteLesson}
        title="Deletar Aula"
        message="Tem certeza que deseja deletar esta aula? Esta ação não pode ser desfeita."
        confirmLabel="Deletar"
        loading={actionLoading}
      />
    </div>
  )
}
